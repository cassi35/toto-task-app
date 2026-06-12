import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';
import InvalidEmailException from 'src/common/exeptions/auth/invalid-email.exception';
import InvalidPasswordException from 'src/common/exeptions/auth/invalid-password.exception';
import InvalidCredentialsException from 'src/common/exeptions/auth/invalid-credentials.exception';
import UserValidatorBuilder, {
  UserValidationChain,
} from 'src/shared/builders/user.builder';

interface UserValidationProtocol {
  validateEmailFormat(email: string): void;
  validatePasswordFormat(password: string): void;
  validateLoginInput(email: string, password: string): void;
  validateSignupInput(email: string, password: string): Promise<void>;
  ensureUserForLogin(email: string): Promise<UserValidationChain>;
  ensureUserExistsByEmail(email: string): Promise<UserValidationChain>;
  ensureUserExistsByUserId(userId: number): Promise<UserValidationChain>;
  ensureUserDoesNotExist(email: string): Promise<void>;
  ensureUserWasCreated(email: string): Promise<UserValidationChain>;
  validateCredentials(password: string, hash: string): Promise<void>;
}

@Injectable()
export class UserValidatorService implements UserValidationProtocol {
  private userBuilder: UserValidatorBuilder;

  constructor(userBuilder: UserValidatorBuilder) {
    this.userBuilder = userBuilder;
  }

  validateEmailFormat(email: string): void {
    if (!isEmail(email)) {
      throw new InvalidEmailException();
    }
  }

  validatePasswordFormat(password: string): void {
    if (password.length < 8 || password.length > 20 || !password) {
      throw new InvalidPasswordException();
    }
  }

  validateLoginInput(email: string, password: string): void {
    this.validateEmailFormat(email);
    this.validatePasswordFormat(password);
  }

  async validateSignupInput(email: string, password: string): Promise<void> {
    this.validateLoginInput(email, password);
    await this.ensureUserDoesNotExist(email);
  }

  async ensureUserForLogin(email: string): Promise<UserValidationChain> {
    return (await this.userBuilder.validate(email).exists()).isActive();
  }

  async ensureUserExistsByEmail(
    email: string,
  ): Promise<UserValidationChain> {
    return await this.userBuilder.validate(email).exists();
  }

  async ensureUserExistsByUserId(
    userId: number,
  ): Promise<UserValidationChain> {
    return await this.userBuilder.validateByUserId(userId).existsByUserId();
  }

  async ensureUserDoesNotExist(email: string): Promise<void> {
    await this.userBuilder.validate(email).doesNotExist();
  }

  async ensureUserWasCreated(email: string): Promise<UserValidationChain> {
    return await this.userBuilder.validate(email).wasCreated();
  }

  async validateCredentials(password: string, hash: string): Promise<void> {
    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) {
      throw new InvalidCredentialsException();
    }
  }
}
