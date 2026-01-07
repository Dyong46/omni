import type { H3Event } from "h3";

export function getApiBaseURL(): string {
	const config = useRuntimeConfig();

	return config.public.apiBase || "http://localhost:4000";
}

export function getAuthHeaders(event: H3Event): Record<string, string> {
	const headers: Record<string, string> = {};
	
	// Try to get token from Authorization header
	const authHeader = getRequestHeader(event, "authorization");

	if (authHeader) {
		headers.Authorization = authHeader;
		return headers;
	}

	// Try to get token from cookies
	const token = getCookie(event, "auth_token");

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	return headers;
}

/**
 * Wrapper for API calls that handles 401 errors
 */
export async function apiCall<T>(
	event: H3Event,
	url: string,
	options?: RequestInit
): Promise<T> {
	const baseURL = getApiBaseURL();
	const headers = getAuthHeaders(event);

	try {
		return await $fetch<T>(`${baseURL}${url}`, {
			...options,
			headers: {
				...options?.headers,
				...headers
			}
		});
	} catch (error: any) {
		// If 401, clear the auth cookie
		if (error?.response?.status === 401 || error?.statusCode === 401) {
			setCookie(event, "auth_token", "", {
				maxAge: -1, // Delete cookie
				path: "/"
			});
			
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized - Token expired or invalid"
			});
		}
		
		throw error;
	}
}
