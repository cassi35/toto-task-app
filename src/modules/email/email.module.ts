import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
// const {
//   HandlebarsAdapter,
// } = require('@nestjs-modules/mailer/adapters/handlebars.adapter');

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Adicione isso
import { join } from 'path';
import { EmailService } from './email.service';
import { MyLoggerModule } from 'src/my-logger/my-logger.module';

console.log('HandlebarsAdapter tipo:', typeof HandlebarsAdapter);
console.log('keys:', Object.keys(HandlebarsAdapter));
@Module({
  imports: [
    MyLoggerModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: config.get('EMAIL_USER'),
            clientId: config.get('CLIENT_ID'),
            clientSecret: config.get('CLIENT_SECRET_GOOGLE'),
            refreshToken: config.get('REFRESH_TOKEN'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('EMAIL_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
