export const authServiceMock = {
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassoword: jest.fn(),
  verifyEmail: jest.fn(),
  redirect: jest.fn(),
  loginOauth: jest.fn(),
};
