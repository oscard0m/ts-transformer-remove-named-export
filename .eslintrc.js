module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
	  'plugin:@typescript-eslint/recommended'
	],
	parserOptions: {
	  project: './tsconfig.json'
	},
	rules: {
	  // Special ESLint rules or overrides go here.
	},
  }