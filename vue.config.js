const webpack = require('webpack')
const BannerPlugin = require('webpack').BannerPlugin
const ZipPlugin = require('zip-webpack-plugin')
const packageJson = require('./package.json')
const GenerateJsonWebpackPlugin = require('generate-json-webpack-plugin')
const pkgVersion = packageJson.version
const pkgName = packageJson.name

const now = new Date()
const buildDate = now.toUTCString()
const bannerText = `
package-name: ${pkgName}
package-version: ${pkgVersion}
build-date: ${buildDate}`

const previewText = `
package-name: ${pkgName}
build-date: ${buildDate}
PR: ${process.env.CHANGE_ID}
BUILD: ${process.env.BUILD_NUMBER}`

const htmlTemplate = () => {
  if (process.env.NODE_ENV === 'production') return 'apptemplate/app-template.html'
  if (process.env.NODE_ENV === 'development') return 'public/index.html'
  if (process.env.NODE_ENV === 'test') return 'public/preview.html'
}

const PROXY_TARGET = 'https://test-eucan-connect.molgeniscloud.org' // 'https://master.dev.molgenis.org'

module.exports = {
  runtimeCompiler: true,
  outputDir: 'dist',
  publicPath: process.env.NODE_ENV === 'production'
    ? '/plugin/app/' + packageJson.name
    : '/',
  chainWebpack: config => {
    config.resolve.symlinks(false)
    config
      .plugin('html')
      .tap(args => {
        args[0].template = htmlTemplate()
        args[0].version = process.env.NODE_ENV !== 'production' ? previewText : ''
        return args
      })
  },
  configureWebpack: config => {
    config.plugins.push(
      new BannerPlugin({
        banner: bannerText
      }),
      new webpack.ProvidePlugin({
        Popper: ['popper.js', 'default']
      }),
      new GenerateJsonWebpackPlugin('config.json', {
        name: packageJson.name,
        label: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
        apiDependency: 'v2',
        includeMenuAndFooter: true,
        runtimeOptions: {
          language: 'en'
        }
      }, null, 4),
      new ZipPlugin({
        filename: `${packageJson.name}.v${packageJson.version}`
      })
    )
  },
  devServer: {
    // In CI mode, Safari cannot contact "localhost", so as a workaround, run the dev server using the jenkins agent pod dns instead.
    host: process.env.JENKINS_AGENT_NAME || 'localhost',
    // Used to proxy a external API server to have someone to talk to during development
    proxy: process.env.NODE_ENV !== 'development' ? undefined : {
      '/login': {
        target: PROXY_TARGET,
        changeOrigin: true
      },
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true
      },
      '/logout': {
        target: PROXY_TARGET,
        changeOrigin: true
      }
    }
  }
}
