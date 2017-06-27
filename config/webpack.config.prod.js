const webpack = require('webpack');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.config.js');

const BabiliPlugin = require('babili-webpack-plugin');

module.exports = function(env) {
	return Merge(CommonConfig, {
		plugins: [
			new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false
			}),
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('production')
				}
			}),
			// use Babili because Uglify chokes on ES Harmony
			new BabiliPlugin({}, {
				comments: false
			}),
		]
	})
}
