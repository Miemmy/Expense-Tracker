import {Injectable,CanActivate,ExecutionContext,UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {// can activate methods decided if a user is alllowed or denied
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request= context.switchToHttp().getRequest();//give us the raw request object

        const authHeader= request.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException("Unauthorized:No token provided");
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            throw new UnauthorizedException("Invalid authentication token format. Expected 'Bearer <token>'.");
        }

        const token = parts[1];
        try{
            const payload=await this.jwtService.verifyAsync(token)
            request.user=payload// we are doing this so the rest of our program know which user provided the token
            return true

        }catch(error){
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException("Authentication token expired.");
            }
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException("Invalid authentication token.");
            }
            // Catch any other unexpected errors
            throw new UnauthorizedException("Authentication failed.");
        }
    }
}