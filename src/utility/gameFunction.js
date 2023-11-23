export function formatGames(row) {
  return {
    ...row,
    img: row.img,
    release_date: row.release_date.toISOString().split("T")[0],
    rating: parseFloat(row.rating),
    genres: row.genres.split(","),
  };
}
