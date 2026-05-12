import { Test, TestingModule } from '@nestjs/testing';
import { TokenType } from '@prisma/client';

import { DatabaseService } from 'src/database/database.service';
import { TokenService } from 'src/modules/token/token.service';
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
  it('findByUserId should return token', async () => {
    const token = {
      id: 1,
      token: 'abc',
      userId: 7,
      type: 'REFRESH' as TokenType,
      expiresAt: new Date(Date.now() + 60_000),
    };

    databaseServiceMock.token.findByToken.mockResolvedValue(token);

    const result = await service.findByUserId(7);

    expect(databaseServiceMock.token.findByToken).toHaveBeenCalledWith({
      where: { userId: 7 },
    });
    expect(result).toEqual(token);
  });

  it('create should persist token', async () => {
    const created = {
      id: 1,
      token: 'abc',
      userId: 6,
      type: 'REFRESH' as TokenType,
      expiresAt: new Date(Date.now() + 60_000),
    };

    databaseServiceMock.token.create.mockResolvedValue(created);

    const result = await service.create(
      'abc',
      6,
      'REFRESH' as TokenType,
      created.expiresAt,
    );

    expect(databaseServiceMock.token.create).toHaveBeenCalledWith({
      data: {
        token: 'abc',
        userId: 6,
        type: 'REFRESH' as TokenType,
        expiresAt: created.expiresAt,
      },
    });
    expect(result).toEqual(created);
  });

  it('findByToken should return token', async () => {
    const token = {
      id: 1,
      token: 'abc',
      userId: 6,
      type: 'REFRESH' as TokenType,
      expiresAt: new Date(Date.now() + 60_000),
    };

    databaseServiceMock.token.findByToken.mockResolvedValue(token);

    const result = await service.findByToken('abc');

    expect(databaseServiceMock.token.findByToken).toHaveBeenCalledWith({
      where: { token: 'abc' },
    });
    expect(result).toEqual(token);
  });

  it('validateToken should throw when token does not exist', async () => {
    databaseServiceMock.token.findByToken.mockResolvedValue(null);

    await expect(
      service.validateToken('missing', 'REFRESH' as TokenType),
    ).rejects.toThrow('Token inválido');

    expect(databaseServiceMock.token.findByToken).toHaveBeenCalledWith({
      where: { token: 'missing' },
    });
  });

  it('validateToken should throw when token type does not match', async () => {
    const token = {
      id: 1,
      token: 'abc',
      userId: 6,
      type: 'ACCESS' as TokenType,
      expiresAt: new Date(Date.now() + 60_000),
    };

    databaseServiceMock.token.findByToken.mockResolvedValue(token);

    await expect(
      service.validateToken('abc', 'REFRESH' as TokenType),
    ).rejects.toThrow('Token inválido');
  });

  it('validateToken should throw when token is expired', async () => {
    const token = {
      id: 1,
      token: 'abc',
      userId: 6,
      type: 'REFRESH' as TokenType,
      expiresAt: new Date(Date.now() - 60_000),
    };

    databaseServiceMock.token.findByToken.mockResolvedValue(token);

    await expect(
      service.validateToken('abc', 'REFRESH' as TokenType),
    ).rejects.toThrow('Token expirado');
  });

  it('validateToken should return token when valid', async () => {
    const token = {
      id: 1,
      token: 'abc',
      userId: 6,
      type: 'REFRESH' as TokenType,
      expiresAt: new Date(Date.now() + 60_000),
    };

    databaseServiceMock.token.findByToken.mockResolvedValue(token);

    const result = await service.validateToken('abc', 'REFRESH' as TokenType);

    expect(result).toEqual(token);
  });

  it('consumeToken should delete token', async () => {
    databaseServiceMock.token.consumeToken.mockResolvedValue({});

    await service.consumeToken('abc');

    expect(databaseServiceMock.token.consumeToken).toHaveBeenCalledWith({
      where: { token: 'abc' },
    });
  });

  it('cleanupExpired should delete expired tokens', async () => {
    databaseServiceMock.token.cleanupExpired.mockResolvedValue({ count: 0 });

    await service.cleanupExpired();

    expect(databaseServiceMock.token.cleanupExpired).toHaveBeenCalled();

    const call = databaseServiceMock.token.cleanupExpired.mock.calls[0][0];
    expect(call).toEqual({
      where: {
        expiresAt: {
          lt: expect.any(Date),
        },
      },
    });
  });
});
