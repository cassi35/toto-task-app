import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { DatabaseModule } from '../../database/database.module';
import { DatabaseService } from '../../database/database.service';

describe('TokenService (integration)', () => {
  let service: TokenService;
  let db: DatabaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [TokenService],
    }).compile();

    service = module.get<TokenService>(TokenService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await db.$disconnect();
  });
  it.skip('should create and persist token', async () => {
    const token = await service.create(
      'token',
      6,
      'REFRESH' as any,
      new Date(Date.now() + 1000),
    );

    expect(token).toBeDefined();
  });
  it('should find user by id ', async () => {
    const token = await service.findByUserId(7);
    expect(token).toBeNull();
    console.log(token);
  });
  it.skip('should find by id token', async () => {
    const token = await service.findByToken('token');
    expect(token).toBeDefined();
    console.log(token);
  });
});
