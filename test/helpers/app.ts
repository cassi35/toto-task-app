// test/helpers/app.ts
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';

export const createApp = () => {
  return Test.createTestingModule({
    imports: [AppModule],
  });
};
