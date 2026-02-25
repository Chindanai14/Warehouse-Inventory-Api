import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ป้องกัน HTTP Header attacks
  app.use(helmet());

  // ✅ FIX: CORS — ระบุ origin ชัดเจน ไม่เปิด * wildcard
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // อนุญาต requests ที่ไม่มี origin (เช่น Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" is not allowed`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Error Handler
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Format
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger (เปิดเฉพาะ non-production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Warehouse Inventory API')
      .setDescription('เอกสารอธิบายระบบจัดการคลังสินค้าและสต๊อก')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📖 Swagger: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server: http://localhost:${process.env.PORT ?? 3000}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('❌ Startup error:', err);
  process.exit(1);
});
