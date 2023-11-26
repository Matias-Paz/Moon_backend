import express from "express";
import cors from "cors";
import gamesRoutes from "./games/games.routes.js";
import { PORT } from "./config.js";

const app = express();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}: http://localhost:${PORT}`);
});

// Configurar el middleware CORS para permitir cualquier origen
app.use(cors());

app.disable("x-powered-by");

app.use(express.static("public"));

app.use(express.json());

app.use("/api", gamesRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

export default app;
