import type { LoginResponse } from "~/types";
import { getApiBaseURL } from "../../utils/api";

export default defineEventHandler(async (event): Promise<LoginResponse> => {
	const body = await readBody(event);
	const baseURL = getApiBaseURL();

	try {
		const response = await $fetch<LoginResponse>(`${baseURL}/auth/login`, {
			method: "POST",
			body
		});

		console.log("response", response);
		

		return response;
	} catch (error: any) {
		throw createError({
			statusCode: error.statusCode || 500,
			message: error.data?.message || "Login failed"
		});
	}
});
