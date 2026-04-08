import 'dotenv/config';
import { z } from 'zod';
export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  SENDER_EMAIL_FROM_GMAIL: z.string(),
  SENHA_DE_APP: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET_GOOGLE: z.string(),
  REFRESH_TOKEN: z.string(),
  EMAIL_USER: z.string(),
});
export type envSchema = z.infer<typeof envSchema>;
// 2. Faz o Parse (Validação)
const _env = envSchema.parse(process.env);

// 3. Mescla os valores validados de volta no process.env real
Object.assign(process.env, _env);

// 4. Libera o Intellisense global para o VS Code
declare global {
  namespace NodeJS {
    interface ProcessEnv extends envSchema {}
  }
}
