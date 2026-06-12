import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as bcrypt from 'bcrypt';
@Injectable()
export class CookieService {
  constructor(private jwtService: JwtService) {}

  setTokenCookie(reply: FastifyReply, token: string) {
    return reply.setCookie('access_token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
    });
  }

  clearCookie(reply: FastifyReply, req: FastifyRequest) {
    reply.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  async genarateJWT(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    }); //faltou tempo de seguranca
  }
  generateToken(): string {
    const verificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return verificationToken;
  }
  async encode(passoword: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(passoword, salt);
  }
}
