export default defineNuxtRouteMiddleware((to) => {
	const authStore = useAuthStore();

	// Initialize auth from localStorage
	if (!authStore.isAuthenticated) {
		authStore.initAuth();
	}

	// Public routes that don't require authentication
	const publicRoutes = ["/login", "/register"];
	const isPublicRoute = publicRoutes.includes(to.path);

	// If user is authenticated and trying to access login/register, redirect to home
	if (authStore.isAuthenticated && isPublicRoute) {
		return navigateTo("/");
	}

	// If user is not authenticated and trying to access protected route, redirect to login
	if (!authStore.isAuthenticated && !isPublicRoute) {
		return navigateTo("/login");
	}
});
