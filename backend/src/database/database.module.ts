import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as userSchema from '../users/entities/user.schema'; // Importa tus esquemas aquí
import * as productSchema from '../products/entities/products.schema';
import * as orderSchema from '../orders/entities/order.schema';

export const DRIZZLE = 'DRIZZLE'; // Token único para inyección

export const appSchema = {
  ...userSchema,
  ...productSchema,
  ...orderSchema,
};

export type DrizzleDB = NodePgDatabase<typeof appSchema>;

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
        return drizzle(pool, { schema: appSchema });
      },
    },
  ],
  exports: [DRIZZLE], // Exportamos el token para que otros módulos lo usen
})
export class DatabaseModule {}
