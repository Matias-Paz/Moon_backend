import { randomUUID } from "node:crypto";
import multer from "multer";
//recreate __dirname for ES Modules
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pathStorage = `${__dirname}/../../public/images`;
    cb(null, pathStorage);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname;
    const infix = randomUUID();
    const imgName = `img-${infix}${ext}`;
    cb(null, imgName);
  },
});

export const uploadFile = multer({ storage });
