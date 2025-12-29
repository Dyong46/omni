import type { RegisterResponse } from "~/types";
import { getApiBaseURL } from "../../utils/api";

export default defineEventHandler(async (event): Promise<RegisterResponse> => {
	const body = await readBody(event);
	const baseURL = getApiBaseURL();

	try {
		const response = await $fetch<RegisterResponse>(`${baseURL}/auth/register`, {
			method: "POST",
			body
		});

		return response;
	} catch (error: any) {
		throw createError({
			statusCode: error.statusCode || 500,
			message: error.data?.message || "Registration failed"
		});
	}
});
