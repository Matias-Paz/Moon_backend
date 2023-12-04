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
    console.log("req.body", req.body);
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
    console.log("req.body.img", req.file);
    console.log("req.body.offer", req.body.offer);
    console.log("req.body.price", req.body.price);
    console.log("req.body.stock", req.body.stock);
    console.log("req.body.developer", req.body.developer);
    console.log("req.body.publisher", req.body.publisher);

    const genres = req.body.genres?.split(",");

    const reqGame = {
      title: req.body?.title || null,
      img: req.file?.filename || null,
      offer: req.body?.offer ? Number(req.body.offer) : null,
      price: req.body?.price ? Number(req.body.price) : null,
      stock: req.body?.stock ? Number(req.body.stock) : null,
      developer: req.body?.developer || null,
      publisher: req.body?.publisher || null,
      short_description: req.body?.short_description || null,
      release_date: req.body?.release_date
        ? new Date(req.body.release_date)
        : null,
      genres: Array.isArray(genres) ? genres.map((genre) => genre) : null,
    };

    console.log("reqGame", reqGame);

    return res.status(200).json({ message: "Game updated successfully!" });

    let developerId = null;

    if (reqGame.developer) {
      const existDeveloper = await gamesModel.existCompanyInDB(
        reqGame.developer
      );
      if (!existDeveloper.length > 0) {
        return res.status(404).json({ message: "Developer not found" });
      }
      developerId = existDeveloper[0].company_id;
    }

    let publisherId = null;

    if (reqGame.publisher) {
      const existDeveloper = await gamesModel.existCompanyInDB(
        reqGame.publisher
      );
      if (!existDeveloper.length > 0) {
        return res.status(404).json({ message: "Developer not found" });
      }
      publisherId = existDeveloper[0].company_id;
    }

    let genresId = null;

    if (reqGame.genres) {
      const existGenre = await gamesModel.existGenreInDB(reqGame.genres);
      if (!existGenre.length > 0) {
        return res.status(404).json({ message: "Genre not found" });
      }
      genresId = existGenre.map((item) => item.genres_id);
    }

    const newGame = {
      ...reqGame,
      developer: developerId,
      publisher: publisherId,
      genres: genresId,
    };

    const cleanedGame = Object.fromEntries(
      Object.entries(newGame).filter(([key, value]) => value !== null)
    );

    console.log("cleanedGame", cleanedGame);

    const resultValidation = gamesValidation(cleanedGame, true);

    // Si la validación falla, entonces se envía un mensaje de error.
    if (!resultValidation?.success) {
      // Si se subió una imagen, entonces se elimina.
      if (req.file) {
        deleteImage(req.file.path);
      }
      // Se envía un mensaje del error.
      return res.status(422).json({ message: resultValidation?.error });
    }

    return res.status(200).json({ message: "Game updated successfully!" });

    // Verificar si el publisher existe
    const genresExist = await Promise.all(
      updatedGenres.map((genreId) =>
        checkEntityExistsInDB("genres", "genres_id", genreId)
      )
    );

    if (genresExist.includes(false)) {
      throw { status: 404, message: "Developer or publisher not found." };
    }

    const updateData = req.body;

    res
      .status(200)
      .json({ message: "Game updated successfully!", updatedGame: newGame });
  } catch (error) {
    if (req.file) {
      deleteImage(req.file.path);
    }
    res.status(error.status || 500).json({ message: error.message });
  }
};
