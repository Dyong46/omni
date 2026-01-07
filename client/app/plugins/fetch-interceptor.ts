export default defineNuxtPlugin(() => {
	const authStore = useAuthStore();
	const router = useRouter();
	const toast = useToast();

	// Global fetch interceptor for $fetch calls
	globalThis.$fetch = $fetch.create({
		onResponseError({ response }) {
			// Handle 401 Unauthorized globally
			if (response.status === 401) {
				// Clear auth state
				authStore.logout();

				// Show toast notification
				toast.add({
					title: "Session Expired",
					description: "Your session has expired. Please login again.",
					color: "error",
					icon: "i-lucide-alert-circle"
				});

				// Redirect to login if not already there
				if (router.currentRoute.value.path !== "/login") {
					router.push("/login");
				}
			}
		}
	});
});
