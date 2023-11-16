import { pool } from "../db.js";
import { formatGames, generateUpdateFields } from "../utility/gameFunction.js";

export const getGames = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id GROUP BY g.id;"
    );

    const formattedRows = rows.map(row => {
      return formatGames(row);
    });

    res.json(formattedRows);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wrong",
      error: `${error}`,
    });
  }
};

export const getGame = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
      [req.params.id]
    );

    if (rows.length <= 0)
      return res.status(404).json({
        message: "Game not found",
      });

    const formattedRow = formatGames(rows[0]);
    res.json(formattedRow);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const createGame = async (req, res) => {
  try {
    const {
      img,
      offer,
      price,
      stock,
      title,
      rating,
      developer,
      publisher,
      release_date,
      short_description,
      genres, // Array de IDs de géneros
    } = req.body;

    // Verificar si alguna de las propiedades requeridas está vacía
    if (
      [
        offer,
        price,
        stock,
        title,
        rating,
        developer,
        publisher,
        release_date,
        short_description,
      ].some(value => value === "" || value === null) ||
      (genres !== null && (genres.length === 0 || genres.length > 3))
    ) {
      return res.status(400).json({
        message:
          "Some required properties are missing or empty, or 'genres' array is empty or exceeds the limit of three genres when provided.",
      });
    }

    const formattedReleaseDate = new Date(release_date);
    const year = formattedReleaseDate.getFullYear();
    const month = String(formattedReleaseDate.getMonth() + 1).padStart(2, "0");
    const day = String(formattedReleaseDate.getDate()).padStart(2, "0");
    const formattedDateString = `${year}-${month}-${day}`;

    const [rows] = await pool.query(
      "INSERT INTO games (img, offer, price, stock, title, rating, release_date, short_description, publishers_id, developers_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        img,
        offer,
        price,
        stock,
        title,
        rating,
        formattedDateString,
        short_description,
        publisher,
        developer,
      ]
    );

    const gameId = rows.insertId;

    const uniqueGenres = [...new Set(genres)].slice(0, 3); // Limitar a tres géneros únicos

    const usedGenres = new Set(); // Para rastrear IDs de géneros usados

    // Insertar géneros únicos en la tabla games_genres directamente desde el array de IDs
    for (const genreId of uniqueGenres) {
      if (!usedGenres.has(genreId)) {
        await pool.query(
          "INSERT INTO games_genres (games_id, genres_id) VALUES (?, ?)",
          [gameId, genreId]
        );
        usedGenres.add(genreId); // Agregar el ID a los géneros usados
      }
    }

    // Obtener los nombres de géneros a partir de los IDs
    const [genresData] = await pool.query(
      "SELECT _name FROM genres WHERE genres_id IN (?)",
      [Array.from(usedGenres)]
    );

    const genreNames = genresData.map(genre => genre._name);

    // Obtener los nombres del publisher y del developer
    const [namesData] = await pool.query(
      "SELECT c1._name AS publisher, c2._name AS developer FROM company c1, company c2 WHERE c1.company_id = ? AND c2.company_id = ?",
      [publisher, developer]
    );

    res.send({
      id: gameId,
      img,
      offer,
      price,
      stock,
      title,
      rating,
      release_date: formattedDateString,
      short_description,
      publisher: namesData[0].publisher, // Nombre del publisher
      developer: namesData[0].developer, // Nombre del developer
      genres: genreNames, // Devolver los nombres de los géneros seleccionados
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const deleteGame = async (req, res) => {
  try {
    // Eliminar las asociaciones del juego en la tabla games_genres
    await pool.query("DELETE FROM games_genres WHERE games_id = ?", [
      req.params.id,
    ]);

    // Eliminar el juego de la tabla games
    const [result] = await pool.query("DELETE FROM games WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows <= 0) {
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
  const {
    img,
    offer,
    price,
    stock,
    title,
    rating,
    release_date,
    short_description,
    developer,
    publisher,
    genres,
  } = req.body;

  try {
    const updateFields = [];
    const setValues = [];

    if (img !== undefined) {
      updateFields.push("img = ?");
      setValues.push(img === null ? "img" : img);
    }

    if (offer !== undefined) {
      updateFields.push("offer = ?");
      setValues.push(offer === null ? "offer" : offer);
    }

    if (price !== undefined) {
      updateFields.push("price = ?");
      setValues.push(price === null ? "price" : price);
    }

    if (stock !== undefined) {
      updateFields.push("stock = ?");
      setValues.push(stock === null ? "stock" : stock);
    }

    if (title !== undefined) {
      updateFields.push("title = ?");
      setValues.push(title === null ? "title" : title);
    }

    if (rating !== undefined) {
      updateFields.push("rating = ?");
      setValues.push(rating === null ? "rating" : rating);
    }

    if (release_date !== undefined) {
      updateFields.push("release_date = ?");
      setValues.push(release_date === null ? "release_date" : release_date);
    }

    if (short_description !== undefined) {
      updateFields.push("short_description = ?");
      setValues.push(
        short_description === null ? "short_description" : short_description
      );
    }

    if (developer !== undefined) {
      updateFields.push("developers_id = ?");
      setValues.push(developer === null ? "developers_id" : developer);
    }

    if (publisher !== undefined) {
      updateFields.push("publishers_id = ?");
      setValues.push(publisher === null ? "publishers_id" : publisher);
    }

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE games SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;
      await pool.query(updateQuery, [...setValues, id]);
    }

    if (genres !== undefined) {
      if (genres === null) {
        // If genres is null, do nothing with genres in the database
      } else {
        const uniqueGenres = [...new Set(genres)];
        const isDuplicate = uniqueGenres.length !== genres.length;

        if (isDuplicate) {
          return res.status(400).json({
            message: "Duplicate genre IDs are not allowed.",
          });
        }

        await pool.query("DELETE FROM games_genres WHERE games_id = ?", [id]);

        for (const genreId of uniqueGenres) {
          await pool.query(
            "INSERT INTO games_genres (games_id, genres_id) VALUES (?, ?)",
            [id, genreId]
          );
        }
      }
    }

    const [rows] = await pool.query(
      "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
      [id]
    );

    const game = { ...rows[0] };
    Object.keys(game).forEach(key =>
      game[key] === null ? delete game[key] : key
    );

    const formattedRow = formatGames(game);
    res.json(formattedRow);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
