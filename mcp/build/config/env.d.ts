import 'dotenv/config';
import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    JIRA_NAME: z.ZodString;
    JIRA_EMAIL: z.ZodString;
    JIRA_HOST: z.ZodString;
    GOOGLE_OLLAMA_API_KEY: z.ZodString;
    NAME_MODEL: z.ZodString;
    BASE_URL: z.ZodString;
}, z.core.$strip>;
type envSchema = z.infer<typeof envSchema>;
declare global {
    namespace NodeJS {
        interface ProcessEnv extends envSchema {
        }
    }
}
export {};
//# sourceMappingURL=env.d.ts.map