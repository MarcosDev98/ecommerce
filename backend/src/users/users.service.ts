import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE } from '../database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { usersTable } from './entities/user.schema';
import { and, eq, isNull } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(createUserDto: CreateUserDto) {
    console.log('--- ENTRANDO AL CREATE DEL SERVICIO ---');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    console.log('Password original:', createUserDto.password);
    console.log('Hash generado:', hashedPassword);

    const [newUser] = await this.db
      .insert(usersTable)
      .values({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        age: createUserDto.age ?? null,
      })
      .returning();

    const { ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findByEmail(email: string) {
    return await this.db.query.usersTable.findFirst({
      where: and(eq(usersTable.email, email), isNull(usersTable.deletedAt)),
    });
  }

  async findAll() {
    return await this.db
      .select()
      .from(usersTable)
      .where(isNull(usersTable.deletedAt));
  }

  async findOne(id: number) {
    return await this.db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.db
      .update(usersTable)
      .set(updateUserDto)
      .where(eq(usersTable.id, id))
      .returning();
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`No existe un usuario con ID: ${id}`);
    }

    return await this.db
      .update(usersTable)
      .set({ deletedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
  }
}
