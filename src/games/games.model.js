import { pool } from "../db.js";
import { formatGames } from "../utility/gameFunction.js";

export const getGamesFromDB = async (
  genre,
  min,
  max,
  publisher,
  developer,
  sortOrder,
  searchTerm
) => {
  let whereClause = "";
  let params = [];

  if (genre) {
    whereClause += " AND ge._name = ?";
    params.push(genre);
  }

  whereClause += " AND g.price >= ? AND g.price <= ?";
  params.push(min, max);

  if (publisher) {
    whereClause += " AND c1._name = ?";
    params.push(publisher);
  }
  if (developer) {
    whereClause += " AND c1._name = ?";
    params.push(developer);
  }

  if (searchTerm) {
    whereClause += " AND g.title LIKE ?";
    params.push(`%${searchTerm}%`);
  }

  const [rows] = await pool.query(
    `
    SELECT
      g.id,
      g.img,
      g.offer,
      g.price,
      g.stock,
      g.title,
      g.rating,
      g.release_date,
      g.short_description,
      c1._name AS publisher,
      c2._name AS developer,
      GROUP_CONCAT(DISTINCT ge._name) AS genres
    FROM
      games g
      JOIN company c1 ON g.publishers_id = c1.company_id
      JOIN company c2 ON g.developers_id = c2.company_id
      LEFT JOIN games_genres gg ON g.id = gg.games_id
      LEFT JOIN genres ge ON gg.genres_id = ge.genres_id
    WHERE 1 = 1 ${whereClause}
    GROUP BY
      g.id
    ORDER BY
      g.price ${sortOrder};
  `,
    params
  );

  const formattedRows = rows.map((row) => {
    return formatGames(row);
  });

  return formattedRows;
};

export const getGenresFromDB = async () => {
  const [rows] = await pool.query("SELECT * FROM genres");
  return rows;
};

export const getCompanyFromDB = async () => {
  const [rows] = await pool.query("SELECT * FROM company");
  return rows;
};

export const getGameFromDB = async (gameId) => {
  const [rows] = await pool.query(
    "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
    [gameId]
  );

  return rows.length > 0 ? formatGames(rows[0]) : null;
};

export const getGameIdFromDB = async (gameId) => {
  const query = `
  SELECT 
    g.img, g.offer, g.price, g.stock, g.title, g.release_date, g.short_description, 
    c1.company_id AS publisher, c2.company_id AS developer, 
    GROUP_CONCAT(ge.genres_id) AS genres
  FROM 
    games g 
    JOIN company c1 ON g.publishers_id = c1.company_id 
    JOIN company c2 ON g.developers_id = c2.company_id 
    JOIN games_genres gg ON g.id = gg.games_id 
    JOIN genres ge ON gg.genres_id = ge.genres_id 
  WHERE 
    g.id = ? 
  GROUP BY 
    g.id;
`;

  const [rows] = await pool.query(query, [gameId]);

  const game = {
    ...rows[0],
    offer: rows[0]?.offer ? String(rows[0].offer) : undefined,
    price: rows[0]?.price ? String(rows[0].price) : undefined,
    stock: rows[0]?.stock ? String(rows[0].stock) : undefined,
    publisher: rows[0]?.publisher ? String(rows[0].publisher) : undefined,
    developer: rows[0]?.developer ? String(rows[0].developer) : undefined,
    genres: rows[0]?.genres ? rows[0].genres.split(",") : undefined,
    release_date: rows[0]?.release_date
      ? rows[0].release_date.toISOString().split("T")[0]
      : undefined,
  };

  return game || null;
};

