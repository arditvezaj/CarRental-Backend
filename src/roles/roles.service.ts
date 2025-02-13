import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { PredefinedRoles } from './types/predefined-roles.enum';
import { PredefinedPermissions } from './types/predefined-permissions.enum';
import { Permission } from './entities/permission.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.roleRepository.find({
      relations: ['permissions'],
    });
  }

  findOne(id: number) {
    return this.roleRepository.findOne({
      relations: ['permissions'],
      where: { id },
    });
  }

  findByRoleName(roleName: string) {
    return this.roleRepository.findOne({
      where: { name: roleName },
    });
  }

  async userHasAdminAccess(userId: number): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      return false;
    }

    const hasAdminAccess = user.role == 'admin';

    return hasAdminAccess;
  }

  async seedRolesAndPermissions() {
    const existingRoles = await this.roleRepository.count();
    if (existingRoles > 0) return;

    const existingPermissions = await this.permissionRepository.count();
    if (existingPermissions > 0) return;

    const superAdminRole = this.roleRepository.create({
      name: PredefinedRoles.SUPER_ADMIN,
    });
    const orgAdminRole = this.roleRepository.create({
      name: PredefinedRoles.COMPANY_ADMIN,
    });
    const orgMemberRole = this.roleRepository.create({
      name: PredefinedRoles.COMPANY_WORKER,
    });
    await this.roleRepository.save([
      superAdminRole,
      orgAdminRole,
      orgMemberRole,
    ]);

    // Seed permissions
    const permissions = Object.values(PredefinedPermissions).map((permission) =>
      this.permissionRepository.create({ name: permission }),
    );
    const savedPermissions = await this.permissionRepository.save(permissions);

    superAdminRole.permissions = savedPermissions;
    orgAdminRole.permissions = savedPermissions.filter(
      (permission) =>
        !permission.name.includes('ROLE_TYPE') &&
        !permission.name.includes('ROLE_ASSIGNMENT') &&
        !permission.name.includes('ORG'),
    );
    orgMemberRole.permissions = savedPermissions.filter(
      (permission) =>
        !permission.name.includes('ROLE_TYPE') &&
        !permission.name.includes('ROLE_ASSIGNMENT') &&
        !permission.name.includes('ORG') &&
        !permission.name.includes('ACCOUNT'),
    );
    await this.roleRepository.save([
      superAdminRole,
      orgAdminRole,
      orgMemberRole,
    ]);
  }
}
