import { User } from 'src/generated/dto/user.entity';

import UserNotFoundException from 'src/common/exeptions/users/user-not-found.exception';
import UserNotActiveException from 'src/common/exeptions/users/user-not-active.exception';
import { CreateUserDto } from 'src/generated/dto/create-user.dto';
import { UsersService } from 'src/modules/users/users.service';
interface UserValidatorProtocol {
  verifyCreationByEmail(user: CreateUserDto): Promise<this>;
  verifyCreationById(id: number): Promise<this>;
  isActive(active: boolean, id: number): Promise<this>;
  get(): User;
}
class UserValidatorService {
  constructor(private userService: UsersService) {}
  validate(user: CreateUserDto) {
    return new UserValidator(user, this.userService);
  }
}
class UserValidator implements UserValidatorProtocol {
  private userData: User | null = null;
  private user: User | CreateUserDto | null = null;
  constructor(
    user: User | CreateUserDto,
    private userService: UsersService,
  ) {
    this.user = user;
  }
  async verifyCreationByEmail(user: CreateUserDto): Promise<this> {
    this.userData = await this.userService.finEmail(user.email);
    if (!this.userData) {
      throw new UserNotFoundException();
    }
    return this;
  }
  async verifyCreationById(id: number): Promise<this> {
    this.userData = await this.userService.findByUserId(id);
    if (!this.userData) {
      throw new UserNotFoundException();
    }
    return this;
  }
  async isActive(active: boolean, id: number): Promise<this> {
    this.userData = await this.userService.findByUserId(id);
    if (!this.userData) {
      throw new UserNotActiveException();
    }
    return this;
  }

  get(): User {
    return this.userData as User;
  }
}
export default UserValidatorService;
