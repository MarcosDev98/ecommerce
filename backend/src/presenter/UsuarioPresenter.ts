import Router from "express";
import { Usuario } from "../model/Usuario.js";
import { AppDataSource } from "../config/AppDataSource.js";

const router = Router();

router.post("/usuarios", async (request, response) => {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario)
    const nuevoUsuario = usuarioRepository.create(request.body)
    const resultado = await usuarioRepository.save(nuevoUsuario)

    return response.status(201).json(resultado) // modificar
  } catch (error) {
    console.error("Error al crear el usuario:", error)
    return response.status(500).json({message: "Error interno del servidor"});
  }
})

export default router;