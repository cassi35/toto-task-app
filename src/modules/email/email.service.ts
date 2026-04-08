import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailerService,
    private logger: MyLoggerService,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any = {}, // Adicionei o context para passar dados ao HBS
  ): Promise<any> {
    try {
      console.log(`[EmailService] Tentando enviar e-mail para: ${to}`);
      const result = await this.mailService.sendMail({
        to: to,
        subject,
        template,
        context, // Aqui é onde o {{name}} do seu HBS é preenchido
      });
      console.log(`✅ Email enviado com sucesso para ${to}`);
      return result;
    } catch (err: any) {
      this.logger.error(err.message, err.stack);
      // Relançar o erro para que o NestJS/Controller saiba que falhou
      throw new InternalServerErrorException('Falha no envio de e-mail');
    }
  }
}
