export const tokenServiceMock = {
  create: jest.fn(),
  findByUserId: jest.fn(),
  findByToken: jest.fn(),
  validateToken: jest.fn(),
  consumeToken: jest.fn(),
};
