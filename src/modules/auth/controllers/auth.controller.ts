import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { SignupDto } from '../dto/signup.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticatedRequest, OauthUser } from 'src/types';
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
  @Post(AuthRouter.RESET_PASSWORD)
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
  @Get(AuthRouter.ME)
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req);
  }
  @PrivateRouteAuth(HttpStatus.OK)
  @Get(AuthRouter.ME)
  @ApiOkResponse({ type: String })
  @Get('test')
  test() {
    return 'ok';
  }
}
