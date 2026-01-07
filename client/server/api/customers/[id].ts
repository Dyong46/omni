export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");
	const baseURL = getApiBaseURL();

	// GET single customer
	if (method === "GET") {
		return await $fetch(`${baseURL}/customer/${id}`);
	}

	// PUT - Update customer
	if (method === "PUT") {
		const body = await readBody(event);
		return await $fetch(`${baseURL}/customer/${id}`, {
			method: "PUT",
			body
		});
	}

	// DELETE customer
	if (method === "DELETE") {
		return await $fetch(`${baseURL}/customer/${id}`, {
			method: "DELETE"
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
