import { Test, TestingModule } from '@nestjs/testing';
import { MicrosoftService } from './microsoft.service';

describe('MicrosoftService', () => {
  let service: MicrosoftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MicrosoftService],
    }).compile();

    service = module.get<MicrosoftService>(MicrosoftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
