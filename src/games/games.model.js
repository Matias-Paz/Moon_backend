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
      (g.price - (g.price * g.offer / 100)) AS discounted_price,
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
      (g.price - (g.price * g.offer / 100)) ${sortOrder};
  `,
    params
  );

  const formattedRows = rows.map((row) => {
    row.discounted_price = Math.round(row.discounted_price);
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
    c1.company_id AS publisher_id, c2.company_id AS developer_id, 
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
    genres: rows[0]?.genres ? rows[0].genres.split(",").map(Number) : undefined,
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
  const updatedGenres = updateData.genres || [];

  const resultValidation = gamesValidation(
    {
      title: updateData.title || null,
      img: updateData.img,
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
      developer: !isNaN(Number(updateData.developer))
        ? Number(updateData.developer)
        : updateData.developer,
      publisher: !isNaN(Number(updateData.publisher))
        ? Number(updateData.publisher)
        : updateData.publisher,
      short_description: updateData.short_description || null,
      release_date:
        updateData.release_date === undefined
          ? null
          : new Date(updateData.release_date),
      genres: updatedGenres.map((genre) =>
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
    updatedGenres.map((genreId) =>
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
    Object.keys(game).forEach((key) =>
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

export const existGenreInDB = async (genresName) => {
  const placeholders = genresName.map(() => "?").join(",");

  const [result] = await pool.query(
    `SELECT * FROM genres WHERE _name IN (${placeholders});`,
    [...genresName]
  );

  return result;
};

export const existCompanyInDB = async (companyName) => {
  const [result] = await pool.query(`SELECT * FROM company WHERE _name = ?;`, [
    companyName,
  ]);

  return result;
};
