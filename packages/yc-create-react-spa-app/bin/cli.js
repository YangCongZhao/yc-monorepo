#!/usr/bin/env node
const path = require("path");
const fs = require("fs-extra");
const parse = require("yargs-parser");
const { execa } = require("execa");

// ====== 可改：你的模板仓库、分支、子目录 ======
const DEFAULT_REPO = "YangCongZhao/yc-react-spa-app"; // GitHub user/repo
const DEFAULT_REF  = "main";                          // 分支或 tag
const DEFAULT_SUB  = "";                              // 若模板在子目录，例：templates/ts
// =================================================

(async () => {
    try {
        const argv = parse(process.argv.slice(2), {
            alias: { r: "repo", b: "ref", s: "subdir", pm: "packageManager" },
            string: ["repo", "ref", "subdir", "packageManager"]
        });

        const targetName = argv._[0];
        if (!targetName) {
            console.error("用法：yc-create-react-spa-app <project-name> [--repo user/repo] [--ref main] [--subdir path]");
            process.exit(1);
        }

        const repo  = argv.repo   || process.env.YC_TEMPLATE_REPO || DEFAULT_REPO;
        const ref   = argv.ref    || process.env.YC_TEMPLATE_REF  || DEFAULT_REF;
        const sub   = (argv.subdir || process.env.YC_TEMPLATE_SUB || DEFAULT_SUB).replace(/^\/+|\/+$/g, "");
        // const pm    = pickPM(argv.packageManager);

        const dest = path.resolve(process.cwd(), targetName);
        await ensureEmpty(dest);

        console.log("📥 正在下载模板...");
        await fetchTemplate({ repo, ref, subdir: sub, dest });

        // 清理潜在 .git
        await fs.remove(path.join(dest, ".git")).catch(()=>{});

        // // 写 package.json scripts + devDeps
        // const pkgFile = path.join(dest, "package.json");
        // if (!(await fs.pathExists(pkgFile))) {
        //     throw new Error(`模板缺少 package.json：${pkgFile}`);
        // }
        // const pkg = JSON.parse(await fs.readFile(pkgFile, "utf8"));
        //
        // // 保留用户已有 scripts，仅覆盖 start/build
        // pkg.scripts = {
        //     ...pkg.scripts,
        //     start: "yc-react-scripts serve --mode development",
        //     build: "yc-react-scripts build --mode production"
        // };
        //
        // // 确保依赖你的打包器
        // pkg.devDependencies = {
        //     ...(pkg.devDependencies || {}),
        //     "yc-react-scripts": pkg.devDependencies?.["yc-react-scripts"] || "^0.1.0"
        // };
        //
        // await fs.writeFile(pkgFile, JSON.stringify(pkg, null, 2));

        // 安装依赖
        // console.log(`📦 正在安装依赖（${pm}）...`);
        // await install(pm, dest);

    //     console.log(`\n✅ 项目创建完成！
    // cd ${targetName}
    // ${pm} ${pm === "npm" ? "run " : ""}start
    // `);
        } catch (e) {
            console.error(e?.message || e);
            process.exit(1);
        }
    })();

// function pickPM(explicit) {
//     if (explicit) return explicit;
//     const ua = process.env.npm_config_user_agent || "";
//     if (ua.includes("pnpm")) return "pnpm";
//     if (ua.includes("yarn")) return "yarn";
//     return "npm";
// }

async function ensureEmpty(dir) {
    await fs.mkdirp(dir);
    const list = await fs.readdir(dir);
    if (list.length > 0) {
        throw new Error(`目标目录非空：${dir}`);
    }
}

// 用 degit 拉取 GitHub 模板，支持分支 + 子目录
async function fetchTemplate({ repo, ref, subdir, dest }) {
    const { default: degit } = await import("degit");
    const refStr = ref ? `#${ref}` : "";
    const subStr = subdir ? `/${subdir}` : "";
    const src = `${repo}${subStr}${refStr}`;
    const emitter = degit(src, {
        force: true,
        verbose: false,
        cache: false
    });

    // 支持私有仓库：GITHUB_TOKEN
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) {
        emitter.on("info", () => {}); // 静音
        emitter.options.headers = { Authorization: `token ${token}` };
    }

    await emitter.clone(dest);
}

async function install(pm, cwd) {
    const opts = { cwd, stdio: "inherit" };
    if (pm === "pnpm") return execa("pnpm", ["install"], opts);
    if (pm === "yarn") return execa("yarn", [], opts);
    return execa("npm", ["install"], opts);
}
