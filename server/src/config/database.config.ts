import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
	'database',
	(): TypeOrmModuleOptions => ({
		type: 'mysql',
		host: process.env.DB_HOST || 'localhost',
		port: Number.parseInt(process.env.DB_PORT || '3306', 10),
		username: process.env.DB_USERNAME || 'root',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_DATABASE || 'omni_sales',
		entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
		migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
		synchronize: process.env.DB_SYNCHRONIZE === 'true', // Only for development
		logging: process.env.NODE_ENV === 'development',
		timezone: '+07:00', // Vietnam timezone
		charset: 'utf8mb4',
	}),
);
