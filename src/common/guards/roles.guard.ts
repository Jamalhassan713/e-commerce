import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";



@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext) {
        const { user: { role } } = context.switchToHttp().getRequest().loggedInUser;

        const allowedRoles = this.reflector.get('roles', context.getHandler());

        if (allowedRoles.includes(role)) {
            return true;
        }
        throw new UnauthorizedException('You do not have permission to access this resource');
    }
}
