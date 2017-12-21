/**
 * 产品模式下的 webpack2 配置
 *
 * 注意。两种模式的配置有较大差异！！
 *
 * webpack2 官方配置地址 https://webpack.js.org/configuration/externals/
 */

const path = require('path');
const webpack = require('webpack');
const WebpackMd5Hash = require('webpack-md5-hash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const svgDirs = [
  require.resolve('antd-mobile').replace(/warn\.js$/, ''),  // 1. 属于 antd-mobile 内置 svg 文件
  path.resolve(__dirname, 'src/images/svg')  // 2. 自己私人的 svg 存放目录
];
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',
  // 关于选项的选择，http://cheng.logdown.com/posts/2016/03/25/679045
  // 具体请参考 https://webpack.js.org/configuration/devtool/#components/sidebar/sidebar.jsx

  context: path.resolve(__dirname, 'src'),
  // 注意，这里指定资源读取的根目录
  // https://webpack.js.org/configuration/entry-context/#components/sidebar/sidebar.jsx

  target: 'web',
  // https://webpack.js.org/configuration/target/

  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-router',
      'dateformat',
      'object-assign',
      'es6-promise',
      'whatwg-fetch',
      'react-tap-event-plugin',
      'antd-mobile'
    ],
    app: 'index.js',
  },
  // https://webpack.js.org/configuration/entry-context/

  output: {
    path: path.join(__dirname, 'dist'),
    // 输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它

    publicPath: '',
    // 模板、样式、脚本、图片等资源对应的server上的路径

    filename: 'bundle.js',
    // 命名生成的JS,

    //chunkFilename: '[name]-[chunkhash:5].js'
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
        use: ExtractTextPlugin.extract({
          use: [
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
          ]
        }),
        include: path.resolve(__dirname, 'src/js')
      },

      /*公有样式*/
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                parser: 'postcss-scss'
              }
            }
          ]
        }),
        include: path.resolve(__dirname, 'src/styles')
      },

      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'node_modules'),
        use: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
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

    extensions: ['.web.js', '.js', '.jsx', '.es6', '.json'],
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
    // new webpack.optimize.OccurrenceOrderPlugin(),
    // 和 json-loader 一样，OccurrenceOrderPlugin 在 webpack 2.0中默认添加！
    // webapck 会给编译好的代码片段一个id用来区分
    // 而这个插件会让webpack在id分配上优化并保持一致性。
    // 具体是的优化是：webpack就能够比对id的使用频率和分布来得出最短的id分配给使用频率高的模块

    new WebpackMd5Hash(),
    // Hash the files using MD5 so that their names change when the content changes.

    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      }
    }),
	
	new CopyWebpackPlugin([
      {
        from: 'public',
        to: 'public'
      }
    ]),

    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    // 代码压缩
    // https://webpack.js.org/guides/migrating/#uglifyjsplugin-sourcemap

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      __DEV__: false
    }),

    new ExtractTextPlugin('vendor.css'),

    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: {removeAll: true } },
      canPrint: true
    }),
    // 很多库的内部，有process.NODE_ENV的判断语句，
    // 改为production。最直观的就是没有所有的debug相关的东西，体积会减少很多

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      // 指定入口文件(entry)哪个key需要提取，提取公用的，更新率低的部分。

      filename: 'vendor.js',
      // (Give the chunk a different name) 此项如果省略默认生成 vendor.js

      minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    }),
    // https://webpack.js.org/plugins/commons-chunk-plugin/#components/sidebar/sidebar.jsx
    // https://webpack.js.org/guides/code-splitting-libraries/#implicit-common-vendor-chunk

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

      hash: true,
      // 这样每次客户端页面就会根据这个hash来判断页面是否有必要刷新
      // 在项目后续过程中，经常需要做些改动更新什么的，一但有改动，客户端页面就会自动更新！

      minify: {
        removeComments: true,
        // 移除HTML中的注释

        collapseWhitespace: true,
        // 删除空白符与换行符

        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
    })
  ],
};
