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

export function arraysAreEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}
