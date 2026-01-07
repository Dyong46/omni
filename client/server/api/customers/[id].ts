export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");

	// GET single customer
	if (method === "GET") {
		return await apiCall(event, `/customer/${id}`);
	}

	// PUT - Update customer
	if (method === "PUT") {
		const body = await readBody(event);
		return await apiCall(event, `/customer/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json"
			}
		});
	}

	// DELETE customer
	if (method === "DELETE") {
		return await apiCall(event, `/customer/${id}`, {
			method: "DELETE"
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
