module.exports = {
	extends: [
		'plugin:@wordpress/eslint-plugin/esnext',
		'plugin:@wordpress/eslint-plugin/jsx-a11y',
		'plugin:@wordpress/eslint-plugin/react',
	],
	env: {
		browser: true,
	},
	ignorePatterns: [ '.eslintrc.js', 'build/*.js' ],
	parser: 'babel-eslint',
	rules: {
		'no-console': [ 'warn', { allow: [ 'error' ] } ],
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
};
