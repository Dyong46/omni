import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Safely parse boolean environment variables
 * @param value - The environment variable value
 * @param defaultValue - Default value if undefined
 * @returns boolean value
 */
function parseBooleanEnv(
	value: string | undefined,
	defaultValue = false,
): boolean {
	if (value === undefined || value === '') {
		return defaultValue;
	}

	const normalizedValue = value.toLowerCase().trim();

	// Explicitly check for true values
	if (
		normalizedValue === 'true' ||
		normalizedValue === '1' ||
		normalizedValue === 'yes'
	) {
		return true;
	}

	// Explicitly check for false values
	if (
		normalizedValue === 'false' ||
		normalizedValue === '0' ||
		normalizedValue === 'no'
	) {
		return false;
	}

	// Invalid value - throw error to prevent accidental misconfiguration
	throw new Error(
		`Invalid boolean value for environment variable: "${value}". ` +
			`Expected: true/false, 1/0, yes/no (case-insensitive)`,
	);
}

export default registerAs('database', (): TypeOrmModuleOptions => {
	const nodeEnv = process.env.NODE_ENV || 'development';
	const dbPassword = process.env.DB_PASSWORD;
	if (!dbPassword) {
		throw new Error(
			'Database password (DB_PASSWORD) must be set and non-empty',
		);
	}
	const synchronize = parseBooleanEnv(process.env.DB_SYNCHRONIZE, false);

	// Security check: Prevent synchronize in production
	if (nodeEnv === 'production' && synchronize) {
		throw new Error(
			'DB_SYNCHRONIZE cannot be enabled in production environment. ' +
				'This can lead to data loss. Use migrations instead.',
		);
	}

	return {
		type: 'mysql',
		host: process.env.DB_HOST || 'localhost',
		port: Number.parseInt(process.env.DB_PORT || '3306', 10),
		username: process.env.DB_USERNAME || 'root',
		password: dbPassword,
		database: process.env.DB_DATABASE || 'omni_sales',
		entities: [__dirname + '/../**/*.entity{.ts,.js}'],
		synchronize,
		// logging: nodeEnv === 'development',
		// timezone: '+07:00', // Vietnam timezone
		// charset: 'utf8mb4',
	};
});
