import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as userSchema from '../users/entities/user.schema'; // Importa tus esquemas aquí
import * as productSchema from '../products/entities/products.schema';

export const DRIZZLE = 'DRIZZLE'; // Token único para inyección

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
          connectionString,
        });
        // Unimos todos los esquemas en un solo objeto.
        return drizzle(pool, {
          schema: { ...userSchema, ...productSchema }
        });
      },
    },
  ],
  exports: [DRIZZLE], // Exportamos el token para que otros módulos lo usen
})
export class DatabaseModule {}