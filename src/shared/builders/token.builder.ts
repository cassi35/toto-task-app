import { Token } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import TokenExpiredException from 'src/common/exeptions/token/token-expired.exception';
import InvalidTokenException from 'src/common/exeptions/token/invalid-token.exception';
import { TokenService } from 'src/modules/token/token.service';

interface TokenInitialChain {
  exists(): Promise<TokenValidationChain>;
}

interface TokenByUserInitialChain {
  existsByUserId(): Promise<TokenValidationChain>;
}

export interface TokenValidationChain {
  notExpired(): this;
  matchesToken(): this;
  get(): Token;
}

interface TokenValidatorProtocol {
  validate(token: string): TokenInitialChain;
  validateByUserId(userId: number): TokenByUserInitialChain;
}

@Injectable()
export class TokenValidatorService implements TokenValidatorProtocol {
  constructor(private tokenService: TokenService) {}

  validate(token: string): TokenInitialChain {
    return new TokenValidationChainInternal(this.tokenService, token);
  }

  validateByUserId(userId: number): TokenByUserInitialChain {
    return new TokenValidationChainInternal(
      this.tokenService,
      undefined,
      userId,
    );
  }
}

class TokenValidationChainInternal
  implements TokenInitialChain, TokenByUserInitialChain, TokenValidationChain
{
  private tokenData: Token | null = null;

  constructor(
    private tokenService: TokenService,
    private token?: string,
    private userId?: number,
  ) {}

  async exists(): Promise<TokenValidationChain> {
    this.tokenData = await this.tokenService.findByToken(this.token!);
    if (!this.tokenData) {
      throw new TokenNotFoundException();
    }
    return this;
  }

  async existsByUserId(): Promise<TokenValidationChain> {
    this.tokenData = await this.tokenService.findByUserId(this.userId!);
    if (!this.tokenData) {
      throw new TokenNotFoundException();
    }
    return this;
  }

  notExpired(): this {
    if (this.tokenData!.expiresAt < new Date())
      throw new TokenExpiredException();
    return this;
  }

  matchesToken(): this {
    if (this.tokenData!.token !== this.token) throw new InvalidTokenException();
    return this;
  }

  get(): Token {
    return this.tokenData as Token;
  }
}
export default TokenValidatorService;
