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
const SpritesmithPlugin = require('webpack-spritesmith')

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
        assetsSort: 'chunks',
        excludeAssets: env.NODE_ENV === 'development' || !!env.light ? /\.(js|map|jpe?g|png|gif)$/ : /\.(js|map)$/
    }

    const headers = []

    // get all non-blurry headers to use later in randomization
    fs.readdirSync(path.resolve(__dirname, 'src/img/headers')).map(file => {
        if (!file.includes('blurry') && !file.includes('psd'))
            headers.push(file)
    })

    const headerVariant = !!env.header ? env.header : Math.floor(Math.random() * headers.length) + 1

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
            stats,

            watchOptions: {
                poll: 500,
                ignored: [
                    'src/img/**',
                    'node_modules',
                    'dist',
                    '.cache'
                ]
            }
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
                                url: false,
                                modules: false
                            }
                        },

                        'postcss-loader',

                        {
                            loader: 'sass-loader',
                            options: {
                                data: `
                                    $env: ${ env.NODE_ENV};
                                    $header-variant: ${ headerVariant };
                                `
                            }
                        }
                    ]
                }
            ]
        },

        resolve: {
            modules: [
                'node_modules',
                'spritesmith-generated'
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

            // generate user flair sprite
            new SpritesmithPlugin({
                src: {
                    cwd: path.resolve(__dirname, 'src/img/sprites/user-flairs'),
                    glob: ['*.png', '*.jpg'],
                },
                target: {
                    // target destinations for outputs
                    image: path.resolve(__dirname, `dist/img/flair-sprite${env.NODE_ENV === 'development' ? '-[hash]' : ''}.png`),
                    css: path.resolve(__dirname, `src/sass/abstracts/_flair-sprite.scss`)
                },
                apiOptions: {
                    // image reference inside of CSS
                    cssImageRef: `../img/flair-sprite${env.NODE_ENV === 'development' ? '-[hash]' : ''}.png`
                },
                spritesmithOptions: {
                    algorithm: 'top-down'
                }
            }),

            // generate sprite from all the icons located inside of "src/img/sprites"
            new SpritesmithPlugin({
                src: {
                    cwd: path.resolve(__dirname, 'src/img/sprites'),
                    glob: ['*/*.png', '!user-flairs/*']
                },
                target: {
                    // target destinations for outputs
                    image: path.resolve(__dirname, `dist/img/sprite${env.NODE_ENV === 'development' ? '-[hash]' : ''}.png`),
                    css: path.resolve(__dirname, `src/sass/abstracts/_sprite.scss`)
                },
                apiOptions: {
                    // image reference inside of CSS
                    cssImageRef: `../img/sprite${env.NODE_ENV === 'development' ? '-[hash]' : ''}.png`
                }
            }),

            // move images from source to distribution folder
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, 'src/img'),
                to: 'img',
                ignore: ['sprites/**']
            }]),

            // clean terminal on each build
            // to only have information from the latest build
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

                // optimize (compress) images
                new ImageminPlugin({
                    disable: !!env.light,
                    test: /\.(jpe?g|png)$/i,
                    cacheFolder: path.resolve(__dirname, '.cache/large-files'),
                    minFileSize: 500000,

                    // https://github.com/imagemin/imagemin-optipng#api
                    optipng: {
                        optimizationLevel: 5
                    },

                    plugins: [
                        // https://github.com/imagemin/imagemin-mozjpeg#api
                        ImageminMozjpeg({
                            quality: 78,
                            dcScanOpt: 2
                        })
                    ]
                }),

                // heavily compress blurry header images
                new ImageminPlugin({
                    disable: !!env.light,
                    test: /blurry\.jpe?g$/i,
                    cacheFolder: path.resolve(__dirname, '.cache/blurry-headers'),
                    minFileSize: 10000,

                    plugins: [
                        // https://github.com/imagemin/imagemin-mozjpeg#api
                        ImageminMozjpeg({
                            quality: 70
                        })
                    ]
                }),

                new ImageminPlugin({
                    disable: !!env.light,
                    test: /\.(jpe?g|png)$/i,
                    cacheFolder: path.resolve(__dirname, '.cache/rest'),
                    maxFileSize: 500000,
                    minFileSize: 50000,

                    // https://github.com/imagemin/imagemin-optipng#api
                    optipng: {
                        optimizationLevel: 3
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
