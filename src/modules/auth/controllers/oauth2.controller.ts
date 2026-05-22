import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';

import { ApiBadRequestResponse, ApiFoundResponse } from '@nestjs/swagger';

import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthService } from '../auth.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

import { GoogleAuthGuard } from '../guards/google.guard';
import { MicrosoftGuard } from '../guards/microsoft.guard';

import { OauthUser } from 'src/types';

import { ErrorResonseDto } from '../../../common/dto/error-respose.dto';

import AuthRouter from 'src/common/routes/auth.routes';

import { PublicAuthRoute } from 'src/common/decorators/public-router-auth.decorator';

@Controller(AuthRouter.BASE)
export class OauthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new MyLoggerService(OauthController.name);

  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Get(AuthRouter.GOOGLE)
  @ApiFoundResponse({
    description: 'Redirect to provider',
    schema: {
      type: 'string',
      example: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=...',
    },
  })
  @ApiBadRequestResponse({
    type: ErrorResonseDto,
  })
  async googleAuth(
    @Res({ passthrough: true })
    reply: FastifyReply,
  ) {
    return this.authService.redirect('google', reply);
  }

  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Get(AuthRouter.GOOGLE_CALLBACK)
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req()
    req: FastifyRequest & {
      user: OauthUser;
    },
    @Res({ passthrough: true })
    reply: FastifyReply,
  ) {
    return this.authService.loginOauth(req.user, reply);
  }

  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Get(AuthRouter.MICROSOFT)
  async microsoftAuth(
    @Res({ passthrough: true })
    reply: FastifyReply,
  ) {
    return this.authService.redirect('microsoft', reply);
  }

  @PublicAuthRoute(5, 60000, HttpStatus.OK)
  @Get(AuthRouter.MICROSOFT_CALLBACK)
  @UseGuards(MicrosoftGuard)
  microsoftAuthCallback(
    @Req()
    req: FastifyRequest & {
      user: OauthUser;
    },
    @Res({ passthrough: true })
    reply: FastifyReply,
  ) {
    return this.authService.loginOauth(req.user, reply);
  }
}
