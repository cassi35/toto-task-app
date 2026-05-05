export const replyMock = {
  status: jest.fn().mockReturnThis(),
  redirect: jest.fn(),
  setCookie: jest.fn(),
  clearCookie: jest.fn(),
} as any;
