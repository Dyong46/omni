// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",

	// Development tools
	devtools: { enabled: true },

	// TypeScript configuration
	typescript: {
		strict: true,
		typeCheck: false
	},

	// Modules
	modules: [
		"@nuxt/ui",
		"@nuxt/image",
		"@nuxt/eslint",
		"@pinia/nuxt",
		"@vueuse/nuxt"
	],

	// Plugins
	plugins: [],

	// CSS
	css: ["~/assets/css/main.css"],

	// Runtime config for environment variables
	runtimeConfig: {
		// Private keys (server-side only)
		apiSecret: "",

		// Public keys (exposed to client)
		public: {
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
			appName: process.env.NUXT_PUBLIC_APP_NAME
		}
	},

	// Build configuration
	build: {
		transpile: []
	},

	// Experimental features for Nuxt 4
	future: {
		compatibilityVersion: 4
	}
});