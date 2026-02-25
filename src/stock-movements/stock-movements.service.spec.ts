import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementsService } from './stock-movements.service';
import { getModelToken } from '@nestjs/mongoose';
import { StockMovement } from './schemas/stock-movement.schema';
import { Product } from '../products/schemas/product.schema';

describe('StockMovementsService', () => {
  let service: StockMovementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        {
          provide: getModelToken(StockMovement.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            aggregate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Product.name),
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
