import { FastifyRequest } from 'fastify';

export interface JWTUser {
  id: number;
  email: string;
}
export type OauthUser = {
  email: string;
  name: string;
  provider: 'GOOGLE' | 'LOCAL' | 'AZURE';
  providerId: string;
};
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTUser;
  }
}
export interface Profile {}
export type AzureAdProfile = {
  oid: string;
  displayName?: string;
  emails?: { value: string }[];
  name?: {
    familyName?: string;
    givenName?: string;
  };
  _json?: any;
};
