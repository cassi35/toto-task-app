import { User } from 'src/interface/user';
import { userFixture } from './auth';
import * as bcrypt from 'bcrypt';
export const errorUserFixture = {};
export const userFixtureCreate = async () => {
  return {
    email: userFixture.email,
    password: await bcrypt.hash(userFixture.password, 10),
    isActive: true,
  };
};

export function userFixtureError(choose: 'email' | 'password'): User {
  return choose == 'email'
    ? { email: 'email', password: '123456789' }
    : { email: 'email@gmail.com', password: '123' };
}
