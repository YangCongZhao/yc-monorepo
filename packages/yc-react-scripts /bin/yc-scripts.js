#!/usr/bin/env node
const path = require("path");
const { spawn } = require("child_process");

// Resolve webpack-cli directly to avoid PATH issues
let webpackCli;
try {
  webpackCli = require.resolve("webpack-cli/bin/cli.js");
} catch (e) {
  console.error("[yc-scripts] Cannot find webpack-cli in this project. Please install it (e.g., pnpm add -D webpack webpack-cli).");
  process.exit(1);
}

// Default config path (project's current working directory will be used by webpack for relative paths inside the config)
const defaultConfigPath = path.resolve(__dirname, "../config/webpack.common.js");

// Raw argv after the binary name
const raw = process.argv.slice(2);

// Known webpack-cli subcommands; keep extendable
const knownSubs = new Set(["serve", "build", "watch", "info", "help", "version"]);

// Find subcommand (first non-flag token that matches known)
let sub = "";
let flags = [];
for (let i = 0; i < raw.length; i++) {
  const a = raw[i];
  if (!a.startsWith("-") && knownSubs.has(a) && !sub) {
    sub = a;
  } else {
    flags.push(a);
  }
}

// Normalize --mode dev|prod to webpack-accepted values
const modeIdx = flags.findIndex((a) => a === "--mode" || a === "-m");
if (modeIdx !== -1 && flags[modeIdx + 1]) {
  const v = flags[modeIdx + 1].toLowerCase();
  if (v === "dev") flags[modeIdx + 1] = "development";
  if (v === "prod") flags[modeIdx + 1] = "production";
}

// Inject --config if user didn't pass it
const hasConfig = flags.some((a, i) => a === "--config" || a === "-c" || (i > 0 && (flags[i - 1] === "--config" || flags[i - 1] === "-c")));
if (!hasConfig) {
  flags = ["--config", defaultConfigPath, ...flags];
}

// Build final argv for webpack-cli
const finalArgv = [];
if (sub) finalArgv.push(sub);
finalArgv.push(...flags);

// Spawn node with webpack-cli
const child = spawn(process.execPath, [webpackCli, ...finalArgv], { stdio: "inherit" });

// Exit with the same code
child.on("exit", (code) => process.exit(code));
