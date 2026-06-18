import { Test, TestingModule } from '@nestjs/testing';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import InvalidTokenException from 'src/common/exeptions/token/invalid-token.exception';
import TokenExpiredException from 'src/common/exeptions/token/token-expired.exception';
import { TokenService } from 'src/modules/token/token.service';
import TokenValidatorService, {
  TokenValidationChain,
} from 'src/shared/builders/token.builder';
import { tokenEntityFixture } from 'test/fixtures/auth.fixture';
import { expiredTokenEntityFixture } from 'test/fixtures/token.fixture';
import { tokenServiceMock } from 'test/mock/services/authService.mock';

describe('TokenBuilder (unit)', () => {
  let builder: TokenValidatorService;
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenValidatorService,
        { provide: TokenService, useValue: tokenServiceMock },
      ],
    }).compile();

    builder = module.get<TokenValidatorService>(TokenValidatorService);
  });
  const token = async (): Promise<TokenValidationChain> => {
    return await builder.validate(tokenEntityFixture.token).exists();
  };
  describe('validate', () => {
    it('should get token', async () => {
      tokenServiceMock.findByToken.mockResolvedValue(tokenEntityFixture);
      const validatedToken = (await token()).get();
      console.log('validatedToken', validatedToken);
      expect(tokenServiceMock.findByToken).toHaveBeenCalledWith(
        tokenEntityFixture.token,
      );
      expect(validatedToken).toEqual(tokenEntityFixture);
    });

    it('should token not found', async () => {
      tokenServiceMock.findByToken.mockResolvedValue(null);

      await expect(token()).rejects.toThrow(TokenNotFoundException);
      expect(tokenServiceMock.findByToken).toHaveBeenCalledWith(
        tokenEntityFixture.token,
      );
    });

    it('should expire token', async () => {
      tokenServiceMock.findByToken.mockResolvedValue(expiredTokenEntityFixture);
      const validationChain = await token();

      expect(() => {
        validationChain.notExpired();
      }).toThrow(TokenExpiredException);
    });

    it('should throw invalid token when token does not match', async () => {
      tokenServiceMock.findByToken.mockResolvedValue({
        ...tokenEntityFixture,
        token: 'different-token',
      });
      const validationChain = await token();

      expect(() => {
        validationChain.matchesToken();
      }).toThrow(InvalidTokenException);
    });
  });
});
