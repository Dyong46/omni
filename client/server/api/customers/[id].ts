export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");
	const baseURL = getApiBaseURL();
	const headers = getAuthHeaders(event);

	// GET single customer
	if (method === "GET") {
		return await $fetch(`${baseURL}/customer/${id}`, { headers });
	}

	// PUT - Update customer
	if (method === "PUT") {
		const body = await readBody(event);
		return await $fetch(`${baseURL}/customer/${id}`, {
			method: "PUT",
			body,
			headers
		});
	}

	// DELETE customer
	if (method === "DELETE") {
		return await $fetch(`${baseURL}/customer/${id}`, {
			method: "DELETE",
			headers
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
