import { getQueueToken } from '@nestjs/bullmq';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import InvalidEmailException from 'src/common/exeptions/auth/invalid-email.exception';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import UserNotFoundException from 'src/common/exeptions/users/user-not-found.exception';

import { DatabaseService } from 'src/database/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { CookieService } from 'src/modules/auth/validators/cookie.service';
import { TokenServiceValidator } from 'src/modules/auth/validators/token.service';
import { UserValidatorService } from 'src/modules/auth/validators/user.service';
import { TokenService } from 'src/modules/token/token.service';
import { UsersService } from 'src/modules/users/users.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import TokenValidatorService from 'src/shared/builders/token.builder';
import UserValidatorBuilder from 'src/shared/builders/user.builder';

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
  jwtMock,
  loggerMock,
  tokenServiceMock,
  usersServiceMock,
} from 'test/mock/services/authService.mock';

const emailQueueMock = {
  add: jest.fn(),
};

const JWT_TOKEN = 'jwt-token-123';
const HASHED_PASSWORD = 'hashed-password';
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        CookieService,
        TokenServiceValidator,
        UserValidatorService,
        UserValidatorBuilder,
        TokenValidatorService,
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: MyLoggerService, useValue: loggerMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: getQueueToken('email'), useValue: emailQueueMock },
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

  describe.skip('loginOauth', () => {
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

      expect(emailQueueMock.add).toHaveBeenCalled();

      expect(result.token).toEqual(JWT_TOKEN);
      expect(result.success).toBe(true);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

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
      ).rejects.toThrow(new InvalidEmailException());
    });

    it('should throw when user is not found', async () => {
      usersServiceMock.finEmail.mockResolvedValue(null);

      await expect(
        service.login(loginDtoFixture, replyMock as any),
      ).rejects.toThrow(new UserNotFoundException());
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
        new TokenNotFoundException(),
      );
    });
  });
  describe('signup', () => {
    it('should sinup a new user', async () => {});
  });
});
