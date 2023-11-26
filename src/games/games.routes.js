import { Router } from "express";
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from "./games.controller.js";
import { uploadFile } from "../utility/handleStorage.js";

const router = Router();

router.get("/games", getGames);

router.get("/games/:id", getGame);

router.post("/games", uploadFile.single("img"), createGame);

router.patch("/games/:id", updateGame);

router.delete("/games/:id", deleteGame);

export default router;
