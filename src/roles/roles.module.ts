import { Module, forwardRef } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsService } from './permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UsersModule } from 'src/users/users.module';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
    forwardRef(() => UsersModule),
    forwardRef(() => CompaniesModule),
  ],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService, PermissionsService],
})
export class RolesModule {}
