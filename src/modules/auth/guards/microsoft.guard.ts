// microsoft.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MicrosoftGuard extends AuthGuard('microsoft') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const reply = ctx.getResponse();

    // Expõe o res nativo do Node que o Passport espera
    req.res = reply.raw;

    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (err) {
      console.error('🔴 MicrosoftGuard error:', err);
      throw err;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🟡 Microsoft user:', user, '| err:', err);
    if (err || !user) throw err || new Error('No user from Microsoft');
    return user;
  }
}
