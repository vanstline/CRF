/**
 * 开发模式下的 webpack2 配置
 * 在整个项目开发过程中，几乎99%的时间都是在这个模式下进行的
 * 注意。两种模式的配置有较大差异！！
 * webpack2 官方配置地址 https://webpack.js.org/configuration/externals/
 */

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const svgDirs=[
  require.resolve('antd-mobile').replace(/warn\.js$/,''),  // 1. 属于 antd-mobile 内置 svg 文件
];

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  // 关于选项的选择，http://cheng.logdown.com/posts/2016/03/25/679045
  // 具体请参考 https://webpack.js.org/configuration/devtool/#components/sidebar/sidebar.jsx

  context: path.resolve(__dirname, 'src'),
  // 指定资源读取的根目录
  // https://webpack.js.org/configuration/entry-context/#components/sidebar/sidebar.jsx

  target: 'web',
  // https://webpack.js.org/configuration/target/

  entry: [
    'webpack-public-path',
    'react-hot-loader/patch',
    'webpack-hot-middleware/client?reload=true',
    'index-dev.js'
  ],
  // https://webpack.js.org/configuration/entry-context/

  output: {
    path: path.join(__dirname, 'src'),
    // 输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它

    publicPath: '/',
    // 模板、样式、脚本、图片等资源对应的server上的路径

    filename: 'bundle.js',
    // 命名生成的JS
  },
  // https://webpack.js.org/configuration/output/

  module: {
    rules: [
      {
        test: /\.es6|jsx|js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },

      /*私有样式，模块化处理*/
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName:'[local]___[hash:base64:5]'
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              parser: 'postcss-scss'
            }
          }
        ],
        include: path.resolve(__dirname, 'src/js')
      },

      /*公有样式*/
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              parser: 'postcss-scss'
            }
          }
        ],
        include: path.resolve(__dirname, 'src/styles')
      },

      {
        test:/\.css$/,
        include: path.resolve(__dirname, 'node_modules'),
        use: ['style-loader','css-loader','postcss-loader']
      },

      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        exclude: svgDirs,
        options: {
          limit: 15000
        }
      },

      {
        test:/\.(svg)$/i,
        loader: 'svg-sprite-loader',
        include: svgDirs,
        options: {
          limit: 15000
        }
      }
    ]
  },

  // 引入外部库
  // 适用于一些常用且体积较大的库，充分利用CDN加速，减轻服务器负担，降低加载时间！
  // https://webpack.js.org/configuration/externals/
  externals:{
    moment: 'moment'
  },

  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ],
    // 这样，webpack在查找模块时，先查找 node_modules ，如果没找到则在 src 中查找

    extensions: ['.web.js', '.js', '.json'],
    // 该配置项将不再要求强制转入一个空字符串，而被改动到了resolve.enforceExtension下
    // 相关文档 https://webpack.js.org/configuration/resolve/

    // 路径别名, 懒癌福音
    alias:{
      app: path.resolve(__dirname,'src/js'),
      // 以前你可能这样引用 import { Nav } from '../../components'
      // 现在你可以这样引用 import { Nav } from 'app/components'

      style: path.resolve(__dirname,'src/styles')
      // 以前你可能这样引用 import '../../../styles/mixins.scss'
      // 现在你可以这样引用 import 'style/mixins.scss'

      // 注意：别名只能在.js文件中使用。
    }
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      __DEV__: true
    }),
    // 很多库的内部，有process.NODE_ENV的判断语句，
    // 改为production。最直观的就是没有所有的debug相关的东西，体积会减少很多

    new webpack.HotModuleReplacementPlugin(),
    // 启用热替换,仅开发模式需要

    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates

    new webpack.NoEmitOnErrorsPlugin(),
    // 允许错误不打断程序，,仅开发模式需要

    new HtmlWebpackPlugin({
      title: '开发模式',

      filename: 'index.html',
      // 文件名以及文件将要存放的位置

      favicon: 'favicon.ico',
      // favicon路径

      template: 'index.html',
      // html模板的路径

      inject: 'body',
      // js插入的位置，true/'head'  false/'body'
    })
  ]
};
