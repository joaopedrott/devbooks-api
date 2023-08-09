import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const [, accessToken] = request.headers.authorization.split(' ');

    try {
      const payload = await this.jwtService.verifyAsync(accessToken);

      if (payload.scope.indexOf('accessToken') === -1) {
        throw new UnauthorizedException();
      }

      request.userId = payload.userId;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
