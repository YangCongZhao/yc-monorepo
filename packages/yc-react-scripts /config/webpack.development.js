const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve, join } = require('path');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const notifier = require('node-notifier');
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const port = 3003;
module.exports = {
    devServer: {
        //单页的spa应用 使用起来
        historyApiFallback: true,
        static: {
            directory: resolve(process.cwd(), 'dist'),
        },
        hot: true,
        port,
    },
    output: {
        path: resolve(process.cwd(), 'dist'),
        publicPath: '/',
        filename: 'scripts/[name].bundle.js',
        assetModuleFilename: 'images/[name][ext]', // webpack 5 推荐不要再用 .[ext]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            // favicon: './public/favicon.ico',
            template: resolve(__dirname, 'src/index-dev.html'),
        }),
        new FriendlyErrorsWebpackPlugin({
            compilationSuccessInfo: {
                messages: ['You application is running here http://localhost:' + port],
                notes: ['💊 构建信息请及时关注窗口右上角'],
            },
            // new WebpackBuildNotifierPlugin({
            //   title: '💿 Solv Dvelopment Notification',
            //   logo,
            //   suppressSuccess: true,
            // }),
            onErrors: function (severity, errors) {
                if (severity !== 'error') {
                    return;
                }
                const error = errors[0];
                console.log(error);
                notifier.notify({
                    title: '👒 Webpack Build Error',
                    message: severity + ': ' + error.name,
                    subtitle: error.file || '',
                    icon: join(__dirname, 'icon.png'),
                });
            },
            clearConsole: true,
        }),
        new BundleAnalyzerPlugin(),
    ],
};
