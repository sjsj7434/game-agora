import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser());

	const configService = app.get(ConfigService);
	const serverConfig = configService.get('server');

	app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	await app.listen(serverConfig.port);

	console.log(`[main.ts] Server is running on http://localhost:${serverConfig.port}`);
}

bootstrap();