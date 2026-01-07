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
