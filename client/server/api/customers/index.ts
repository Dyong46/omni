export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const query = getQuery(event);

	// GET all customers or search
	if (method === "GET") {
		if (query.q) {
			// Search functionality
			return await apiCall(event, `/customer/search?q=${query.q}`);
		}

		return await apiCall(event, "/customer");
	}

	// POST - Create new customer
	if (method === "POST") {
		const body = await readBody(event);
		return await apiCall(event, "/customer", {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json"
			}
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});

