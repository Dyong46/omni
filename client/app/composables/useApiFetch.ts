export const useApiFetch = async (url, opts = {}) => {
	// Client-only helper
	if (import.meta.server) return;

	const { $me } = useNuxtApp();

	const headers = {
		"Content-Type": "application/json",
		...(opts.headers || {})
	};

	if ($me?.token) headers.Authorization = "Bearer " + $me.token;

	const fetchOpts = {
		...opts,
		headers
	};

	// Call Nuxt server API route (let Nuxt proxy to upstream)
	const magento_data = await $fetch("/api" + url, fetchOpts).catch((error) => error.data);

	return magento_data;
};