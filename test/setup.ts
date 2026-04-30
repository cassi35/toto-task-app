import { PrismaClient } from '@prisma/client';
import { setupDatabase, teardownDatabase } from '../test/helpers/database';
let prisma: PrismaClient;
beforeAll(async () => {
  await setupDatabase();
  prisma = new PrismaClient();
});
afterAll(async () => {
  await prisma.$disconnect();
  await teardownDatabase();
});
