export default defineEventHandler(async (event) => {
	const baseURL = getApiBaseURL();

	return await $fetch(`${baseURL}/categories`);
});
