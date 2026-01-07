export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const query = getQuery(event);

	// GET all products or search
	if (method === "GET") {
		const queryParams = new URLSearchParams();
		
		if (query.categoryId) {
			queryParams.append("categoryId", query.categoryId as string);
		}
		
		if (query.q) {
			// Search functionality
			return await apiCall(event, `/products/search?q=${query.q}`);
		}

		const endpoint = queryParams.toString()
			? `/products?${queryParams.toString()}`
			: "/products";
		
		return await apiCall(event, endpoint);
	}

	// POST - Create new product
	if (method === "POST") {
		const body = await readBody(event);

		return await apiCall(event, "/products", {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json"
			}
		});
	}

	// For PUT and DELETE, they should be handled by [id].ts
	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
