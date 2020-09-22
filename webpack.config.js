/*
 * @Author: shichuyu
 * @Date: 2020-09-22 09:48:53
 * @LastEditors: shichuyu
 * @LastEditTime: 2020-09-22 15:38:27
 * @Description:  定义公共的配置
 */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 每次文件修改后，重新打包，导致 dist 目录下的文件越来越多。要是每次打包前，都会帮我们先清空一下目录
const isDev = process.env.NODE_ENV === 'development';
const config = require('./public/config')[isDev ? 'dev' : 'build'];
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 静态资源拷贝
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离CSS
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin'); // 将抽离出来的css文件进行压缩
console.log(config)
module.exports = {
    mode: isDev ? 'development' : 'production',
    entry: {
        // 应用不一定是一个单页应用，而是一个多页应用,可设立多个入口
        index: './src/index.js',
        login: './src/login.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'), //必须是绝对路径
        filename: 'bundle.[hash:6].js', // 考虑到CDN缓存的问题，我们一般会给文件名加上 hash.长度给6不会太长
        publicPath: '/' //通常是CDN地址
    },
    devServer: {
        hot: true, // 热更新
        port: '3000', //默认是8080
        quiet: false, //默认不启用 除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见
        inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
        stats: "errors-only", //终端仅打印 error。 当启用了 quiet 或者是 noInfo 时，此属性不起作用。
        overlay: false, //默认不启用 当编译出错时，会在浏览器窗口全屏输出错误
        clientLogLevel: "silent", //日志等级
        compress: true //是否启用 gzip 压缩
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ['babel-loader'],
                exclude: /node_modules/ //排除 node_modules 目录
            },
            {
                test: /\.(le|c|sc)ss$/,
                // loader 的执行顺序是从右向左执行的，也就是后面的 loader 先执行
                use: [
                    // 'style-loader', 
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options:{
                            hmr: isDev,
                            reloadAll: true
                        }
                    }, //替换之前的 style-loader
                    'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        plugins: function () {
                            return [
                                require('autoprefixer')({
                                    "overrideBrowserslist": [
                                        "defaults"
                                    ]
                                })
                            ]
                        }
                    }
                }, 'less-loader','sass-loader'], 
                exclude: /node_modules/
            },
            // {
            //     test: /.html$/, 
            //     use: 'html-withimg-loader' // 该属性可以配置使用本地图片 因为构建之后，通过相对路径压根找不着这张图片呀。
            // },
            {
                test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10240, // 资源大小小于 10K 时，将资源转换为 base64，超过 10K，将图片拷贝到 dist 目录。
                            esModule: false, // esModule 设置为 false，否则，<img src={require('XXX.jpg')} /> 会出现 <img src=[Module Object] />
                            name: '[name]_[hash:6].[ext]', // 图片名称，也可不加name，默认自己给
                            outputPath: 'assets' // 将图片打包在一个文件夹下
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    // 帮助我们将编译后的代码映射回原始源代码，方便页面调试时，找到对应的console的那一行代码
    devtool: isDev ? 'cheap-module-eval-source-map' : ('source-map' || 'none'), // 开发环境 : 生产环境
    plugins: [
        //数组 放着所有的webpack插件
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', //打包后的文件名 配置多个 HtmlWebpackPlugin，那么 filename 字段不可缺省
            config: config.template,
            chunks: ['index'],
            inject: true,
            // hash: true //是否加上hash，默认是 false
        }),
        new HtmlWebpackPlugin({
            template: './public/login.html',
            filename: 'login.html', //打包后的文件名
            // filename: 'login.[hash:6].html' // 若想 html 的文件名中也带有 hash，那么直接修改 fliename 字段
            chunks: ['login'],
            inject: true,
        }),
        // 不需要传参数，它可以找到 outputPath
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns:['**/*', '!dll', '!dll/**'] //但希望不删除某个目录的文件也可，例：dll目录下的文件
        }),
        /* new CopyWebpackPlugin([
            {
                from: 'public/js/*.js',
                to: path.resolve(__dirname, 'dist', 'js'),
                flatten: true,
            }
        ], {
            ignore: ['other.js']
        }) */
        // 上面写法有误
        new CopyWebpackPlugin({
            patterns:[
                {
                    from: 'public/js/*.js',
                    to: path.resolve(__dirname, 'dist', 'js'),
                    flatten: true,
                    globOptions:{
                        ignore: ['other.js',
                            // Ignore all `txt` files
                            '**/*.txt',
                            // Ignore all files in all subdirectories
                            '**/subdir/**',
                        ],
                    }
                }
            ]
        }),
        // ProvidePlugin 的作用就是不需要 import 或 require 就可以在项目中到处使用。就是一个全局变量，不能过度使用
        // 这样配置之后，你就可以在项目中随心所欲的使用 $、_map了，并且写 React 组件时，也不需要 import React 和 Component 了，如果你想的话，你还可以把 React 的 Hooks 都配置在这里。
        new webpack.ProvidePlugin({
            React: 'react',
            Component: ['react', 'Component'],
            Vue: ['vue/dist/vue.esm.js', 'default'],
            $: 'jquery',
            _map: ['lodash', 'map']
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css' //个人习惯将css文件放在单独目录下
        }),
        new OptimizeCssPlugin(), // 开发环境下不需要压缩，可独立出来到webpack.config.prod.js
        new webpack.HotModuleReplacementPlugin(), //热更新插件
    ],
    // 配置 webpack 如何寻找模块所对应的文件
    resolve: {
        modules: ['./src/components', 'node_modules'], //从左到右依次查找
        alias: {
            'react-native': '@my/react-native-web' // 这个包名是我乱写的嘿
            // 例如，我们有一个依赖 @my/react-native-web 可以实现 react-native 转 web。我们代码一般下面这样:
            // 改写后 import { View, ListView, StyleSheet, Animated } from 'react-native';
        }
    }
}