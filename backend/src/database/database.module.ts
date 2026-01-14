import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/user-schema'; // Importa tus esquemas aquí

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
        // Pasamos el schema para tener autocompletado en todo el proyecto
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE], // Exportamos el token para que otros módulos lo usen
})
export class DatabaseModule {}