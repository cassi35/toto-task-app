import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Token, TokenType } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import InvalidTokenException from 'src/common/exeptions/token/invalid-token.exception';
import TokenExpiredException from 'src/common/exeptions/token/token-expired.exception';
@Injectable()
export class TokenService {
  constructor(private readonly database: DatabaseService) {}
  async findByUserId(userId: number) {
    return this.database.token.findFirst({
      where: {
        userId,
      },
    });
  }
  async create(
    token: string,
    userId: number,
    type: TokenType,
    expiresAt: Date,
  ): Promise<Token> {
    return this.database.token.create({
      data: {
        token,
        userId,
        type,
        expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return this.database.token.findUnique({
      where: { token },
    });
  }

  async validateToken(token: string, type: TokenType): Promise<Token> {
    const existing = await this.database.token.findUnique({
      where: { token },
    });

    if (!existing || existing.type !== type) {
      throw new InvalidTokenException();
    }

    if (existing.expiresAt < new Date()) {
      throw new TokenExpiredException();
    }

    return existing;
  }

  async consumeToken(token: string): Promise<void> {
    await this.database.token.delete({
      where: { token },
    });
  }
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupExpired(): Promise<void> {
    await this.database.token.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
