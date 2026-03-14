import axios from "~/utils/axios";

export interface AuthUser {
	id: number;
	username: string;
	role: "admin" | "user";
	createdAt: string;
	updatedAt: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	access_token: string;
	refresh_token: string;
	user: AuthUser;
}

export interface RegisterRequest {
	username: string;
	password: string;
	role?: "admin" | "user";
}

export interface CreateManagedUserRequest {
	username: string;
	password: string;
}

export interface UpdateManagedUserRequest {
	username?: string;
	password?: string;
}

class AuthService {
	private readonly endpoint = "/auth";

	/**
	 * Login user
	 */
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		return axios.post(`${this.endpoint}/login`, credentials);
	}

	/**
	 * Refresh access token
	 */
	async refreshToken(refreshToken: string): Promise<Pick<LoginResponse, "access_token" | "refresh_token">> {
		return axios.post(`${this.endpoint}/refresh`, { refresh_token: refreshToken });
	}

	/**
	 * Register new user
	 */
	async register(data: RegisterRequest): Promise<AuthUser> {
		return axios.post(`${this.endpoint}/register`, data);
	}

	/**
	 * Get current user profile
	 */
	async getProfile(): Promise<AuthUser> {
		return axios.get(`${this.endpoint}/profile`);
	}

	/**
	 * Update user profile
	 */
	async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
		return axios.patch(`${this.endpoint}/profile`, data);
	}

	/**
	 * Admin: list managed users (role=user)
	 */
	async getUsers(): Promise<AuthUser[]> {
		return axios.get(`${this.endpoint}/users`);
	}

	/**
	 * Admin: create a managed user (role=user)
	 */
	async createUser(data: CreateManagedUserRequest): Promise<AuthUser> {
		return axios.post(`${this.endpoint}/users`, data);
	}

	/**
	 * Admin: update a managed user (role=user)
	 */
	async updateUser(id: number, data: UpdateManagedUserRequest): Promise<AuthUser> {
		return axios.put(`${this.endpoint}/users/${id}`, data);
	}

	/**
	 * Admin: delete a managed user (role=user)
	 */
	async deleteUser(id: number): Promise<{ message: string; id: number }> {
		return axios.delete(`${this.endpoint}/users/${id}`);
	}

	/**
	 * Change password
	 */
	async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
		return axios.post(`${this.endpoint}/change-password`, data);
	}

	/**
	 * Logout (client-side only - clear token)
	 */
	logout(): void {
		if (globalThis.window !== undefined) {
			localStorage.removeItem("token");
			localStorage.removeItem("refresh_token");
		}
	}
}

export default new AuthService();
