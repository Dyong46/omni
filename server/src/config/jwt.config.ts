import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
	'jwt',
	(): JwtModuleOptions => ({
		secret: process.env.JWT_SECRET,
		signOptions: {
			expiresIn: Number.parseInt(process.env.JWT_EXPIRATION || '15', 10) * 60,
		},
	}),
);
