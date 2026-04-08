import { FastifyRequest } from 'fastify';

export interface JWTUser {
  id: number;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTUser;
  }
}
