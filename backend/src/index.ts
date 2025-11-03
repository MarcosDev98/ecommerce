import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.get("/", (_req, res) => {
  res.send("Backend funcionando");
});

app.listen(port, () => {
  console.log(`Servidor en puerto ${port}`);
});
