import { defineStore } from "pinia";
import type { AuthUser, LoginResponse } from "~/types";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null as AuthUser | null,
		token: null as string | null,
		isAuthenticated: false
	}),

	getters: {
		currentUser: (state) => state.user,
		isLoggedIn: (state) => state.isAuthenticated,
		getToken: (state) => state.token
	},

	actions: {
		async login(credentials: { username: string; password: string }) {
			try {
				console.log("login", credentials);
				
				const response = await $fetch<LoginResponse>("/api/auth/login", {
					method: "POST",
					body: credentials
				});

				this.token = response.access_token;
				this.user = response.user;
				this.isAuthenticated = true;

				// Persist to localStorage and cookie
				if (import.meta.client) {
					localStorage.setItem("auth_token", response.access_token);
					localStorage.setItem("auth_user", JSON.stringify(response.user));
					
					// Set cookie for server-side access
					document.cookie = `auth_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
				}

				return response;
			} catch (error) {
				this.logout();
				throw error;
			}
		},

		async register(data: { username: string; password: string; role?: string }) {
			try {
				const response = await $fetch<AuthUser>("/api/auth/register", {
					method: "POST",
					body: data
				});

				return response;
			} catch (error) {
				console.error("Register error:", error);
			}
		},

		initAuth() {
			// Restore from localStorage on client side
			if (import.meta.client) {
				const token = localStorage.getItem("auth_token");
				const userStr = localStorage.getItem("auth_user");

				if (token && userStr) {
					this.token = token;
					this.user = JSON.parse(userStr);
					this.isAuthenticated = true;
				}
			}
		},

		logout() {
			this.user = null;
			this.token = null;
			this.isAuthenticated = false;

			// Clear localStorage and cookie
			if (import.meta.client) {
				localStorage.removeItem("auth_token");
				localStorage.removeItem("auth_user");
				
				// Clear cookie
				document.cookie = "auth_token=; path=/; max-age=0";
			}
		}
	}
});
