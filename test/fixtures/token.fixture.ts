import { TokenType } from '@prisma/client';

export const tokenCreateInputFixture = {
  token: 'refresh-token-123',
  userId: 10,
  type: TokenType.REFRESH,
  expiresAt: new Date('2099-01-01T00:00:00.000Z'),
};

export const tokenEntityFixture = {
  id: 11,
  token: tokenCreateInputFixture.token,
  userId: tokenCreateInputFixture.userId,
  type: tokenCreateInputFixture.type,
  expiresAt: tokenCreateInputFixture.expiresAt,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

export const expiredTokenEntityFixture = {
  ...tokenEntityFixture,
  token: 'expired-token-123',
  expiresAt: new Date('2020-01-01T00:00:00.000Z'),
};
