import {
  Body,
  Post,
  Headers,
  Controller,
  Get,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from './auth.guard';

type UserModel = Pick<User, 'id' | 'name' | 'email'>;

interface SignInResponse {
  user: UserModel;
  accessToken: string;
  refreshToken: string;
}

interface SignUpResponse {
  user: UserModel;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface AccessTokenPayload {
  scope: string[];
  userId: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('user/signin')
  async signin(
    @Body() body: { email: string; password: string },
  ): Promise<SignInResponse> {
    const { email, password } = body;

    const user = await this.userService.findOne({
      email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (!isSamePassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const refreshToken = this.jwtService.sign(
      {
        scope: ['refreshToken'],
        userId: user.id,
      },
      {
        expiresIn: '1 minute',
      },
    );

    const accessToken = this.jwtService.sign(
      {
        scope: ['accessToken'],
        userId: user.id,
      },
      {
        expiresIn: '30 seconds',
      },
    );

    delete user.password;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('user/signup')
  async signup(
    @Body() body: { name: string; email: string; password: string },
  ): Promise<SignUpResponse> {
    const { name, email, password } = body;

    const userAlreadyExists = await this.userService.findOne({
      email,
    });

    if (userAlreadyExists) {
      throw new BadRequestException('User already exists');
    }

    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltOrRounds);

    const user = await this.userService.createUser({
      name,
      email,
      password: hashPassword,
    });

    delete user.password;

    return {
      user,
    };
  }

  @Post('user/refresh')
  async refresh(
    @Headers() header: { authorization: string },
  ): Promise<RefreshResponse> {
    const { authorization } = header;

    const [, token] = authorization.split(' ');

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
      );

      if (payload.scope.indexOf('refreshToken') === -1) {
        throw new Error();
      }

      const user = await this.userService.findOne({
        id: payload.userId,
      });

      if (!user) {
        throw new Error();
      }

      const refreshToken = this.jwtService.sign(
        {
          scope: ['refreshToken'],
          userId: user.id,
        },
        {
          expiresIn: '1 minute',
        },
      );

      const accessToken = this.jwtService.sign(
        {
          scope: ['accessToken'],
          userId: user.id,
        },
        {
          expiresIn: '30 second',
        },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Cannot refresh session');
    }
  }

  @Get('/books')
  @UseGuards(AuthGuard)
  async books() {
    return [];
  }
}
