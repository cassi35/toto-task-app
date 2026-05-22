import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/modules/auth/controllers/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { authServiceMock } from 'test/mock/services/authService.mock';

describe('AuthController', () => {
  let controller: AuthController;

  // const authServiceMock = {
  //   login: jest.fn(),
  //   singup: jest.fn(),
  //   logout: jest.fn(),
  //   forgotPassword: jest.fn(),
  //   resetPassoword: jest.fn(),
  //   verifyEmail: jest.fn(),
  //   redirect: jest.fn(),
  //   loginOauth: jest.fn(),
  // };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
