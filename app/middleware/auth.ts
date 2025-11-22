export default defineNuxtRouteMiddleware((to) => {
	// Authentication middleware example
	const isAuthenticated = false; // Replace with actual auth check

	// If trying to access protected routes without authentication
	if (to.path.startsWith("/dashboard") && !isAuthenticated) {
		return navigateTo("/login");
	}
});
