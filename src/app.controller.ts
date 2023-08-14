import {
  Body,
  Post,
  Headers,
  Controller,
  Get,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Query,
  Put,
  Param,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from './auth.guard';
import axios from 'axios';

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

interface BooksQuery {
  q: string;
  maxResults: number;
}

interface AuthRequest {
  userId: string;
}

type BookState = 'is-reading' | 'read' | 'wants-to-read';

interface AddToMyBooksBody {
  bookId: string;
  bookState: BookState;
}

interface UpdateBookReadingBody {
  page: number;
}

interface UpdateBookReadingParams {
  id: number;
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
        expiresIn: '3 hours',
      },
    );

    const accessToken = this.jwtService.sign(
      {
        scope: ['accessToken'],
        userId: user.id,
      },
      {
        expiresIn: '1 hour',
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
  async books(@Query() query: BooksQuery) {
    const { q, maxResults } = query;

    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=${maxResults}`,
    );

    return {
      totalItems: response.data.totalItems,
      items: response.data.items,
    };
  }

  @Get('/books/my-books')
  @UseGuards(AuthGuard)
  async myBooks(@Request() req: AuthRequest) {
    //TODO: query all books from a userId in my-books table.
    //TODO: return them.
  }

  @Post('/books/my-books')
  @UseGuards(AuthGuard)
  async addToMyBooks(
    @Request() req: AuthRequest,
    @Body() body: AddToMyBooksBody,
  ) {
    //TODO: check if the bookId and userId pair already exists in my-books table, if so, throw.
    //TODO: before save, call google books api to fetch the book payload to save it along.
    //TODO: return the new record created in my-books table.
  }

  @Put('/books/:id/reading')
  @UseGuards(AuthGuard)
  async updateBookReading(
    @Param() params: UpdateBookReadingParams,
    @Body() body: UpdateBookReadingBody,
    @Request() req: AuthRequest,
  ) {
    //TODO: check if the id and userId pair already exists in my-books table, if not, throw.
    //TODO: check if the currentPage sent is greater then or equal to the book's page, if so, change the book state to read.
    //TODO: update the record with the new currentPage in my-books table.
    //TODO: return the updated record.
  }
}
