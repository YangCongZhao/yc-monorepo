const merge = require('webpack-merge');
const argv = require('yargs-parser')(process.argv.slice(2));
const { resolve } = require('path');
const _mode = argv.mode || 'development';
const path = require("path");
// const _mergeConfig = require(`./config/webpack.${_mode}.js`);
const _mergeConfig  = require(path.resolve(__dirname, `./webpack.${_mode}.js`));
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const _modeflag = _mode === 'production';
// const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const WebpackBar = require('webpackbar');
const { ThemedProgressPlugin } = require('themed-progress-plugin');
const webpackBaseConfig = {
    entry: {
        main: resolve(process.cwd(),'src/index.tsx'),
    },
    output: {
        path: resolve(process.cwd(), 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /(node_modules)/,
                use: {
                    // `.swcrc` can be used to configure swc
                    loader: 'swc-loader',
                    options: {
                        jsc: {
                            parser: { syntax: 'typescript', tsx: true },
                            transform: { react: { runtime: 'automatic', development: process.env.NODE_ENV !== 'production' } }
                        }
                    }
                },

            },
            {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    // 'style-loader',
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                    'postcss-loader',
                ],
                // use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        alias: {
            '@': resolve('src/'),
            '@components': resolve('src/components'),
            '@hooks': resolve('src/hooks'),
            '@pages': resolve('src/pages'),
            '@routes': resolve('src/routes'),
            '@layouts': resolve('src/layouts'),
            '@assets': resolve('src/assets'),
            '@states': resolve('src/states'),
            '@service': resolve('src/service'),
            '@utils': resolve('src/utils'),
            '@lib': resolve('src/lib'),
            '@constants': resolve('src/constants'),
            '@connections': resolve('src/connections'),
            '@abis': resolve('src/abis'),
        },
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.css'],
        fallback: {
            // stream: require.resolve('stream-browserify'),
        },
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: _modeflag ? 'styles/[name].[contenthash:5].css' : 'styles/[name].css',
            chunkFilename: _modeflag ? 'styles/[name].[contenthash:5].css' : 'styles/[name].css',
            ignoreOrder: false,
        }),
        new ThemedProgressPlugin(),
    ],
};
module.exports = merge.default(webpackBaseConfig, _mergeConfig);
