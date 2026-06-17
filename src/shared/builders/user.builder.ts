import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import UserAlreadyExistsException from 'src/common/exeptions/users/user-already-exists.exception';
import UserCreationFailedException from 'src/common/exeptions/users/user-creation-failed.exception';
import UserNotActiveException from 'src/common/exeptions/users/user-not-active.exception';
import UserNotFoundException from 'src/common/exeptions/users/user-not-found.exception';
import { UsersService } from 'src/modules/users/users.service';

interface UserInitialChain {
  exists(): Promise<UserValidationChain>;
  doesNotExist(): Promise<void>;
  wasCreated(): Promise<UserValidationChain>;
}

interface UserByIdInitialChain {
  existsByUserId(): Promise<UserValidationChain>;
}

export interface UserValidationChain {
  isActive(): this;
  get(): User;
}

interface UserValidatorProtocol {
  validate(email: string): UserInitialChain;
  validateByUserId(userId: number): UserByIdInitialChain;
}

@Injectable()
export class UserValidatorBuilder implements UserValidatorProtocol {
  constructor(private userService: UsersService) {}

  validate(email: string): UserInitialChain {
    return new UserValidationChainInternal(this.userService, email);
  }

  validateByUserId(userId: number): UserByIdInitialChain {
    return new UserValidationChainInternal(this.userService, undefined, userId);
  }
}

class UserValidationChainInternal
  implements UserInitialChain, UserByIdInitialChain, UserValidationChain
{
  private userData: User | null = null;

  constructor(
    private userService: UsersService,
    private email?: string,
    private userId?: number,
  ) {}

  async exists(): Promise<UserValidationChain> {
    this.userData = await this.userService.finEmail(this.email!);
    if (!this.userData) {
      throw new UserNotFoundException();
    }
    return this;
  }

  async existsByUserId(): Promise<UserValidationChain> {
    this.userData = await this.userService.findByUserId(this.userId!);
    if (!this.userData) {
      throw new UserNotFoundException();
    }
    return this;
  }

  async doesNotExist(): Promise<void> {
    this.userData = await this.userService.finEmail(this.email!);
    if (this.userData) {
      throw new UserAlreadyExistsException();
    }
  }

  async wasCreated(): Promise<UserValidationChain> {
    this.userData = await this.userService.finEmail(this.email!);
    if (!this.userData) {
      throw new UserCreationFailedException();
    }
    return this;
  }

  isActive(): this {
    if (!this.userData!.isActive) {
      throw new UserNotActiveException();
    }
    return this;
  }

  get(): User {
    return this.userData as User;
  }
}

export default UserValidatorBuilder;
