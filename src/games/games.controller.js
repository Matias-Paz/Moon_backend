import * as gamesModel from "./games.model.js";
import { gamesValidation } from "./games.validation.js";
import { deleteImage } from "../utility/deleteImage.js";

export const getGames = async (req, res) => {
  try {
    const {
      genre,
      min = 0,
      max = 999999,
      publisher,
      developer,
      sortOrder = "ASC",
      searchTerm = "",
    } = req.query;
    const games = await gamesModel.getGamesFromDB(
      genre,
      min,
      max,
      publisher,
      developer,
      sortOrder,
      searchTerm
    );
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await gamesModel.getGameFromDB(id);
    if (game) {
      res.status(200).json(game);
    } else {
      res.status(404).json({ message: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGame = async (req, res) => {
  const genresArray = Array.isArray(req.body.genres) ? req.body.genres : [];

  const uniqueGenres =
    genresArray.filter((genre) => !isNaN(Number(genre))) || [];

  const resultValidation = gamesValidation({
    title: req.body.title,
    img: req.file?.filename || "default.webp",
    offer: Number(req.body.offer),
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    rating: Number(0),
    developer: Number(req.body.developer),
    publisher: Number(req.body.publisher),
    release_date: new Date(req.body.release_date),
    short_description: req.body.short_description,
    genres: uniqueGenres.map((genre) => Number(genre)),
  });

  // Si la validación falla, entonces se envía un mensaje de error.
  if (!resultValidation?.success) {
    // Si se subió una imagen, entonces se elimina.
    if (req.file) {
      deleteImage(req.file.path);
    }
    // Se envía un mensaje del error.
    return res.status(422).json({ message: resultValidation?.error });
  }

  try {
    // Si la validación es exitosa, entonces se crea el juego en la base de datos.
    const newGame = await gamesModel.createGameInDB(resultValidation.data);

    // Se envía el juego creado como respuesta.
    return res.status(201).json(newGame);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await gamesModel.getGameFromDB(id);

    if (!game) {
      return res.status(422).json({ message: "Not valid ID" });
    }
    const deletedGame = await gamesModel.deleteGameInDB(id);

    if (!deletedGame) {
      return res.status(404).json({ message: "Error deleting game" });
    }

    if (game.img !== "default.webp") {
      await deleteImage(`public/images/${game.img}`);
    }
    return res.status(204).json({ message: "Game deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const newGame = await gamesModel.updateGameInDB(id, updateData);

    res
      .status(200)
      .json({ message: "Game updated successfully!", updatedGame: newGame });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
