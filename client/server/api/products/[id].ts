import { getApiBaseURL } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");
	const baseURL = getApiBaseURL();

	// GET single product
	if (method === "GET") {
		return await $fetch(`${baseURL}/products/${id}`);
	}

	// PUT - Update product
	if (method === "PUT") {
		const body = await readBody(event);

		return await $fetch(`${baseURL}/products/${id}`, {
			method: "PUT",
			body
		});
	}

	// DELETE product
	if (method === "DELETE") {
		return await $fetch(`${baseURL}/products/${id}`, {
			method: "DELETE"
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
