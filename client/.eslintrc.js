// eslint-disable-next-line no-undef
module.exports = {
	env: {
		node: true,
		es2021: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:cypress/recommended",
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		sourceType: "module",
	},
	plugins: ["react"],
	rules: {
		// other rules
		"react/prop-types": "off",
		"no-unused-vars": "off",
		"no-unexpected-multiline": "off",
		"no-mixed-spaces-and-tabs": "off",
	},
};
