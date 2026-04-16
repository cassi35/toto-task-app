import 'dotenv/config';
import { z } from 'zod';
export const envSchema = z.object({
  JIRA_NAME: z.string(),
  JIRA_EMAIL: z.string(),
  JIRA_HOST: z.string(),
  GOOGLE_OLLAMA_API_KEY: z.string(),
  NAME_MODEL: z.string(),
  BASE_URL: z.string(),
});
type envSchema = z.infer<typeof envSchema>;
declare global {
  namespace NodeJS {
    interface ProcessEnv extends envSchema {}
  }
}
const parseEnv = envSchema.parse(process.env);
process.env = Object.create({ ...process.env, ...parseEnv });
