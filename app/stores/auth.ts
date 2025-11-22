import { defineStore } from "pinia";
import type { User } from "~/types";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null as User | null,
		token: null as string | null,
		isAuthenticated: false
	}),

	getters: {
		currentUser: (state) => state.user,
		isLoggedIn: (state) => state.isAuthenticated
	},

	actions: {
		setUser(user: User) {
			this.user = user;
			this.isAuthenticated = true;
		},

		setToken(token: string) {
			this.token = token;
		},

		logout() {
			this.user = null;
			this.token = null;
			this.isAuthenticated = false;
		}
	}
});
