const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,
	entry: {
		'content-aggregator': './blocks/content-aggregator/',
	},
};
