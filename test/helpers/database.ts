import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
let container: StartedPostgreSqlContainer;
export const setupDatabase = async () => {
  // cria um container PostgreSQL usando o testcontainers
  container = await new PostgreSqlContainer('postgres:15.3-alpine')
    .withDatabase('toto')
    .withUsername('toto')
    .withPassword('toto')
    .start();
  const databaseUrl = container.getConnectionUri();
  // define a variável de ambiente DATABASE_URL para que o Prisma possa se conectar ao banco de dados
  process.env.DATABASE_URL = databaseUrl;
  // executa as migrações do Prisma para criar as tabelas no banco de dados
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  } as any);
  return container;
};
export const teardownDatabase = async () => {
  if (container) {
    await container.stop();
  }
};
