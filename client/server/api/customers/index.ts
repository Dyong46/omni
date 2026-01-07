export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const query = getQuery(event);
	const baseURL = getApiBaseURL();
	const headers = getAuthHeaders(event);

	// GET all customers or search
	if (method === "GET") {
		if (query.q) {
			// Search functionality
			return await $fetch(`${baseURL}/customer/search?q=${query.q}`, { headers });
		}

		return await $fetch(`${baseURL}/customer`, { headers });
	}

	// POST - Create new customer
	if (method === "POST") {
		const body = await readBody(event);
		return await $fetch(`${baseURL}/customer`, {
			method: "POST",
			body,
			headers
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});

