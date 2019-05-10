const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const baseUrl = path.resolve(__dirname, 'dist');

let config = {
	entry: './src/main.js',
	output: {
		filename: 'bundle.js',
		path: baseUrl,
		libraryTarget: 'var',
		library: 'App',
	},
	devServer: {
		host: '0.0.0.0',
		port: 9090
	},
	watch: false,
	watchOptions: {
		ignored: [ './node_modules' ]
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({ filename: 'index.html', template: './src/index.html' }),
		new CopyPlugin([
			{ from: './src/assets', to: 'assets' },
		])
	],
	module: {
		rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
			{
				test:/\.scss$/,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader" 
				]
			}
		]
	},
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};
module.exports = config;