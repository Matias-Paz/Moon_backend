import { promises as fs } from "node:fs";
export const deleteImage = async (filePath) => {
  try {
    // Se elimina la imagen.
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}: ${error.message}`);
  }
};
