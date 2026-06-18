import { InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from 'src/modules/email/email.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import {
  sendEmailDtoFixture,
  sendMailResultFixture,
} from 'test/fixtures/email.fixture';
import { loggerMock } from 'test/mock/services/authService.mock';
import { mailerServiceMock } from 'test/mock/services/mailerService.mock';

describe('EmailService (unit)', () => {
  let service: EmailService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: mailerServiceMock },
        { provide: MyLoggerService, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      mailerServiceMock.sendMail.mockResolvedValue(sendMailResultFixture);

      const result = await service.sendEmail(
        sendEmailDtoFixture.to,
        sendEmailDtoFixture.subject,
        sendEmailDtoFixture.template,
        sendEmailDtoFixture.context,
      );

      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
        to: sendEmailDtoFixture.to,
        subject: sendEmailDtoFixture.subject,
        template: sendEmailDtoFixture.template,
        context: sendEmailDtoFixture.context,
      });
      expect(result).toEqual(sendMailResultFixture);
    });

    it('should throw InternalServerErrorException when mailer fails', async () => {
      const MAIL_ERROR = new Error('smtp failed');
      mailerServiceMock.sendMail.mockRejectedValue(MAIL_ERROR);
      await expect(
        service.sendEmail(
          sendEmailDtoFixture.to,
          sendEmailDtoFixture.subject,
          sendEmailDtoFixture.template,
          sendEmailDtoFixture.context,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Falha no envio de e-mail'),
      );

      expect(loggerMock.error).toHaveBeenCalledWith(
        MAIL_ERROR.message,
        MAIL_ERROR.stack,
      );
    });
  });
});
