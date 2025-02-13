import { Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { RolesService } from "src/roles/roles.service";
import { Request } from "express";

interface CustomRequest extends Request {
  user?: {
    id: number;
  };
}

@Injectable()
export class SeedService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService
  ) {}

  async seed(req: CustomRequest) {
    await this.rolesService.seedRolesAndPermissions();
    await this.usersService.seedAdminAccount();

    const currentUserId = req?.user?.id || null;

    return {
      roles: await this.rolesService.findAll(),
      accounts: await this.usersService.findAll(currentUserId),
    };
  }
}
