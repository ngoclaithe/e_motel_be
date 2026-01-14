import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    console.log('🔒 RolesGuard Debug:');
    console.log('  - Required roles:', requiredRoles);
    console.log('  - User object:', user);
    console.log('  - User role:', user?.role);
    console.log('  - Match?', requiredRoles.some((role) => user.role === role));

    return requiredRoles.some((role) => user.role === role);
  }
}