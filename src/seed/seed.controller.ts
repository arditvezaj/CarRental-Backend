import { Controller, Post, Req } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/skip-auth.decorator';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: {
    id: number;
  };
}

@ApiBearerAuth()
@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Seed initial data into database' })
  seed(@Req() req: CustomRequest) {
    return this.seedService.seed(req);
  }
}
