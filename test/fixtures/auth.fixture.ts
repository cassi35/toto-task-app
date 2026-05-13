import { TokenType } from '@prisma/client';

export const loginDtoFixture = {
  email: 'auth.user@example.com',
  password: 'Password@123',
};

export const signupDtoFixture = {
  email: 'signup.user@example.com',
  password: 'Password@123',
};

export const forgotPasswordDtoFixture = {
  email: 'forgot.user@example.com',
};

export const resetPasswordDtoFixture = {
  token: 'reset-token-123',
  newPassword: 'NewPassword@123',
};

export const userEntityFixture = {
  id: 1,
  email: 'auth.user@example.com',
  password: 'hashed-password',
  isActive: true,
  provider: null,
  providerId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export const inactiveUserEntityFixture = {
  ...userEntityFixture,
  isActive: false,
};

export const oauthUserFixture = {
  email: 'oauth.user@example.com',
  provider: 'GOOGLE',
  providerId: 'google-provider-id-1',
};

export const tokenEntityFixture = {
  id: 1,
  token: 'verification-token-123',
  userId: 1,
  type: TokenType.REFRESH,
  expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};
