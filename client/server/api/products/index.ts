export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const query = getQuery(event);
	const baseURL = getApiBaseURL();

	// GET all products or search
	if (method === "GET") {
		const queryParams = new URLSearchParams();
		
		if (query.categoryId) {
			queryParams.append("categoryId", query.categoryId as string);
		}
		
		if (query.q) {
			// Search functionality
			return await $fetch(`${baseURL}/products/search?q=${query.q}`);
		}

		const endpoint = queryParams.toString()
			? `${baseURL}/products?${queryParams.toString()}`
			: `${baseURL}/products`;
		
		return await $fetch(endpoint);
	}

	// POST - Create new product
	if (method === "POST") {
		const body = await readBody(event);

		return await $fetch(`${baseURL}/products`, {
			method: "POST",
			body
		});
	}

	// For PUT and DELETE, they should be handled by [id].ts
	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
