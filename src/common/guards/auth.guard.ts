import { BadRequestException, CanActivate, ExecutionContext, forwardRef, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "../services";
import { BlackListTokenRepository, UserRepository } from "@/db";
import { TokenTypes } from "../constants";



@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly tokenService: TokenService,
        @Inject(forwardRef(() => UserRepository))
        private readonly userRepository: UserRepository,
        @Inject(forwardRef(() => BlackListTokenRepository))
        private readonly blackListTokenRepository: BlackListTokenRepository
    ) { }
    async canActivate(context: ExecutionContext) {

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) throw new BadRequestException('Please login first');
    
    const token = authorization.split(' ')[1];
    const isBlackListed = await this.blackListTokenRepository.exists({ token });
    if (isBlackListed) throw new UnauthorizedException('Token is blacklisted');

    let verifiedData: any;
    try {
        verifiedData = this.tokenService.verifyToken(token, { secret: process.env.JWT_ACCESS_SECRET as string });
    } catch {
        throw new UnauthorizedException('Invalid or expired token');
    }
    if (verifiedData.type !== TokenTypes.ACCESS) throw new UnauthorizedException('Invalid token type');

    const user = await this.userRepository.findById(verifiedData.id);
    if (!user) throw new UnauthorizedException('User does not exist');
    if (user.isDeleted) throw new UnauthorizedException('Account is deactivated');
    if (!user.isVerified) throw new UnauthorizedException('Please verify your email first');
    
    request.loggedInUser = { user, verifiedData };
    return true;
}
}