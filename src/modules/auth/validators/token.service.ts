import { Injectable } from '@nestjs/common';
import TokenAlreadyExistsException from 'src/common/exeptions/auth/token-already-exists.excetion';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import TokenValidatorService, {
  TokenValidationChain,
} from 'src/shared/builders/token.builder';
interface ValidationProtocol {
  validateFullToken(token: string): Promise<TokenValidationChain>;
  validateTokenExists(token: string): Promise<TokenValidationChain>;
  validateTokenByUserId(userId: number): Promise<TokenValidationChain>;
  ensureUserDoesNotHaveToken(userId: number): Promise<void>;
}
@Injectable()
export class TokenServiceValidator implements ValidationProtocol {
  private tokenBuilder: TokenValidatorService;
  constructor(tokenBuilder: TokenValidatorService) {
    this.tokenBuilder = tokenBuilder;
  }
  async validateFullToken(token: string): Promise<TokenValidationChain> {
    return (await this.tokenBuilder.validate(token).exists())
      .notExpired()
      .matchesToken();
  }
  async validateTokenExists(token: string): Promise<TokenValidationChain> {
    return await this.tokenBuilder.validate(token).exists();
  }
  async validateTokenByUserId(userId: number): Promise<TokenValidationChain> {
    return await this.tokenBuilder.validateByUserId(userId).existsByUserId();
  }

  async ensureUserDoesNotHaveToken(userId: number): Promise<void> {
    try {
      await this.validateTokenByUserId(userId);
    } catch (error) {
      if (error instanceof TokenNotFoundException) {
        return;
      }
      throw error;
    }
    throw new TokenAlreadyExistsException();
  }
}
