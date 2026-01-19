import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE } from '../database/database.module';
import type { DrizzleDB } from '../database/database.module';
import * as schema from './entities/user.schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB
  ) { }


  async create(createUserDto: CreateUserDto) {
    console.log('--- ENTRANDO AL CREATE DEL SERVICIO ---');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    console.log('Password original:', createUserDto.password);
    console.log('Hash generado:', hashedPassword);

    const [newUser] = await this.db
      .insert(schema.usersTable)
      .values({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        age: createUserDto.age ?? null,
      })
      .returning();

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findByEmail(email: string) {
    return await this.db.query.usersTable.findFirst({
      where: eq(schema.usersTable.email, email),
    });
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
