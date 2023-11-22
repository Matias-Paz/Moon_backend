import { Router } from "express";
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from "./games.controller.js";

const router = Router();

router.get("/games", getGames);

router.get("/games/:id", getGame);

router.post("/games", createGame);

router.patch("/games/:id", updateGame);

router.delete("/games/:id", deleteGame);

export default router;
