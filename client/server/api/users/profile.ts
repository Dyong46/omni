export default defineEventHandler(async (event) => {
	const method = getMethod(event);

	// GET current user profile
	if (method === "GET") {
		// Get user ID from auth token
		const token = getCookie(event, "auth_token");
		if (!token) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized"
			});
		}

		// Extract user ID from token (simple decode, không verify vì backend sẽ verify)
		try {
			const payload = JSON.parse(
				Buffer.from(token.split(".")[1], "base64").toString()
			);
			const userId = payload.sub;

			return await apiCall(event, `/auth/users/${userId}`);
		} catch (error) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid token"
			});
		}
	}

	// PUT - Update profile
	if (method === "PUT") {
		const body = await readBody(event);
		const token = getCookie(event, "auth_token");
		
		if (!token) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized"
			});
		}

		try {
			const payload = JSON.parse(
				Buffer.from(token.split(".")[1], "base64").toString()
			);
			const userId = payload.sub;

			return await apiCall(event, `/auth/users/${userId}`, {
				method: "PUT",
				body: JSON.stringify(body),
				headers: {
					"Content-Type": "application/json"
				}
			});
		} catch (error) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid token"
			});
		}
	}

	throw createError({
		statusCode: 405,
		statusMessage: "Method Not Allowed"
	});
});
