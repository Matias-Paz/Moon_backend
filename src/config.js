import { config } from "dotenv";
config();

// export const PORT = process.env.PORT || 3000;

export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "admin";
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_DATABASE = process.env.DB_DATABASE || "gamesBase";
export const DB_PORT = process.env.DB_PORT || 3306;

export const PORT = process.env.PORT || 8080;

// export const DB_USER = process.env.DB_USER || "uo02l1y1janw2zg1";
// export const DB_PASSWORD = process.env.DB_PASSWORD || "9nwS3DSuCehmylilixPb";
// export const DB_HOST = process.env.DB_HOST || "blij3znonpayvftrkmph-mysql.services.clever-cloud.com";
// export const DB_DATABASE = process.env.DB_DATABASE || "blij3znonpayvftrkmph";
// export const DB_PORT = process.env.DB_PORT || 3306;
