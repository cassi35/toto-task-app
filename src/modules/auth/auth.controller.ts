import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';

import { FastifyReply, FastifyRequest } from 'fastify';
import { GoogleAuthGuard } from './guards/google.guard';
import { MicrosoftGuard } from './guards/microsoft.guard';
import { AuthenticatedRequest, OauthUser } from 'src/types';
import { ErrorResonseDto } from '../../common/dto/error-respose.dto';
import AuthRouter from 'src/common/routes/auth.routes';
import {
  PrivateRouteAuth,
  PublicAuthRoute,
} from 'src/common/decorators/public-router-auth.decorator';
@Controller(AuthRouter.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new MyLoggerService(AuthController.name);
  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.authService.login(loginDto, reply);
  }
  @PublicAuthRoute(5, 60000, HttpStatus.CREATED)
  @Post(AuthRouter.SIGNUP)
  signup(@Body() signupDto: SignupDto) {
    return this.authService.singup(signupDto);
  }
  @PrivateRouteAuth(HttpStatus.OK)
  @Post('logout')
  logout(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    return this.authService.logout(reply, req);
  }

  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Post(AuthRouter.FORGOT_PASSWORD)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }
  @PrivateRouteAuth(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassoword(resetPasswordDto);
  }
  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @ApiQuery({
    name: 'token',
    type: String,
    required: true,
    description: 'Verification token',
  })
  @Get(AuthRouter.VERIFY_EMAIL)
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get(AuthRouter.GOOGLE)
  @ApiFoundResponse({
    description: 'Redirect to provider',
    schema: {
      type: 'string',
      example: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=...',
    },
  })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  async googleAuth(@Res({ passthrough: true }) reply: FastifyReply) {
    // Monta a URL do Google manualmente e redireciona
    return this.authService.redirect('google', reply);
  }

  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req() req: FastifyRequest & { user: OauthUser },
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.authService.loginOauth(req.user, reply);
  }

  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Get(AuthRouter.MICROSOFT)
  async microsoftAuth(@Res({ passthrough: true }) reply: FastifyReply) {
    return this.authService.redirect('microsoft', reply);
  }
  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Get(AuthRouter.MICROSOFT_CALLBACK)
  @UseGuards(MicrosoftGuard)
  microsoftAuthCallback(
    @Req() req: FastifyRequest & { user: OauthUser },
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.authService.loginOauth(req.user, reply);
  }
  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Get(AuthRouter.ME)
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req);
  }
  @Public()
  @ApiOkResponse({ type: String })
  @Get('test')
  test() {
    return 'ok';
  }
}
