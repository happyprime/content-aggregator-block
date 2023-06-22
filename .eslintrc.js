module.exports = {
	root: true,
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	env: {
		browser: true,
	},
	ignorePatterns: [
		'.*.js',
		'*.config.js',
		'**/build/*.js',
	],
	rules: {
		'no-console': [ 'warn', { allow: [ 'error' ] } ],
	},
};
