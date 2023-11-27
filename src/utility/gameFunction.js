export function formatGames(row) {
  return {
    ...row,
    img: row.img === null ? "default.webp" : row.img,
    release_date: row.release_date
      ? row.release_date.toISOString().split("T")[0]
      : null,
    rating: parseFloat(row.rating),
    genres: row.genres ? row.genres.split(",") : [], // Check if row.genres is not null before splitting
  };
}
