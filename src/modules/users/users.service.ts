import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}
  async create(createUserDto: Prisma.UserCreateInput) {
    return await this.databaseService.user.create({
      data: createUserDto,
    });
  }
  async findByUserId(userId: number) {
    return await this.databaseService.user.findUnique({
      where: { id: userId },
    });
  }
  async findAll(email?: string) {
    return await this.databaseService.user.findMany({
      where: email ? { email: { contains: email, mode: 'insensitive' } } : {},
    });
  }

  async findOne(id: number) {
    return await this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return await this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return await this.databaseService.user.delete({
      where: { id },
    });
  }
  async finEmail(email: string) {
    return await this.databaseService.user.findUnique({
      where: { email },
    });
  }
}
