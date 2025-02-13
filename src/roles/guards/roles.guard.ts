import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestUser } from 'src/auth/types/request-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const allowedRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!allowedRoles) {
      return true; // If no roles are specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;
    if (!user) {
      return false; // If no user is found, deny access
    }

    // Check if the user's role is in the allowed roles
    return allowedRoles.includes(user.role);
  }
}
