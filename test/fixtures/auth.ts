import { faker } from '@faker-js/faker';

export const userFixture = {
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
};
