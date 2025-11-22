export interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "user" | "manager";
	avatar?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}
