module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		jest: true,
		node: true,
		// es2021: true,
	},
	extends: [
		"react-app",
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:jsx-a11y/recommended",
		"plugin:react-hooks/recommended",
		"plugin:jest/recommended",
		"plugin:testing-library/react",
		"plugin:cypress/recommended",
		"plugin:import/recommended",
	],
	parser: "@babel/eslint-parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		sourceType: "module",
	},
	plugins: ["import", "react", "react-hooks"],
	root: true,
	rules: {
		// other rules
		"react/prop-types": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"no-unused-vars": "off",
		"no-unexpected-multiline": "off",
		"no-mixed-spaces-and-tabs": "off",
		quotes: ["warn", "double"],
	},
	settings: {
		react: {
			version: "detect",
		},
	},
};
