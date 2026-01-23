import type { UseFetchOptions } from "nuxt/app";
import type { ApiResponse } from "~/types";

export const useApi = <T>(
	url: string,
	options?: UseFetchOptions<ApiResponse<T>>
) => {
	const config = useRuntimeConfig();
	const authStore = useAuthStore();
	const toast = useToast();
	const router = useRouter();

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
				
				toast.add({
					title: "Session Expired",
					description: "Your session has expired. Please login again.",
					color: "error",
					icon: "i-lucide-alert-circle"
				});
				
				// Only redirect if not already on login page
				if (router.currentRoute.value.path !== "/login") {
					router.push("/login");
				}
			}
		}
	});
};
