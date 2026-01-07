export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const token = getCookie(event, "auth_token");
	
	if (!token) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized"
		});
	}

	try {
		// Extract user ID from token
		const payload = JSON.parse(
			Buffer.from(token.split(".")[1], "base64").toString()
		);
		const userId = payload.sub;

		// Call new change-password endpoint with verification
		return await apiCall(event, `/auth/change-password/${userId}`, {
			method: "PUT",
			body: JSON.stringify({
				currentPassword: body.currentPassword,
				newPassword: body.newPassword
			}),
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
});
