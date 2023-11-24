import { pool } from "../db.js";
import { gamesValidation } from "./games.validation.js";
import { formatGames } from "../utility/gameFunction.js";

export const getGamesFromDB = async () => {
  const [rows] = await pool.query(
    "SELECT g.gameId, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id GROUP BY g.id;"
  );

  const formattedRows = rows.map(row => {
    return formatGames(row);
  });
  return formattedRows;
};

export const getGameFromDB = async gameId => {
  const [rows] = await pool.query(
    "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
    [gameId]
  );

  return rows.length > 0 ? formatGames(rows[0]) : null;
};

export const getGenresDataFromDB = async usedGenres => {
  if (usedGenres.size > 0) {
    const genresData = await pool.query(
      "SELECT _name FROM genres WHERE genres_id IN (?)",
      [Array.from(usedGenres)]
    );

    return genresData;
  }

  return []; // Return an empty array if usedGenres is empty
};

export const createGameInDB = async ({
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
  genres,
}) => {
  try {
    const uniqueGenres = [...new Set(genres)].slice(0, 3);

    const usedGenres = new Set();
    const resultValidation = gamesValidation({
      title: title,
      img: img || "default.webp",
      offer: Number(offer),
      price: Number(price),
      stock: Number(stock),
      rating: Number(rating),
      developer: Number(developer),
      publisher: Number(publisher),
      release_date: new Date(release_date),
      short_description: short_description,
      genres: uniqueGenres.map(genre => Number(genre)),
    });

    if (!resultValidation?.success) {
      throw { status: 422, message: resultValidation?.error };
    }

    const [developerResult] = await pool.query(
      "SELECT * FROM company WHERE company_id = ?",
      [developer]
    );

    const [publisherResult] = await pool.query(
      "SELECT * FROM company WHERE company_id = ?",
      [publisher]
    );

    if (developerResult.length === 0 || publisherResult.length === 0) {
      throw { status: 404, message: "Developer or publisher not found." };
    }

    const genreCheckPromises = uniqueGenres.map(genreId =>
      checkEntityExistsInDB("games_genres", "genres_id", genreId)
    );
    const genreExistsResults = await Promise.all(genreCheckPromises);

    if (genreExistsResults.some(exists => !exists)) {
      throw { status: 404, message: "One or more genres not found." };
    }

    const [rows] = await pool.query(
      "INSERT INTO games (img, offer, price, stock, title, rating, release_date, short_description, publishers_id, developers_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
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
      ]
    );

    const gameId = rows.insertId;

    // Insert unique genres into the games_genres table directly from the array of IDs
    for (const genreId of uniqueGenres) {
      if (!usedGenres.has(genreId)) {
        await pool.query(
          "INSERT INTO games_genres (games_id, genres_id) VALUES (?, ?)",
          [gameId, genreId]
        );
        usedGenres.add(genreId); // Add the ID to the used genres
      }
    }

    // Get genre names from IDs
    const genresData = await getGenresDataFromDB(usedGenres);
    const genreNames = genresData[0].map(genre => genre._name);

    // Get publisher and developer names
    const [namesData] = await pool.query(
      "SELECT c1._name AS publisher, c2._name AS developer FROM company c1, company c2 WHERE c1.company_id = ? AND c2.company_id = ?",
      [publisher, developer]
    );

    const gameData = {
      id: gameId,
      title,
      img: img || "default.webp",
      offer,
      price,
      stock,
      rating,
      publisher: namesData[0].publisher,
      developer: namesData[0].developer,
      release_date,
      short_description,
      genres: genreNames, // Convert the array of genres to a string
    };

    return gameData;
  } catch (error) {
    // Handle the duplicate genre entry error
    if (error.code === "ER_DUP_ENTRY") {
      throw {
        status: 400,
        message: "Duplicate genre IDs are not allowed.",
      };
    }

    if (error.code === "ER_BAD_NULL_ERROR") {
      throw {
        status: 400,
        message: "Attempted to send a null value in some field.",
      };
    }

    throw {
      status: error.status || 500,
      message: error.message || "Something went wrong",
      error: error.toString(),
    };
  }
};

export const deleteGameInDB = async gameId => {
  // Delete associations of the game in the games_genres table
  await pool.query("DELETE FROM games_genres WHERE games_id = ?", [gameId]);

  // Delete the game from the games table
  const [result] = await pool.query("DELETE FROM games WHERE id = ?", [gameId]);

  return result.affectedRows > 0;
};

