export function formatGames(row) {
  return {
    ...row,
    release_date: row.release_date.toISOString().split("T")[0],
    rating: parseFloat(row.rating),
    genres: row.genres.split(","),
  };
}

export function generateUpdateFields(values) {
  const setValues = [];
  const updateFields = [];

  if (values.img !== undefined) {
    setValues.push(values.img);
    updateFields.push("img = ?");
  }
  if (values.offer !== null) {
    setValues.push(values.offer);
    updateFields.push("offer = ?");
  }
  if (values.price !== null) {
    setValues.push(values.price);
    updateFields.push("price = ?");
  }
  if (values.stock !== null) {
    setValues.push(values.stock);
    updateFields.push("stock = ?");
  }
  if (values.title !== null) {
    setValues.push(values.title);
    updateFields.push("title = ?");
  }
  if (values.rating !== null) {
    setValues.push(values.rating);
    updateFields.push("rating = ?");
  }
  if (values.release_date !== null) {
    setValues.push(values.release_date);
    updateFields.push("release_date = ?");
  }
  if (values.short_description !== null) {
    setValues.push(values.short_description);
    updateFields.push("short_description = ?");
  }
  if (values.publisher !== null) {
    setValues.push(values.publisher);
    updateFields.push("publishers_id = ?");
  }
  if (values.developer !== null) {
    setValues.push(values.developer);
    updateFields.push("developers_id = ?");
  }

  return { setValues, updateFields };
}
