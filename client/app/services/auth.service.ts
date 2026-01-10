import axios from "~/utils/axios";

export interface AuthUser {
	id: number;
	username: string;
	role: string;
	createdAt: string;
	updatedAt: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	access_token: string;
	user: AuthUser;
}

export interface RegisterRequest {
	username: string;
	password: string;
	role?: string;
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
	 * Change password
	 */
	async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
		return axios.post(`${this.endpoint}/change-password`, data);
	}

	/**
	 * Logout (client-side only - clear token)
	 */
	logout(): void {
		if (typeof globalThis.window !== "undefined") {
			localStorage.removeItem("token");
		}
	}
}

export default new AuthService();
