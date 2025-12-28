import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CustomerModule } from './customer/customer.module';
import { OrdersModule } from './orders/orders.module';
import { AppConfigModule } from './app-config/app-config.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [databaseConfig, jwtConfig, appConfig],
			envFilePath: '.env',
		}),

		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
				const dbConfig = configService.get<TypeOrmModuleOptions>('database');

				if (!dbConfig) {
					throw new Error('Missing database config');
				}

				return dbConfig;
			},
			inject: [ConfigService],
		}),

		AuthModule,
		UsersModule,
		CategoriesModule,
		ProductsModule,
		CustomerModule,
		OrdersModule,
		AppConfigModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