export const updateGameInDB = async (gameId, updateData, res) => {
  const updatedGenres = updateData.genres || [];

  const resultValidation = gamesValidation(
    {
      title: updateData.title || null,
      img: updateData.img || "default.webp",
      offer: !isNaN(Number(updateData.offer))
        ? Number(updateData.offer)
        : updateData.offer,
      price: !isNaN(Number(updateData.price))
        ? Number(updateData.price)
        : updateData.price,
      stock: !isNaN(Number(updateData.stock))
        ? Number(updateData.stock)
        : updateData.stock,
      rating: !isNaN(Number(updateData.rating))
        ? Number(updateData.rating)
        : updateData.rating,
      developer: Number(updateData.developer) || null,
      publisher: Number(updateData.publisher) || null,
      short_description: updateData.short_description || null,
      release_date:
        updateData.release_date === undefined
          ? null
          : new Date(updateData.release_date),
      genres: updatedGenres.map(genre =>
        !isNaN(Number(genre)) ? Number(genre) : genre
      ),
    },
    true
  );

  if (!resultValidation?.success) {
    throw { status: 422, message: JSON.parse(resultValidation?.error) };
  }
  // Verificar si el publisher existe
  const genresExist = await Promise.all(
    updatedGenres.map(genreId =>
      checkEntityExistsInDB("genres", "genres_id", genreId)
    )
  );

  if (genresExist.includes(false)) {
    throw { status: 404, message: "Developer or publisher not found." };
  }

  try {
    const updateFields = [];
    const setValues = [];

    // Iterar sobre las propiedades de updateData
    for (const field in updateData) {
      if (field === "release_date") {
        updateFields.push(`${field} = ?`);
        setValues.push(
          updateData[field] === null ? null : new Date(updateData[field])
        );
      } else if (field === "developer") {
        const developerExists = await checkEntityExistsInDB(
          "company",
          "company_id",
          updateData.developer
        );
        if (!developerExists) {
          throw { status: 404, message: "Developer not found." };
        }
        updateFields.push(`developers_id = ?`);
        setValues.push(updateData[field] === null ? null : updateData[field]);
      } else if (field === "publisher") {
        const publisherExists = await checkEntityExistsInDB(
          "company",
          "company_id",
          updateData.publisher
        );
        if (!publisherExists) {
          throw { status: 404, message: "Publisher not found." };
        }
        updateFields.push(`publishers_id = ?`);
        setValues.push(updateData[field] === null ? null : updateData[field]);
      } else if (field !== "genres") {
        // Agregar campo a las listas de actualización (excepto "genres")
        updateFields.push(`${field} = ?`);
        setValues.push(updateData[field] === null ? null : updateData[field]);
      }
    }

    // Actualizar la base de datos si hay campos para actualizar
    if (updateFields.length > 0) {
      const updateQuery = `UPDATE games SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;
      await pool.query(updateQuery, [...setValues, gameId]);
    }

    // Manejar las asociaciones de géneros
    if (updatedGenres.length > 0) {
      // Eliminar asociaciones de géneros existentes
      await pool.query("DELETE FROM games_genres WHERE games_id = ?", [gameId]);

      // Insertar nuevas asociaciones de géneros
      for (const genreId of updatedGenres) {
        await pool.query(
          "INSERT INTO games_genres (games_id, genres_id) VALUES (?, ?)",
          [gameId, genreId]
        );
      }
    }

    const [rows] = await pool.query(
      "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
      [gameId]
    );

    const game = { ...rows[0] };
    Object.keys(game).forEach(key =>
      game[key] === null ? delete game[key] : key
    );
    const formattedRow = formatGames(game);
    return formattedRow;
  } catch (error) {
    // Handle the duplicate genre entry error
    if (error.code === "ER_DUP_ENTRY") {
      throw {
        status: 400,
        message: "Duplicate genre IDs are not allowed.",
      };
    }

    if (error.code === "ER_BAD_NULL_ERROR") {
      throw {
        status: 400,
        message: "Attempted to send a null value in some field.",
      };
    }

    throw {
      status: error.status || 500,
      message: error.message || "Something went wrong",
      error: error.toString(),
    };
  }
};

export const checkEntityExistsInDB = async (tableName, idColumn, entityId) => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as count FROM ${tableName} WHERE ${idColumn} = ?`,
    [entityId]
  );
  return result[0].count > 0;
};
