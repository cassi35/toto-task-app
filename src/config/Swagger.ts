import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('API for managing users')
    .setVersion('1.0')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // No Fastify, às vezes é necessário especificar o caminho do JSON
  SwaggerModule.setup('swagger', app, document, {
    useGlobalPrefix: false, // Isso garante que ele ignore o '/api'
  });
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  console.log('Swagger disponível em: http://localhost:8000/swagger');
}
