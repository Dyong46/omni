import type { UseFetchOptions } from "nuxt/app";
import type { ApiResponse } from "~/types";

export const useApi = <T>(
	url: string,
	options?: UseFetchOptions<ApiResponse<T>>
) => {
	const config = useRuntimeConfig();

	return useFetch<ApiResponse<T>>(url, {
		baseURL: config.public.apiBase as string,
		...options,
		onResponseError({ response }) {
			// Handle errors globally
			console.error("API Error:", response._data);
		}
	});
};
