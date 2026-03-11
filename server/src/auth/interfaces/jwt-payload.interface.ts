export interface JwtPayload {
	sub: number;
	username: string;
	role: string;
	tokenType?: 'access' | 'refresh';
}

export interface AuthenticatedUser {
	id: number;
	username: string;
	role: string;
}
