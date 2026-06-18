import 'dotenv/config';
import 'src/config/env';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { setupDatabase, teardownDatabase } from '../test/helpers/database';

// // Avoid loading native css-inline internals from Handlebars adapter in e2e.
// jest.mock('@nestjs-modules/mailer/adapters/handlebars.adapter', () => ({
//   HandlebarsAdapter: class HandlebarsAdapterMock {},
// }));

let prisma: PrismaClient;
beforeAll(async () => {
  await setupDatabase();
  prisma = new PrismaClient();
});
afterAll(async () => {
  if (prisma) await prisma.$disconnect();
  await teardownDatabase();
});
