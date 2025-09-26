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
        const [bearer,token]=authHeader.split(' ');
        if (bearer!=="Bearer"){
            throw new UnauthorizedException("Unauthorized:");
        }
        try{
            const payload=await this.jwtService.verifyAsync(token)
            request.user=payload// we are doing this so the rest of our program know which user provided the token
            return true

        }catch(error){
            throw new UnauthorizedException("Invalid or expired token");
        }
    }
}