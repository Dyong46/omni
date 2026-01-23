import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null,
		token: null,
		isAuthenticated: false
	}),

	getters: {
		currentUser: (state) => state.user,
		isLoggedIn: (state) => state.isAuthenticated,
		getToken: (state) => state.token
	},

	actions: {
		/**
		 * Set authentication data after login
		 */
		setAuth(token, user) {
			this.token = token;
			this.user = user;
			this.isAuthenticated = true;

			// Persist to localStorage
			if (import.meta.client) {
				localStorage.setItem("token", token);
				localStorage.setItem("auth_user", JSON.stringify(user));
			}
		},

		/**
		 * Initialize auth from localStorage
		 */
		initAuth() {
			if (import.meta.client) {
				const token = localStorage.getItem("token");
				const userStr = localStorage.getItem("auth_user");

				if (token && userStr) {
					this.token = token;
					this.user = JSON.parse(userStr);
					this.isAuthenticated = true;
				}
			}
		},

		/**
		 * Clear authentication data
		 */
		clearAuth() {
			this.user = null;
			this.token = null;
			this.isAuthenticated = false;

			// Clear localStorage
			if (import.meta.client) {
				localStorage.removeItem("token");
				localStorage.removeItem("auth_user");
			}
		}
	}
});
