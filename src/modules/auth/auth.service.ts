import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { ResetPasswordDto } from './dto/reset-password.dto';
import { DatabaseService } from 'src/database/database.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import { AtuhResponseDto } from './dto/response/base-response.dto';
import { EmailService } from '../email/email.service';
import { OauthUser } from 'src/types';
import { isEmail } from 'class-validator';
import InvalidEmailException from 'src/common/exeptions/auth/invalid-email.exception';
import InvalidPasswordException from 'src/common/exeptions/auth/invalid-password.exception';
import UserNotFoundException from 'src/common/exeptions/auth/user-not-found.exception';
import UserNotActiveException from 'src/common/exeptions/auth/user-not-active.exception';
import InvalidCredentialsException from 'src/common/exeptions/auth/invalid-credentials.exception';
import UserCreationFailedException from 'src/common/exeptions/auth/user-creation-failed.exception';
import TokenAlreadyExistsException from 'src/common/exeptions/auth/token-already-exists.excetion';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import TokenExpiredException from 'src/common/exeptions/auth/token-expired.exception';
import InvalidTokenException from 'src/common/exeptions/auth/invalid-token.exception';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private logger: MyLoggerService,
    private jwtService: JwtService,
    private userService: UsersService,
    private tokenService: TokenService,
    // INJETE ASSIM, SEM O 'NEW'
    private readonly emailService: EmailService,
  ) {}
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
      const userCreated = await this.userService.finEmail(req.email);
      if (!userCreated) {
        throw new UserCreationFailedException();
      }

      const token = await this.genarateJWT(userCreated.id, userCreated.email);
      this.setTokenCookie(reply, token);
      await this.emailService.sendEmail(
        userCreated.email,
        'welcome to website',
        'welcome',
        {
          name: userCreated.email,
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
    const token = await this.genarateJWT(user.id, user.email);
    this.setTokenCookie(reply, token);
    return {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      token,
      verified: user.isActive,
    };
  }
  async login(dto: LoginDto, reply: FastifyReply): Promise<AtuhResponseDto> {
    if (!isEmail(dto.email)) {
      throw new InvalidEmailException();
    }
    if (dto.password.length < 8 || dto.password.length > 20 || !dto.password) {
      throw new InvalidPasswordException();
    }
    const user = await this.userService.finEmail(dto.email);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!user.isActive) {
      throw new UserNotActiveException();
    }
    let isMatch = await bcrypt.compare(dto.password, user.password ?? '');
    if (!isMatch) {
      throw new InvalidCredentialsException();
    }
    const token = await this.genarateJWT(user.id, user.email);
    this.setTokenCookie(reply, token);
    return {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      token,
      verified: user.isActive,
    };
  }
  async singup(user: SignupDto): Promise<AtuhResponseDto> {
    if (!isEmail(user.email)) {
      throw new InvalidEmailException();
    }
    if (
      user.password.length < 8 ||
      user.password.length > 20 ||
      !user.password
    ) {
      throw new InvalidPasswordException();
    }
    const hashPassword = await this.encode(user.password);
    const token = this.generateToken();
    await this.userService.create({
      email: user.email,
      password: hashPassword,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userCreated = await this.userService.finEmail(user.email);
    if (!userCreated) {
      throw new UserCreationFailedException();
    }
    const existsToken = await this.tokenService.findByUserId(userCreated.id);
    if (existsToken) {
      throw new TokenAlreadyExistsException();
    }
    await this.emailService.sendEmail(
      userCreated.email,
      'verification token',
      'sendtoken',
      {
        name: userCreated.email,
        verificationUrl: `${process.env.RENDER_BASE_URL}/api/auth/verify-email?token=${token}`,
        token,
        expiresIn: '10',
      },
    );
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    await this.tokenService.create(
      token,
      userCreated.id,
      'REFRESH' as any,
      fiveMinutesFromNow,
    );
    return {
      message: 'User created successfully',
      statusCode: HttpStatus.CREATED,
      success: true,
      token,
    };
  }

  async verifyEmail(token: string): Promise<AtuhResponseDto> {
    const tokenExists = await this.tokenService.findByToken(token);
    if (!tokenExists) {
      throw new TokenNotFoundException();
    }
    if (tokenExists.expiresAt < new Date()) {
      throw new TokenExpiredException();
    }
    if (tokenExists.token != token) {
      throw new InvalidTokenException();
    }
    const user = await this.userService.findByUserId(tokenExists.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.userService.update(user.id, {
      isActive: true,
    });
    await this.tokenService.consumeToken(token);
    await this.emailService.sendEmail(
      user.email,
      'welcome to website',
      'welcome',
      {
        name: user.email,
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
    this.clearCookie(reply, req);
    return {
      message: 'Logout successful',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }
  async forgotPassword(
    newPassword: ForgotPasswordDto,
  ): Promise<AtuhResponseDto> {
    if (!isEmail(newPassword.email)) {
      throw new InvalidEmailException();
    }
    const user = await this.userService.finEmail(newPassword.email);
    if (!user) {
      throw new UserNotFoundException();
    }
    const UserExistsInTokenDb = await this.tokenService.findByUserId(user.id);
    if (UserExistsInTokenDb) {
      throw new TokenAlreadyExistsException();
    }
    const tokenVerification = this.generateToken();
    await this.emailService.sendEmail(
      newPassword.email,
      'forgot password',
      'sendForgotPassowrdToken',
      {
        name: newPassword.email,
        resetUrl: `${process.env.RENDER_BASE_URL}/resetpassoword`,
        token: tokenVerification,
        expiresIn: '10',
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
    const tokenExists = await this.tokenService.findByToken(
      newBodyPassowrd.token,
    );
    if (!tokenExists) {
      throw new TokenNotFoundException();
    }
    if (tokenExists.expiresAt < new Date()) {
      throw new TokenExpiredException();
    }
    if (tokenExists.token != newBodyPassowrd.token) {
      throw new InvalidTokenException();
    }
    const user = await this.userService.findByUserId(tokenExists.userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    const hashPassword = await this.encode(newBodyPassowrd.newPassword);
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
}
