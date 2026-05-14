import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from 'src/database/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { EmailService } from 'src/modules/email/email.service';
import { TokenService } from 'src/modules/token/token.service';
import { UsersService } from 'src/modules/users/users.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

import {
  forgotPasswordDtoFixture,
  inactiveUserEntityFixture,
  loginDtoFixture,
  oauthUserFixture,
  resetPasswordDtoFixture,
  signupDtoFixture,
  tokenEntityFixture,
  userEntityFixture,
} from 'test/fixtures/auth.fixture';

import { databaseServiceMock } from 'test/mock/database.mock';
import { replyMock } from 'test/mock/reply.mock';

import {
  emailServiceMock,
  jwtMock,
  loggerMock,
  tokenServiceMock,
  usersServiceMock,
} from 'test/mock/services/authService.mock';

const JWT_TOKEN = 'jwt-token-123';
const HASHED_PASSWORD = 'hashed-password';

const INVALID_EMAIL_ERROR = new HttpException('Invalid email', 400);
const INVALID_PASSWORD_ERROR = new HttpException('Invalid password', 400);
const USER_NOT_FOUND_ERROR = new HttpException('User not found', 404);
const TOKEN_NOT_FOUND_ERROR = new HttpException('Token not found', 404);

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: MyLoggerService, useValue: loggerMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('redirect', () => {
    it('should redirect to google oauth url', async () => {
      process.env.GOOGLE_LOGIN =
        'https://accounts.google.com/o/oauth2/v2/auth?';

      await service.redirect('google', replyMock as any);

      expect(replyMock.status).toHaveBeenCalledWith(302);

      expect(replyMock.redirect).toHaveBeenCalledWith(
        expect.stringContaining(process.env.GOOGLE_LOGIN),
      );
    });
  });

  describe('loginOauth', () => {
    it('should login existing oauth user', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      jwtMock.signAsync.mockResolvedValue(JWT_TOKEN);

      const result = await service.loginOauth(
        oauthUserFixture as any,
        replyMock as any,
      );

      expect(usersServiceMock.finEmail).toHaveBeenCalledWith(
        oauthUserFixture.email,
      );

      expect(replyMock.setCookie).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Login successful',
        token: JWT_TOKEN,
        verified: true,
      });
    });

    it('should create oauth user when not found', async () => {
      const oauthCreatedUser = {
        ...userEntityFixture,
        email: oauthUserFixture.email,
      };

      usersServiceMock.finEmail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(oauthCreatedUser);

      jwtMock.signAsync.mockResolvedValue(JWT_TOKEN);

      const result = await service.loginOauth(
        oauthUserFixture as any,
        replyMock as any,
      );

      expect(usersServiceMock.create).toHaveBeenCalled();

      expect(emailServiceMock.sendEmail).toHaveBeenCalled();

      expect(result.token).toEqual(JWT_TOKEN);
      expect(result.success).toBe(true);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      jwtMock.signAsync.mockResolvedValue(JWT_TOKEN);

      const result = await service.login(loginDtoFixture, replyMock as any);

      expect(usersServiceMock.finEmail).toHaveBeenCalledWith(
        loginDtoFixture.email,
      );

      expect(replyMock.setCookie).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should throw for invalid email', async () => {
      await expect(
        service.login(
          {
            ...loginDtoFixture,
            email: 'invalid-email',
          },
          replyMock as any,
        ),
      ).rejects.toThrow(INVALID_EMAIL_ERROR);
    });

    it('should throw when user is not found', async () => {
      usersServiceMock.finEmail.mockResolvedValue(null);

      await expect(
        service.login(loginDtoFixture, replyMock as any),
      ).rejects.toThrow(USER_NOT_FOUND_ERROR);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user and consume token', async () => {
      tokenServiceMock.findByToken.mockResolvedValue(tokenEntityFixture);

      usersServiceMock.findByUserId.mockResolvedValue(userEntityFixture);

      const result = await service.verifyEmail(tokenEntityFixture.token);

      expect(usersServiceMock.update).toHaveBeenCalledWith(
        userEntityFixture.id,
        { isActive: true },
      );

      expect(tokenServiceMock.consumeToken).toHaveBeenCalledWith(
        tokenEntityFixture.token,
      );

      expect(result).toEqual({
        message: 'User verified successfully',
        statusCode: HttpStatus.OK,
        success: true,
        verified: true,
      });
    });

    it('should throw when token does not exist', async () => {
      tokenServiceMock.findByToken.mockResolvedValue(null);

      await expect(service.verifyEmail('missing-token')).rejects.toThrow(
        TOKEN_NOT_FOUND_ERROR,
      );
    });
  });
  describe('signup', () => {
    it('should sinup a new user', async () => {});
  });
});
