import "reflect-metadata"
import { DataSource } from "typeorm";
import { Usuario } from "../model/Usuario.js"; 

// Asumimos que estás cargando las variables de entorno DB_HOST, DB_USER, etc.
// En tu archivo de inicio (index.ts)

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"), // Es buena práctica parsear el puerto
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "ecommerce",
    
    // --- LISTA DE ENTIDADES ---
    // TypeORM necesita saber dónde encontrar tus modelos.
    entities: [Usuario], // Usamos el array con la entidad Usuario importada
    
    // Configuración para que TypeORM cree el esquema
    synchronize: true, 
    logging: true, // Útil para ver las consultas SQL que TypeORM ejecuta
});