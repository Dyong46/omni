// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
	rules: {
		"block-spacing": "error",
		"newline-after-var": ["error", "always"],
		"no-tabs": 0,
		"indent": ["error", "tab"],
		"comma-dangle": ["error", "never"],
		"object-curly-spacing": ["error", "always", { arraysInObjects: false, objectsInObjects: false }],
		"spaced-comment": ["error", "always"],
		"no-trailing-spaces": ["error", { skipBlankLines: true }],
		"keyword-spacing": ["error", { before: true }],
		"comma-spacing": ["error", { before: false, after: true }],
		"quotes": ["error", "double"],
		"semi": ["error", "always"],
		"vue/valid-v-slot": "off",
		"vue/no-multiple-template-root": "off",
		"vue/html-indent": ["error", "tab", {
			alignAttributesVertically: true,
			attribute: 1,
			baseIndent: 1,
			closeBracket: 0,
			ignores: []
		}],
		"vue/max-attributes-per-line": ["error", {
			multiline: 1,
			singleline: 5
		}]
	}
});
