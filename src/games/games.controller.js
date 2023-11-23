import { formatGames } from "../utility/gameFunction.js";
import { gamesValidation } from "./games.validation.js";
import * as GameModel from "./games.model.js";

export const getGames = async (req, res) => {
  try {
    const rows = await GameModel.getGamesFromDatabase();
    const formattedRows = rows.map(row => formatGames(row));

    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const getGame = async (req, res) => {
  const gameId = req.params.id;

  try {
    const rows = await GameModel.getGameFromDatabase(gameId);

    if (rows.length <= 0)
      return res.status(404).json({
        message: "Game not found",
      });

    const formattedRow = formatGames(rows[0]);

    res.json(formattedRow);
  } catch (error) {
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const createGame = async (req, res) => {
  try {
    const uniqueGenres = [...new Set(req.body.genres)].slice(0, 3);

    const usedGenres = new Set();
    const resultValidation = gamesValidation({
      title: req.body.title,
      img: req.body.img || "default.webp",
      offer: Number(req.body.offer),
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      rating: Number(req.body.rating),
      developer: Number(req.body.developer),
      publisher: Number(req.body.publisher),
      release_date: new Date(req.body.release_date),
      short_description: req.body.short_description,
      genres: uniqueGenres.map(genre => Number(genre)),
    });

    if (!resultValidation?.success) {
      return res.status(422).json(resultValidation?.error);
    }

    const {
      title,
      img,
      offer,
      price,
      stock,
      rating,
      developer,
      publisher,
      release_date,
      short_description,
      genres,
    } = resultValidation.data;

    const gameId = await GameModel.createGameInDatabase({
      img,
      offer,
      price,
      stock,
      title,
      rating,
      release_date,
      short_description,
      publisher,
      developer,
    });

    // Insert unique genres into the games_genres table directly from the array of IDs
    for (const genreId of genres) {
      if (!usedGenres.has(genreId)) {
        await GameModel.createGenreAssociationInDatabase(gameId, genreId);
        usedGenres.add(genreId); // Add the ID to the used genres
      }
    }

    // Get genre names from IDs
    const genreNames = await GameModel.getGenresFromDatabase(
      Array.from(usedGenres)
    );

    // Get publisher and developer names
    const namesData = await GameModel.getCompanyNamesFromDatabase(
      publisher,
      developer
    );

    const gameData = {
      id: gameId,
      title,
      img,
      offer,
      price,
      stock,
      rating,
      publisher: namesData.publisher,
      developer: namesData.developer,
      release_date,
      short_description,
      genres: genreNames.join(","), // Convert genres array to a string
    };

    // Format the game data before sending the response
    const formattedGame = formatGames(gameData);

    res.json(formattedGame);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: `${error}`,
    });
  }
};

export const deleteGame = async (req, res) => {
  try {
    // Delete game associations in the games_genres table
    await GameModel.deleteGameAssociationsFromDatabase(req.params.id);

    // Delete the game from the games table
    const affectedRows = await GameModel.deleteGameFromDatabase(req.params.id);

    if (affectedRows <= 0) {
      return res.status(404).json({
        message: "Game not found",
      });
    }

    res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const updateGame = async (req, res) => {
  const { id } = req.params;

  const updatedGenres = req.body.genres || [];

  const resultValidation = gamesValidation(
    {
      title: req.body.title || null,
      img: req.body.img || "default.webp",
      offer: req.body.offer || null,
      price: req.body.price || null,
      stock: req.body.stock || null,
      rating: req.body.rating || null,
      developer: req.body.developer || null,
      publisher: req.body.publisher || null,
      short_description: req.body.short_description || null,
      release_date:
        req.body.release_date === undefined
          ? null
          : new Date(req.body.release_date),
      genres: updatedGenres.map(genre => Number(genre)),
    },
    true
  );

  if (!resultValidation?.success) {
    return res.status(422).json(resultValidation?.error);
  }

  try {
    const updateFields = [];
    const setValues = [];

    // Iterate over the properties of req.body
    for (const field in req.body) {
      if (field === "release_date") {
        updateFields.push(`${field} = ?`);
        setValues.push(
          req.body[field] === null ? null : new Date(req.body[field])
        );
      } else if (field === "developer") {
        updateFields.push(`developers_id = ?`);
        setValues.push(req.body[field] === null ? null : req.body[field]);
      } else if (field === "publisher") {
        updateFields.push(`publishers_id = ?`);
        setValues.push(req.body[field] === null ? null : req.body[field]);
      } else if (field !== "genres") {
        // Add field to update lists (except "genres")
        updateFields.push(`${field} = ?`);
        setValues.push(req.body[field] === null ? null : req.body[field]);
      }
    }

    // Update the database if there are fields to update
    await GameModel.updateGameInDatabase(id, updateFields, setValues);

    // Handle genre associations
    if (updatedGenres.length > 0) {
      // Delete existing genre associations
      await GameModel.deleteGameAssociationsFromDatabase(id);

      // Insert new genre associations
      for (const genreId of updatedGenres) {
        await GameModel.createGenreAssociationInDatabase(id, genreId);
      }
    }

    // Rest of the code for result retrieval...
    const rows = await GameModel.getGameFromDatabase(id);
    const game = { ...rows[0] };
    Object.keys(game).forEach(key =>
      game[key] === null ? delete game[key] : key
    );

    const formattedRow = formatGames(game);
    res.json(formattedRow);
  } catch (error) {
    // Handle duplicate genre insertion error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Duplicate genre IDs are not allowed.",
      });
    }

    if (error.code === "ER_BAD_NULL_ERROR") {
      return res.status(400).json({
        message: "Null was attempted to be sent in some field.",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: `${error}`,
    });
  }
};
