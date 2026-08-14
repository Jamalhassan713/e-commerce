import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from "@nestjs/common";
import { AuthGuard, RolesGuard } from "../guards";



export const AuthUser = createParamDecorator(
    (data, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.loggedInUser.user;
    }
);

export const Roles = (roles: string[]) => SetMetadata('roles', roles);

export function Auth(roles: string[]) {
    return applyDecorators(
        UseGuards(AuthGuard, RolesGuard),
        Roles(roles)
    )
}