import path from "path";
import fs from "fs";
import webpack from "webpack";

export default {
    entry: (function () {
        var entry = {};

        fs.readdirSync("src/")
            .filter(_path  => {
                return fs.statSync(`src/${_path}`).isFile();
            })
            .map(_path =>{
                entry[path.parse(_path).name] = `./src/${_path}`;
                return `./src/${_path}`;
            });

        return entry;
    })(),
    
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].js'
    },
    
    plugins: [
        /*new webpack.optimize.CommonsChunkPlugin("lib", "lib.js"),
        new webpack.optimize.DedupePlugin()*/
    ],
    
    resolve: {
        extensions: ['', '.js', '.jsx', '.ts', '.tsx']
    },

    externals: {
    },
    
    module: {
        loaders: [
            {
                test: /\.js|jsx$/,
                loaders: ['babel'],
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                // We could restrict using json-loader only on .json files in the
                // node_modules/pixi.js directory, but the ability to load .json files
                // could be useful elsewhere in our app, so I usually don't.
                //include: path.resolve(__dirname, 'node_modules/pixi.js'),
                loader: 'json'
            },
            {
                test: /\.ts|tsx?$/,
                loaders: [ 'babel', 'ts-loader' ],
                exclude: /node_modules/
            },
            {
                test: /\.scss|css$/,
                loaders: ["style", "css", "sass"]
            }
        ]
    },
    watch: true,
    devtool: 'stack-source-map'
};