export const getGenresDataFromDB = async (usedGenres) => {
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
    // Comprobando si el desarrollador existe en la base de datos
    const [developerResult] = await pool.query(
      "SELECT * FROM company WHERE company_id = ?",
      [developer]
    );

    // Comprobando si el editor existe en la base de datos
    const [publisherResult] = await pool.query(
      "SELECT * FROM company WHERE company_id = ?",
      [publisher]
    );

    // Si el desarrollador o el editor no existen, entonces se envía un mensaje de error
    if (developerResult.length === 0 || publisherResult.length === 0) {
      throw { status: 404, message: "Developer or publisher not found." };
    }

    // Comprobando si los géneros existen en la base de datos
    const genreCheckPromises = genres.map((genreId) =>
      checkEntityExistsInDB("games_genres", "genres_id", genreId)
    );

    // Esperando a que todas las promesas se resuelvan
    const genreExistsResults = await Promise.all(genreCheckPromises);

    // Si alguno de los géneros no existe, entonces se envía un mensaje de error
    if (genreExistsResults.some((exists) => !exists)) {
      throw { status: 404, message: "One or more genres not found." };
    }

    // Insertar el juego en la base de datos
    // Consulta para obtener el último ID
    const [lastIdRows] = await pool.query(
      "SELECT MAX(id) AS ultimo_id FROM games"
    );

    // Obtén el último ID
    const ultimoId = lastIdRows[0].ultimo_id;

    // Insertar un nuevo registro usando el último ID
    const [rows] = await pool.query(
      "INSERT INTO games (id, img, offer, price, stock, title, rating, release_date, short_description, publishers_id, developers_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        ultimoId + 1, // Incrementa el último ID para el nuevo registro
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

    // Obtener el ID del juego insertado
    const gameId = rows.insertId;

    // Insertar las asociaciones de géneros en la base de datos
    for (const genreId of genres) {
      await pool.query(
        "INSERT INTO games_genres (games_id, genres_id) VALUES (?, ?)",
        [gameId, genreId]
      );
    }

    // Obtener los datos del juego insertado
    const gameData = await getGameFromDB(gameId);

    // Retornar los datos del juego
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

export const deleteGameInDB = async (gameId) => {
  // Delete associations of the game in the games_genres table
  await pool.query("DELETE FROM games_genres WHERE games_id = ?", [gameId]);

  // Delete the game from the games table
  const [result] = await pool.query("DELETE FROM games WHERE id = ?", [gameId]);

  return result.affectedRows > 0;
};

export const updateGameInDB = async (gameId, updateData) => {
  try {
    const id = Number(gameId);
    const gameData = { ...updateData };
    const currentGenre = {};

    if (gameData?.developer) {
      // Comprobando si el desarrollador existe en la base de datos
      const [developerResult] = await existCompanyId(gameData.developer);

      if (developerResult.length === 0) {
        throw { status: 404, message: "Developer not found." };
      }

      delete gameData.developer;

      // Insertar el juego en gamesData para actualizarlo en la base de datos
      gameData.developers_id = developerResult.company_id;
    }

    if (gameData?.publisher) {
      // Comprobando si el editor existe en la base de datos
      const [publisherResult] = await existCompanyId(gameData.publisher);

      if (publisherResult.length === 0) {
        throw { status: 404, message: "Publisher not found." };
      }

      delete gameData.publisher;

      // Insertar el juego en gamesData para actualizarlo en la base de datos
      gameData.publishers_id = publisherResult.company_id;
    }

    if (gameData?.genres) {
      // Comprobando si los géneros existen en la base de datos
      const GenresResult = await existGenreId(gameData.genres);

      if (GenresResult && GenresResult.length === 0) {
        throw { status: 404, message: "Genres not found." };
      }

      // Insertar el juego en curentGenre para actualizarlo en la base de datos
      currentGenre.genres = GenresResult.map((genre) => genre.genres_id);

      delete gameData.genres;

      // borrando las asociaciones de géneros en la base de datos
      await deleteGames_Genres(id);

      // Insertar las asociaciones de géneros en la base de datos
      for (const genreId of currentGenre.genres) {
        await addGames_Genres(id, genreId);
      }
    }

    let result = false;

    if (Object.keys(gameData).length > 0) {
      const updateQuery = `
      UPDATE games
      SET ${Object.keys(gameData)
        .map((key) => `${key} = ?`)
        .join(", ")}
      WHERE id = ?
      `;

      const updateValues = [...Object.values(gameData), id];

      result = await pool.query(updateQuery, updateValues);
    }

    return result;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};

export const checkEntityExistsInDB = async (tableName, idColumn, entityId) => {
  try {
    const [result] = await pool.query(
      `SELECT COUNT(*) as count FROM ${tableName} WHERE ${idColumn} = ?`,
      [entityId]
    );

    return result[0].count > 0;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};

export const existGenreName = async (genresName) => {
  try {
    const placeholders = genresName.map(() => "?").join(",");

    const [result] = await pool.query(
      `SELECT * FROM genres WHERE _name IN (${placeholders});`,
      [...genresName]
    );

    return result;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};

export const existGenreId = async (genresId) => {
  try {
    const placeholders = genresId.map(() => "?").join(",");

    const [result] = await pool.query(
      `SELECT * FROM genres WHERE genres_id IN (${placeholders});`,
      [...genresId]
    );

    return result;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};

export const addGames_Genres = async (gamesId, genresId) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO games_genres (games_id, genres_id) VALUES (?, ?);",
      [gamesId, genresId]
    );

    return result;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};

export const deleteGames_Genres = async (gamesId) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM games_genres WHERE games_id = ?;",
      [gamesId]
    );

    return result;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};

export const existCompanyInDB = async (companyName) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM company WHERE _name = ?;",
      [companyName]
    );

    return result;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};

export const existCompanyId = async (companyId) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM company WHERE company_id = ?;",
      [companyId]
    );

    return result;
  } catch (error) {
    throw { status: 500, message: error.message, error: error };
  }
};
