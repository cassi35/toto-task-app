export const authServiceMock = {
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
  redirect: jest.fn(),
  loginOauth: jest.fn(),
};
export const usersServiceMock = {
  create: jest.fn(),
  findByUserId: jest.fn(),
  finEmail: jest.fn(),
  update: jest.fn(),
};

export const tokenServiceMock = {
  create: jest.fn(),
  findByUserId: jest.fn(),
  findByToken: jest.fn(),
  validateToken: jest.fn(),
  consumeToken: jest.fn(),
};

export const emailServiceMock = {
  sendEmail: jest.fn(),
};

export const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
};

export const replyMock = {
  status: jest.fn().mockReturnThis(),
  redirect: jest.fn(),
  setCookie: jest.fn(),
  clearCookie: jest.fn(),
};

export const jwtMock = {
  sign: jest.fn(),
  signAsync: jest.fn(),
  verify: jest.fn(),
};
