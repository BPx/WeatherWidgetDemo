
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '..', 'dist');
const SRC_DIR = path.resolve(__dirname, '..', 'src');

const config = {
	devtool: 'cheap-module-source-map',
	devServer: {
		contentBase: BUILD_DIR,
		compress: true,
		port: 9000
	},
	entry: path.resolve(SRC_DIR, 'js/main.jsx'),
	output: {
		path: BUILD_DIR,
		filename: 'bundle.js'
	},
	module: {
		loaders: [{
			test: /\.jsx$/,
			exclude: /node_modules/,
			include: SRC_DIR,
			loader: 'babel-loader',
			query: {
				cacheDirectory: true,
			}
		}, {
			test: /\.css$/,
			include: SRC_DIR,
			loader: 'style-loader!css-loader'
		}, {
			test: /\.json$/,
			exclude: /node_modules/,
			include: SRC_DIR,
			loader: 'json-loader'
		}]
	},
	resolve: {
		alias: {
			css: path.resolve(SRC_DIR, 'css'),
			cached: path.resolve(SRC_DIR, 'cached'),
		}
	},
	plugins: [
		new CopyWebpackPlugin([{
			from: './src/index.html',
			to: BUILD_DIR,
		}])
	],
	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	}
}

module.exports = config;
