export default defineNuxtPlugin(() => {
	const authStore = useAuthStore();
	
	// Initialize auth state from localStorage on app start
	authStore.initAuth();
});
