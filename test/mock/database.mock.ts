export const databaseServiceMock = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  token: {
    create: jest.fn(),
    findByToken: jest.fn(),
    validateToken: jest.fn(),
    consumeToken: jest.fn(),
    cleanupExpired: jest.fn(),
  },
  employee: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};
