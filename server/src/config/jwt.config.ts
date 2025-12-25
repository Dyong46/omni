import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
	'jwt',
	(): JwtModuleOptions => {
		const secret = process.env.JWT_SECRET;

		if (!secret) {
			throw new Error('JWT_SECRET environment variable is not defined');
		}

		return {
			secret,
			signOptions: {
				expiresIn: Number.parseInt(process.env.JWT_EXPIRATION || '15', 10) * 60,
			},
		};
	},
);
