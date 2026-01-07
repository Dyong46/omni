export default defineEventHandler(async (event) => {
	const baseURL = getApiBaseURL();
	const headers = getAuthHeaders(event);

	return await $fetch(`${baseURL}/categories`, { headers });
});
