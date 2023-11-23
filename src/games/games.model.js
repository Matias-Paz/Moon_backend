import { pool } from "../db.js";

export const getGamesFromDatabase = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id GROUP BY g.id;"
    );

    return rows;
  } catch (error) {
    throw error;
  }
};

export const getGameFromDatabase = async gameId => {
  try {
    const [rows] = await pool.query(
      "SELECT g.id, g.img, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
      [gameId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
};

export const createGameInDatabase = async gameData => {
  try {
    const [rows] = await pool.query(
      "INSERT INTO games (img, offer, price, stock, title, rating, release_date, short_description, publishers_id, developers_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        gameData.img,
        gameData.offer,
        gameData.price,
        gameData.stock,
        gameData.title,
        gameData.rating,
        gameData.release_date,
        gameData.short_description,
        gameData.publisher,
        gameData.developer,
      ]
    );

    return rows.insertId;
  } catch (error) {
    throw error;
  }
};

export const deleteGameFromDatabase = async gameId => {
  try {
    await pool.query("DELETE FROM games_genres WHERE games_id = ?", [gameId]);
    const [result] = await pool.query("DELETE FROM games WHERE id = ?", [
      gameId,
    ]);

    return result.affectedRows;
  } catch (error) {
    throw error;
  }
};

export const updateGameInDatabase = async (gameId, updateFields, setValues) => {
  try {
    if (updateFields.length > 0) {
      const updateQuery = `UPDATE games SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;
      await pool.query(updateQuery, [...setValues, gameId]);
    }
  } catch (error) {
    throw error;
  }
};

export const getGenresFromDatabase = async genreIds => {
  try {
    const [genresData] = await pool.query(
      "SELECT _name FROM genres WHERE genres_id IN (?)",
      [genreIds]
    );

    return genresData.map(genre => genre._name);
  } catch (error) {
    throw error;
  }
};

export const getCompanyNamesFromDatabase = async (publisherId, developerId) => {
  try {
    const [namesData] = await pool.query(
      "SELECT c1._name AS publisher, c2._name AS developer FROM company c1, company c2 WHERE c1.company_id = ? AND c2.company_id = ?",
      [publisherId, developerId]
    );

    return namesData[0];
  } catch (error) {
    throw error;
  }
};
