import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { PredefinedPermissions } from './types/predefined-permissions.enum';
import { Permissions } from './decorators/permissions.decorator';

@ApiBearerAuth()
@ApiTags('Roles and Permissions')
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post('assignments')
  @UseGuards(PermissionsGuard)
  @Permissions(PredefinedPermissions.CREATE_ROLE_ASSIGNMENT)
  @ApiOperation({
    summary: 'Assign an accountOrgRole',
  })
  @Delete('assignments/:id')
  @UseGuards(PermissionsGuard)
  @Permissions(PredefinedPermissions.DELETE_ROLE_ASSIGNMENT)
  @ApiOperation({
    summary: 'Delete an accountOrgRole by ID',
  })
  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions(PredefinedPermissions.VIEW_ROLE_TYPE)
  @ApiOperation({ summary: 'Get all roles' })
  findAllRoles() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  findAllPermissions() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(PredefinedPermissions.VIEW_ROLE_TYPE)
  @ApiOperation({ summary: 'Get a role by ID' })
  findOneRole(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Get('permissions/:id')
  @UseGuards(PermissionsGuard)
  @Permissions(PredefinedPermissions.VIEW_ROLE_TYPE)
  @ApiOperation({ summary: 'Get a permission by ID' })
  findOnePermission(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }
}
