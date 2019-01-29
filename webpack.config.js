const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const ImageminMozjpeg = require('imagemin-mozjpeg')

// clear console
process.stdout.write('\033c')

module.exports = env => {
    const stats = {
        all: false,
        modules: false,
        assets: true,
        performance: true,
        timings: true,
        cachedAssets: true,
        errors: true,
        assetsSort: '!chunks',
        excludeAssets: env.NODE_ENV === 'development' || !!env.light ? /\.(js|map|jpe?g|png|gif)$/ : /\.(js|map)$/
    }

    const headers = []

    // get all non-blurry headers to use later in randomization
    fs.readdirSync(path.resolve(__dirname, 'src/img/headers')).map(file => {
        if (!file.includes('blurry') && !file.includes('psd'))
            headers.push(file)
    })

    const config = {
        mode: env.NODE_ENV || 'none',

        entry: {
            theme: './src/sass/theme.scss'
        },

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },

        devtool: 'cheap-source-map',

        performance: {
            // Reddit's max css size is 100 kb
            maxAssetSize: 100000
        },

        stats,

        devServer: {
            contentBase: path.resolve(__dirname, 'dist'),
            progress: true,
            https: true,
            port: 8080,
            stats
        },

        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,

                        {
                            loader: 'replace-css-url-loader',
                            query: {
                                replace (url) {
                                    // rewrite css url() from, for example, "img/picture.jpg" => "%%picture%%"
                                    if (env.NODE_ENV === 'production' && !env.test) {
                                        const split = url.split('/')
                                        const last = split[split.length - 1]
                                        const name = last.slice(0, last.lastIndexOf('.'))

                                        return `%%${name}%%`
                                    }

                                    return url
                                },
                            }
                        },

                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                url: false,
                                modules: false
                            }
                        },

                        'postcss-loader',

                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                data: `
                                    $env: ${ env.NODE_ENV};
                                    $header-variant: ${ Math.floor(Math.random() * headers.length) + 1};
                                `
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [
            // clean the output directory before compiling new assets
            new CleanWebpackPlugin(['dist'], {
                verbose: false
            }),

            // delete the left-over .js files
            new FixStyleOnlyEntriesPlugin({
                silent: true
            }),

            // extract css into a separate file
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            }),

            // move images from source to distribution folder
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, 'src/img'),
                to: 'img',
                ignore: ['*.psd']
            }]),

            // clean terminal on each build
            // to only have information about the latest build
            new CleanTerminalPlugin
        ],

        // these execute only in production
        optimization: {
            nodeEnv: env.NODE_ENV,
            minimizer: [
                // minimize the css output file
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        // enable some more aggressive minimization options in cssnano
                        reduceIdents: true,
                        discardUnused: true,
                        mergeIdents: true
                    }
                }),

                new ImageminPlugin({
                    disable: !!env.light,
                    test: /\.(jpe?g|png|gif)$/i,
                    cacheFolder: path.resolve(__dirname, '.cache'),

                    // https://github.com/imagemin/imagemin-optipng#api
                    optipng: {
                        optimizationLevel: 2
                    },

                    plugins: [
                        // https://github.com/imagemin/imagemin-mozjpeg#api
                        ImageminMozjpeg({
                            quality: 90,
                            dcScanOpt: 2
                        })
                    ]
                })
            ]
        }
    }

    if (env.test) {
        // for live testing purposes, enable optimization plugins
        config.optimization.minimizer.map(plugin => {
            config.plugins.push(plugin)
        })
    }

    return config
}