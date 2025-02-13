import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { RolesService } from './roles.service';
import { RequestUser } from 'src/auth/types/request-user';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        private readonly rolesService: RolesService,
    ) {}

    findAll() {
        return this.permissionRepository.find();
    }

    findOne(id: number) {
        return this.permissionRepository.findOneBy({ id });
    }

    // async hasPermissions(user: RequestUser, requiredPermissions: string[]) {
    //     const userPermissions: Permission[] =
    //         await this.rolesService.findUserPermissionsInOrganization(
    //             user.id,
    //             // user.orgId,
    //         );

    //     const userPermissionNames = userPermissions.map(
    //         (permission) => permission.name,
    //     );

    //     return requiredPermissions.every((permission) =>
    //         userPermissionNames.includes(permission),
    //     );
    // }

    async count(): Promise<number> {
        return this.permissionRepository.count();
    }
}
