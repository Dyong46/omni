export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");

	// GET single product
	if (method === "GET") {
		return await apiCall(event, `/products/${id}`);
	}

	// PUT - Update product
	if (method === "PUT") {
		const body = await readBody(event);

		return await apiCall(event, `/products/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json"
			}
		});
	}

	// DELETE product
	if (method === "DELETE") {
		return await apiCall(event, `/products/${id}`, {
			method: "DELETE"
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
