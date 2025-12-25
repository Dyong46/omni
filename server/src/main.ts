import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	const corsOrigin = configService.get<string>('app.corsOrigin') ?? '*';

	app.setGlobalPrefix('api');

	app.enableCors({
		origin: corsOrigin,
		credentials: true,
	});

	// app.useGlobalPipes(
	// 	new ValidationPipe({
	// 		whitelist: true,
	// 		forbidNonWhitelisted: true,
	// 		transform: true,
	// 		transformOptions: {
	// 			enableImplicitConversion: true,
	// 		},
	// 	}),
	// );

	// app.useGlobalFilters(new HttpExceptionFilter());

	// app.useGlobalInterceptors(
	// 	new TransformInterceptor(),
	// 	new LoggingInterceptor(),
	// );

	if (configService.get('app.nodeEnv') === 'development') {
		const config = new DocumentBuilder()
			.setTitle('Multi-channel Sales Management API')
			.setDescription('API documentation for multi-channel sales system')
			.setVersion('1.0')
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api/docs', app, document);
	}

	const port = configService.get('app.port') as number;
	await app.listen(port);

	console.log(`🚀 Application is running on: http://localhost:${port}`);
	console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
