import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE } from '../database/database.module'
import * as schema from './entities/user.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}


  async create(createUserDto: CreateUserDto) {
    return await this.db
      .insert(schema.usersTable)
      .values(createUserDto)
      .returning();
  }

  async findAll() {
    return await this.db.query.usersTable.findMany();
  }

  async findOne(id: number) {
    return await this.db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, id),
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.db
      .update(schema.usersTable)
      .set(updateUserDto)
      .where(eq(schema.usersTable.id, id))
      .returning()
  }

  async remove(id: number) {
    return await this.db
      .delete(schema.usersTable)
      .where(eq(schema.usersTable.id, id))
      .returning()
  }
}
