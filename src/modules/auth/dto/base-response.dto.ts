import { Prisma } from '@prisma/client';

export class AtuhResponseDto {
  token?: string;
  statusCode!: number;
  success!: boolean;
  message!: string;
  verified?: boolean;
  cookie?: string;
  user?: Prisma.UserCreateInput;
}
