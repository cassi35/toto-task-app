import { Test, TestingModule } from '@nestjs/testing';
import { TokenType } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { TokenService } from 'src/modules/token/token.service';
import {
  expiredTokenEntityFixture,
  tokenCreateInputFixture,
  tokenEntityFixture,
} from 'test/fixtures/token.fixture';
import { databaseServiceMock } from 'test/mock/database.mock';

describe('TokenService (unit)', () => {
  let service: TokenService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  describe('findByUserId', () => {
    it('should find token by user id', async () => {
      databaseServiceMock.token.findFirst.mockResolvedValue(tokenEntityFixture);

      const result = await service.findByUserId(tokenCreateInputFixture.userId);

      expect(databaseServiceMock.token.findFirst).toHaveBeenCalledWith({
        where: { userId: tokenCreateInputFixture.userId },
      });
      expect(result).toEqual(tokenEntityFixture);
    });
  });

  describe('create', () => {
    it('should create a token', async () => {
      databaseServiceMock.token.create.mockResolvedValue(tokenEntityFixture);

      const result = await service.create(
        tokenCreateInputFixture.token,
        tokenCreateInputFixture.userId,
        tokenCreateInputFixture.type,
        tokenCreateInputFixture.expiresAt,
      );

      expect(databaseServiceMock.token.create).toHaveBeenCalledWith({
        data: tokenCreateInputFixture,
      });
      expect(result).toEqual(tokenEntityFixture);
    });
  });

  describe('findByToken', () => {
    it('should find token by token value', async () => {
      databaseServiceMock.token.findUnique.mockResolvedValue(tokenEntityFixture);

      const result = await service.findByToken(tokenCreateInputFixture.token);

      expect(databaseServiceMock.token.findUnique).toHaveBeenCalledWith({
        where: { token: tokenCreateInputFixture.token },
      });
      expect(result).toEqual(tokenEntityFixture);
    });
  });

  describe('validateToken', () => {
    it('should return token when it is valid', async () => {
      databaseServiceMock.token.findUnique.mockResolvedValue(tokenEntityFixture);

      const result = await service.validateToken(
        tokenEntityFixture.token,
        TokenType.REFRESH,
      );

      expect(result).toEqual(tokenEntityFixture);
    });

    it('should throw when token does not exist', async () => {
      databaseServiceMock.token.findUnique.mockResolvedValue(null);

      await expect(
        service.validateToken(tokenEntityFixture.token, TokenType.REFRESH),
      ).rejects.toThrow(new Error('Token inválido'));
    });

    it('should throw when token type does not match', async () => {
      databaseServiceMock.token.findUnique.mockResolvedValue(tokenEntityFixture);

      await expect(
        service.validateToken(tokenEntityFixture.token, TokenType.RESET),
      ).rejects.toThrow(new Error('Token inválido'));
    });

    it('should throw when token is expired', async () => {
      databaseServiceMock.token.findUnique.mockResolvedValue(expiredTokenEntityFixture);

      await expect(
        service.validateToken(expiredTokenEntityFixture.token, TokenType.REFRESH),
      ).rejects.toThrow(new Error('Token expirado'));
    });
  });

  describe('consumeToken', () => {
    it('should delete token by token value', async () => {
      databaseServiceMock.token.delete.mockResolvedValue(tokenEntityFixture);

      await service.consumeToken(tokenEntityFixture.token);

      expect(databaseServiceMock.token.delete).toHaveBeenCalledWith({
        where: { token: tokenEntityFixture.token },
      });
    });
  });

  describe('cleanupExpired', () => {
    it('should delete expired tokens', async () => {
      databaseServiceMock.token.deleteMany.mockResolvedValue({ count: 1 });

      await service.cleanupExpired();

      expect(databaseServiceMock.token.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });
});
