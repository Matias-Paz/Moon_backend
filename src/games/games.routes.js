import { Router } from "express";
import {
  getGames,
  getGenres,
  getCompany,
  getGame,
  getGameId,
  createGame,
  updateGame,
  deleteGame,
} from "./games.controller.js";
import { uploadFile } from "../utility/handleStorage.js";

const router = Router();

router.get("/games", getGames);

router.get("/genres", getGenres);

router.get("/company", getCompany);

router.get("/games/:id", getGame);

router.get("/gamesId/:id", getGameId);

router.post("/games", uploadFile.single("img"), createGame);

router.patch("/games/:id", uploadFile.single("img"), updateGame);

router.delete("/games/:id", deleteGame);

export default router;
