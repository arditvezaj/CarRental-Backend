import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { PermissionsService } from "../permissions.service";
import { RequestUser } from "src/auth/types/request-user";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  canActivate(context: ExecutionContext): any {
    // boolean | Promise<boolean> | Observable<boolean>
    const requiredPermissions = this.reflector.get<string[]>(
      "permissions",
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    // FIXME: This is wrong. Only checking for user's main org permission, need to pass in children org ID here
    // return this.permissionsService.hasPermissions(user, requiredPermissions);
  }
}
