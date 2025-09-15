'use strict';

/*!
 *  SFO Webpack config file.
 *
 *  @author  Михаил Драгункин <contact@md.land>
 *  @url     https://md.land
 *  @since   April 30, 2025
 *  @ver     1.0.0
 */

const applicationVersion = require('./package')['version'];
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    output: {
        filename: '[name].js'
    },
    entry: {
        'default': './frontend_src/default.ts',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [{
            test: /.+\.ts$/,
            use: 'ts-loader',
            exclude: [/node_modules/, /^_/]
        }]
    },
    optimization: {
        minimize: false,
    },
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'applicationVersion': JSON.stringify(applicationVersion),
        }),
    ],
}