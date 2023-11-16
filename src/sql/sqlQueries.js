export const SQLQueries = {
  getGamesQuery: `
      SELECT g.id, g.img_url, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description,
      c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres
      FROM games g
      JOIN company c1 ON g.publishers_id = c1.company_id
      JOIN company c2 ON g.developers_id = c2.company_id
      LEFT JOIN games_genres gg ON g.id = gg.games_id
      LEFT JOIN genres ge ON gg.genres_id = ge.genres_id
      GROUP BY g.id;
    `,

  getGameByIdQuery: `
      SELECT g.id, g.img_url, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description,
      c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres
      FROM games g
      JOIN company c1 ON g.publishers_id = c1.company_id
      JOIN company c2 ON g.developers_id = c2.company_id
      LEFT JOIN games_genres gg ON g.id = gg.games_id
      LEFT JOIN genres ge ON gg.genres_id = ge.genres_id
      WHERE g.id = ?
      GROUP BY g.id;
    `,

  createGameQuery: `
      INSERT INTO games (img_url, offer, price, stock, title, rating, release_date, short_description, publishers_id, developers_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,

  deleteGameGenresQuery: `
      DELETE FROM games_genres WHERE games_id = ?;
    `,

  deleteGameQuery: `
      DELETE FROM games WHERE id = ?;
    `,

  updateGameQuery: `
      UPDATE games SET ? WHERE id = ?;
    `,

  getGenresByIdsQuery: `
      SELECT _name FROM genres WHERE genres_id IN (?);
    `,

  getCompanyNamesQuery: `
      SELECT c1._name AS publisher, c2._name AS developer FROM company c1, company c2 WHERE c1.company_id = ? AND c2.company_id = ?;
    `,
  // Puedes agregar más consultas SQL según tus necesidades
};
