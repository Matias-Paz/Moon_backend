import express from "express";
import cors from "cors";
import gamesRoutes from "./routes/games.routes.js";
import indexRoutes from "./routes/index.routes.js";

const app = express();

// Configurar el middleware CORS para permitir cualquier origen
app.use(cors());

app.use(express.json());

app.use(indexRoutes);

app.use("/api", gamesRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

export default app;
