import * as gamesModel from "./games.model.js";
import { Validation } from "./gamesVa.js";
import { deleteImage } from "../utility/deleteImage.js";
import { arraysAreEqual } from "../utility/gameFunction.js";

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

    if (games.length === 0) {
      return res.status(404).json({ message: "Games not found" });
    }

    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getGenres = async (req, res) => {
  try {
    const genres = await gamesModel.getGenresFromDB();
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await gamesModel.getCompanyFromDB();
    res.status(200).json(company);
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

export const getGameId = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await gamesModel.getGameIdFromDB(id);
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
  try {
    const genresArray = Array.isArray(req.body.genres) ? req.body.genres : [];

    const uniqueGenres =
      genresArray.filter((genre) => !isNaN(Number(genre))) || [];

    const resultValidation = Validation.creationValidation({
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

    // Si la validación es exitosa, entonces se crea el juego en la base de datos.
    const newGame = await gamesModel.createGameInDB(resultValidation.data);

    // Se envía el juego creado como respuesta.
    return res.status(201).json(newGame);
  } catch (error) {
    if (req.file) {
      deleteImage(req.file.path);
    }
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
    let genres;
    if (req.body.genres) {
      genres = req.body.genres.split(",");
    }

    const reqGame = {
      title: req.body.title || null,
      img: req.file?.filename || null,
      offer: req.body.offer ? Number(req.body.offer) : null,
      price: req.body.price ? Number(req.body.price) : null,
      stock: req.body.stock ? Number(req.body.stock) : null,
      developer: req.body.developer ? Number(req.body.developer) : null,
      publisher: req.body.publisher ? Number(req.body.publisher) : null,
      short_description: req.body.short_description || null,
      release_date: req.body.release_date || null,
      genres: Array.isArray(genres) ? genres.map(Number) : null,
    };

    const id = Number(req.params.id);

    const game = await gamesModel.getGameIdFromDB(id);

    if (!game) {
      return res.status(422).json({ message: "Not valid ID" });
    }

    game.offer = Number(game.offer);
    game.price = Number(game.price);
    game.stock = Number(game.stock);
    game.publisher = Number(game.publisher);
    game.developer = Number(game.developer);
    game.genres = game.genres.map(Number);

    // Se filtran los valores que son iguales, nulos o indefinidos.
    const clearEntries = Object.fromEntries(
      Object.entries(reqGame).filter(([key, value]) => {
        // No se guardan los valores que son iguales, nulos o indefinidos.
        if (Array.isArray(value) && Array.isArray(game[key])) {
          return !arraysAreEqual(value, game[key]);
        } else {
          return game[key] !== value && value !== null && value !== undefined;
        }
      })
    );

    // Si no hay valores para actualizar, entonces se envía un mensaje de error.
    if (Object.keys(clearEntries).length === 0) {
      return res.status(422).json({ message: "No values to update." });
    }
    if (clearEntries.release_date) {
      clearEntries.release_date = new Date(req.body.release_date);
    }

    const resultValidation = Validation.updateValidation(clearEntries);

    // Si la validación falla, entonces se envía un mensaje de error.
    if (!resultValidation?.success) {
      // Si se subió una imagen, entonces se elimina.
      if (req.file) {
        deleteImage(req.file.path);
      }
      // Se envía un mensaje del error.
      return res.status(422).json({ message: resultValidation?.error });
    }

    // Si la validación es exitosa, entonces se actualiza el juego en la base de datos.
    const updatedGame = await gamesModel.updateGameInDB(
      id,
      resultValidation.data
    );

    // Si no se actualizó ningún juego, entonces se envía un mensaje de error.
    if (!updatedGame) {
      // Si se subió una imagen, entonces se elimina.
      if (req.file) {
        deleteImage(req.file.path);
      }
      // Se envía un mensaje del error.
      return res.status(404).json({ message: "Game not found." });
    }

    // Se envía un mensaje de éxito.
    return res.status(200).json({ message: "Game updated successfully!" });
  } catch (error) {
    if (req.file) {
      deleteImage(req.file.path);
    }
    res.status(error.status || 500).json({ message: error.message });
  }
};
