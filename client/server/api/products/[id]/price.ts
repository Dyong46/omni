import { apiCall } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
	const method = getMethod(event);
	const id = getRouterParam(event, "id");

	if (method === "PUT") {
		const body = await readBody(event);

		return await apiCall(event, `/products/${id}/price`, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json"
			}
		});
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed",
	});
});
