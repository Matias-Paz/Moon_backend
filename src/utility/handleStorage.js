import multer from "multer";
import { randomUUID } from "node:crypto";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    /*     const pathStorage = `${__dirname}/../../public/images`;
    cb(null, pathStorage); */
    cb(null, join(__dirname, "../../", "public", "images"));
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    const infix = randomUUID();
    cb(null, "img-" + infix + ext);
  },
});

export const uploadFile = multer({ storage });
