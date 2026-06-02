import { Token } from '@prisma/client';

import { Injectable } from '@nestjs/common';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import TokenExpiredException from 'src/common/exeptions/token/token-expired.exception';
import InvalidTokenException from 'src/common/exeptions/token/invalid-token.exception';
import { TokenService } from 'src/modules/token/token.service';
interface TokenValidatorProtocol {
  validate(token: string): TokenValidationChain;
}
interface TokenValidationChainProtocol {
  exists(): Promise<this>;
  notExpired(): TokenValidationChain;
  matchesToken(): TokenValidationChain;
  get(): Token;
}
@Injectable()
export class TokenValidatorService implements TokenValidatorProtocol {
  constructor(private tokenService: TokenService) {}

  validate(token: string) {
    return new TokenValidationChain(token, this.tokenService);
  }
}
export class TokenValidationChain implements TokenValidationChainProtocol {
  private tokenData: Token | null = null;

  constructor(
    private token: string,
    private tokenService: TokenService,
  ) {}
  async exists(): Promise<this> {
    this.tokenData = await this.tokenService.findByToken(this.token);
    if (!this.tokenData) throw new TokenNotFoundException();
    return this;
  }

  notExpired(): this {
    if (this.tokenData!.createdAt < new Date())
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
