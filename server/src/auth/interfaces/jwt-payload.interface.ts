export interface JwtPayload {
	sub: number;
	username: string;
	role: string;
}

export interface AuthenticatedUser {
	id: number;
	username: string;
	role: string;
}
