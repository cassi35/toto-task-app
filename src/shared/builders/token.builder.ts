import { Token } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import TokenExpiredException from 'src/common/exeptions/token/token-expired.exception';
import InvalidTokenException from 'src/common/exeptions/token/invalid-token.exception';
import { TokenService } from 'src/modules/token/token.service';

// 1. Interface que o serviço retorna. Só permite chamar o 'exists'.
interface TokenInitialChain {
  exists(): Promise<TokenValidationChain>;
}

// 2. Interface com os métodos liberados APÓS o 'exists' ter rodado
export interface TokenValidationChain {
  notExpired(): this;
  matchesToken(): this;
  get(): Token;
}

interface TokenValidatorProtocol {
  validate(token: string): TokenInitialChain;
}

@Injectable()
export class TokenValidatorService implements TokenValidatorProtocol {
  constructor(private tokenService: TokenService) {}

  validate(token: string): TokenInitialChain {
    // Retorna a instância tipada estritamente como TokenInitialChain
    return new TokenValidationChainInternal(token, this.tokenService);
  }
}

// Classe interna que implementa ambas as etapas do fluxo
class TokenValidationChainInternal
  implements TokenInitialChain, TokenValidationChain
{
  private tokenData: Token | null = null;

  constructor(
    private token: string,
    private tokenService: TokenService,
  ) {}

  // Obrigatoriamente o primeiro método a ser chamado externo ao serviço
  async exists(): Promise<TokenValidationChain> {
    this.tokenData = await this.tokenService.findByToken(this.token);
    if (!this.tokenData) throw new TokenNotFoundException();

    // Retorna a si mesmo, mas mascarado como a interface que libera as próximas funções
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
