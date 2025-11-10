import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./config/AppDataSource.js";
import 'dotenv/config'
import usuarioRoutes from './presenter/UsuarioPresenter.js';

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;


AppDataSource.initialize().then(() => {
    console.log("Data Source has been initialized!");

    app.use("/", usuarioRoutes); 

    app.listen(4000, () => {
        console.log("Servidor en puerto 4000");
    });

}).catch((error) => console.error("Error during Data Source initialization:", error));




