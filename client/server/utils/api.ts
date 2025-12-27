export function getApiBaseURL(): string {
	const config = useRuntimeConfig();

	return config.public.apiBase || "http://localhost:4000";
}
