import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
	nodeEnv: process.env.NODE_ENV || 'development',
	port: Number.parseInt(process.env.PORT || '3000', 10),
	appUrl: process.env.APP_URL || 'http://localhost:3000',
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
	maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
	uploadLocation: process.env.UPLOAD_LOCATION || './uploads',
}));
