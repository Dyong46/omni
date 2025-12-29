import type { UseFetchOptions } from "nuxt/app";
import type { ApiResponse } from "~/types";

export const useApi = <T>(
	url: string,
	options?: UseFetchOptions<ApiResponse<T>>
) => {
	const config = useRuntimeConfig();
	const authStore = useAuthStore();

	// Get token from store
	const token = authStore.getToken;

	return useFetch<ApiResponse<T>>(url, {
		baseURL: config.public.apiBase,
		...options,
		headers: {
			...options?.headers,
			...(token && { Authorization: `Bearer ${token}` })
		},
		onResponseError({ response }) {
			// Handle errors globally
			console.error("API Error:", response._data);

			// If 401, logout and redirect to login
			if (response.status === 401) {
				authStore.logout();
				navigateTo("/login");
			}
		}
	});
};
