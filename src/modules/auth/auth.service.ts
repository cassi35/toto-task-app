import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { ResetPasswordDto } from './dto/reset-password.dto';
import { DatabaseService } from 'src/database/database.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { TokenService } from '../token/token.service';
import { AtuhResponseDto } from './dto/response/base-response.dto';
import { EmailService } from '../email/email.service';
import { AuthenticatedRequest, OauthUser } from 'src/types';
import { MeDto } from './dto/me.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJob } from '../email/types/email.types';
import { TokenServiceValidator } from './validators/token.service';
import { CookieService } from './validators/cookie.service';
import { UserValidatorService } from './validators/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue<EmailJob>,
    private databaseService: DatabaseService,
    private logger: MyLoggerService,
    private userService: UsersService,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private tokenValidator: TokenServiceValidator,
    private userValidator: UserValidatorService,
  ) {}
  async me(req: AuthenticatedRequest): Promise<MeDto> {
    return {
      email: req.user.email,
      id: req.user.id,
    };
  }
  async redirect(provider: 'google' | 'microsoft', reply: FastifyReply) {
    let url: string;
    switch (provider) {
      case 'google':
        url =
          `${process.env.GOOGLE_LOGIN}` +
          `client_id=${process.env.CLIENT_ID_AUTH}` +
          `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_AUTH_URL!)}` +
          `&response_type=code` +
          `&scope=email%20profile`;
        break;
      case 'microsoft':
        url =
          `${process.env.MICROSOFT_LOGIN}` + // ← 'common' no lugar do TENANT_ID
          `client_id=${process.env.CLIENT_ID_AZURE}` +
          `&redirect_uri=${encodeURIComponent(process.env.MICROSOFT_AUTH_URL!)}` +
          `&response_type=code` +
          `&scope=openid%20profile%20email%20User.Read` +
          `&response_mode=query`;
        break;
    }
    return await reply.status(302).redirect(url);
  }
  async loginOauth(req: OauthUser, reply: FastifyReply) {
    const user = await this.userService.finEmail(req.email);
    if (!user) {
      await this.userService.create({
        email: req.email,
        createdAt: new Date(),
        isActive: true,
        provider: req.provider,
        providerId: req.providerId,
      });
      const userCreated = (
        await this.userValidator.ensureUserWasCreated(req.email)
      ).get();

      const token = await this.cookieService.genarateJWT(
        userCreated.id,
        userCreated.email,
      );
      this.cookieService.setTokenCookie(reply, token);
      await this.emailQueue.add(
        'process',
        {
          type: 'welcome',
          data: {
            email: userCreated.email,
          },
        },
        {
          attempts: 3,
          removeOnFail: true,
          removeOnComplete: true,
        },
      );
      return {
        success: true,
        statusCode: 200,
        message: 'Login successful',
        token,
        verified: userCreated.isActive,
      };
    }
    const token = await this.cookieService.genarateJWT(user.id, user.email);
    this.cookieService.setTokenCookie(reply, token);
    return {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      token,
      verified: user.isActive,
    };
  }
  async login(dto: LoginDto, reply: FastifyReply): Promise<AtuhResponseDto> {
    this.userValidator.validateLoginInput(dto.email, dto.password);
    const user = (await this.userValidator.ensureUserForLogin(dto.email)).get();
    await this.userValidator.validateCredentials(
      dto.password,
      user.password ?? '',
    );
    const token = await this.cookieService.genarateJWT(user.id, user.email);
    this.cookieService.setTokenCookie(reply, token);
    return {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      token,
      verified: user.isActive,
    };
  }
  async singup(user: SignupDto): Promise<AtuhResponseDto> {
    await this.userValidator.validateSignupInput(user.email, user.password);
    const hashPassword = await this.cookieService.encode(user.password);

    await this.userService.create({
      email: user.email,
      password: hashPassword,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userCreated = (
      await this.userValidator.ensureUserWasCreated(user.email)
    ).get();
    const token = this.cookieService.generateToken();
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    await this.tokenService.create(
      token,
      userCreated.id,
      'REFRESH' as any,
      fiveMinutesFromNow,
    );

    await this.emailQueue.add(
      'process',
      {
        type: 'sendtoken',
        data: {
          email: user.email,
          token: token,
        },
      },
      {
        attempts: 3,
        removeOnFail: true,
        removeOnComplete: true,
        backoff: {
          type: 'exponential', // a cada falha, dobra o tempo
          delay: 1000, // começa com 1s, depois 2s, depois 4s
        },
      },
    );
    return {
      message: 'User created successfully',
      statusCode: HttpStatus.CREATED,
      success: true,
      token,
    };
  }

  async verifyEmail(token: string): Promise<AtuhResponseDto> {
    const tokenExists = (
      await this.tokenValidator.validateFullToken(token)
    ).get();
    const user = (
      await this.userValidator.ensureUserExistsByUserId(tokenExists.userId)
    ).get();

    await this.userService.update(user.id, {
      isActive: true,
    });
    await this.tokenService.consumeToken(token);
    await this.emailQueue.add(
      'process',
      {
        type: 'welcome',
        data: {
          email: user.email,
        },
      },
      {
        attempts: 3,
        removeOnFail: true,
        removeOnComplete: true,
        backoff: {
          type: 'exponential', // a cada falha, dobra o tempo
          delay: 1000, // começa com 1s, depois 2s, depois 4s
        },
      },
    );
    return {
      message: 'User verified successfully',
      statusCode: HttpStatus.OK,
      success: true,
      verified: true,
    };
  }
  async logout(
    reply: FastifyReply,
    req: FastifyRequest,
  ): Promise<AtuhResponseDto> {
    this.cookieService.clearCookie(reply, req);
    return {
      message: 'Logout successful',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }
  async forgotPassword(
    newPassword: ForgotPasswordDto,
  ): Promise<AtuhResponseDto> {
    this.userValidator.validateEmailFormat(newPassword.email);
    const user = (
      await this.userValidator.ensureUserExistsByEmail(newPassword.email)
    ).get();
    await this.tokenValidator.ensureUserDoesNotHaveToken(user.id);
    const tokenVerification = this.cookieService.generateToken();
    await this.emailQueue.add(
      'process',
      {
        type: 'sendForgotPassowrdToken',
        data: {
          email: newPassword.email,
          token: tokenVerification,
        },
      },
      {
        attempts: 3,
        removeOnFail: true,
        removeOnComplete: true,
        backoff: {
          type: 'exponential', // a cada falha, dobra o tempo
          delay: 1000, // começa com 1s, depois 2s, depois 4s
        },
      },
    );
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    await this.tokenService.create(
      tokenVerification,
      user.id,
      'REFRESH' as any,
      fiveMinutesFromNow,
    );
    return {
      message: 'Email sent successfully',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }

  async resetPassoword(
    newBodyPassowrd: ResetPasswordDto,
  ): Promise<AtuhResponseDto> {
    const tokenExists = (
      await this.tokenValidator.validateFullToken(newBodyPassowrd.token)
    ).get();
    const user = (
      await this.userValidator.ensureUserExistsByUserId(tokenExists.userId)
    ).get();
    const hashPassword = await this.cookieService.encode(
      newBodyPassowrd.newPassword,
    );
    await this.userService.update(user.id, {
      password: hashPassword,
    });
    await this.tokenService.consumeToken(newBodyPassowrd.token);
    return {
      message: 'Password reset successfully',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }
}
/* 
  private generateToken(): string {
    const verificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return verificationToken;
  }
  private setTokenCookie(reply: FastifyReply, token: string) {
    return reply.setCookie('access_token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
    });
  }
  private clearCookie(reply: FastifyReply, req: FastifyRequest) {
    reply.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  private async genarateJWT(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    }); //faltou tempo de seguranca
  }
  private async encode(passoword: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(passoword, salt);
  }
*/
