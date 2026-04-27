import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  HttpCode,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { ApiOkResponse, ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ResendVerificationTokenDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { GoogleAuthGuard } from './guards/google.guard';

import { MicrosoftGuard } from './guards/microsoft.guard';
import { OauthUser } from 'src/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new MyLoggerService(AuthController.name);
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Máximo 5 tentativas por minuto
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.authService.login(loginDto, reply);
  }
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.singup(signupDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    return this.authService.logout(reply);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // Máximo 3 pedidos de recuperação por hora
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassoword(resetPasswordDto);
  }
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  @Public()
  @Get('google')
  async googleAuth(@Res({ passthrough: true }) reply: FastifyReply) {
    // Monta a URL do Google manualmente e redireciona
    return this.authService.redirect('google', reply);
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req() req: FastifyRequest & { user: OauthUser },
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.authService.loginOauth(req.user, reply);
  }

  @Public()
  @Get('microsoft')
  async microsoftAuth(@Res() reply: FastifyReply) {
    return this.authService.redirect('microsoft', reply);
  }
  @Public()
  @Get('microsoft/callback')
  @UseGuards(MicrosoftGuard)
  microsoftAuthCallback(
    @Req() req: FastifyRequest & { user: OauthUser },
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.authService.loginOauth(req.user, reply);
  }

  @Public()
  @ApiOkResponse({ type: String })
  @Get('test')
  test() {
    return 'ok';
  }
}
