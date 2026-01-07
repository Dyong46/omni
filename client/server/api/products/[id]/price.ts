import { getApiBaseURL, getAuthHeaders } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");
	const baseURL = getApiBaseURL();
	const headers = getAuthHeaders(event);

	if (method === "PUT") {
		const body = await readBody(event);

		return await $fetch(`${baseURL}/products/${id}/price`, {
			method: "PUT",
			body,
			headers
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed",
	});
});
