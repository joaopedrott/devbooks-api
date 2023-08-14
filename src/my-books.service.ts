import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma, MyBooks } from '@prisma/client';

@Injectable()
export class MyBooksService {
  constructor(private prisma: PrismaService) {}

  async findOne(
    myBooksWhereUniqueInput: Prisma.MyBooksWhereInput,
  ): Promise<MyBooks | null> {
    return this.prisma.myBooks.findFirst({
      where: myBooksWhereUniqueInput,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MyBooksWhereUniqueInput;
    where?: Prisma.MyBooksWhereInput;
    orderBy?: Prisma.MyBooksOrderByWithRelationInput;
  }): Promise<MyBooks[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.myBooks.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createMyBook(data: Prisma.MyBooksCreateInput): Promise<MyBooks> {
    return this.prisma.myBooks.create({
      data,
    });
  }

  async updateMyBook(params: {
    where: Prisma.MyBooksWhereUniqueInput;
    data: Prisma.MyBooksUpdateInput;
  }): Promise<MyBooks> {
    const { where, data } = params;
    return this.prisma.myBooks.update({
      data,
      where,
    });
  }

  async deleteMyBook(where: Prisma.MyBooksWhereUniqueInput): Promise<MyBooks> {
    return this.prisma.myBooks.delete({
      where,
    });
  }
}
