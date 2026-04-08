import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { Injectable } from '@nestjs/common';
import { JWTUser } from 'src/types';
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(), // <-- ISSO
        (request: FastifyRequest) => {
          return request?.cookies?.access_token ?? null;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  validate(payload: any): JWTUser {
    // O que retornar aqui vira o 'req.user' no Controller
    return { id: payload.sub, email: payload.email };
  }
}
