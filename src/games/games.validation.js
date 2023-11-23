import { z } from "zod";

const gameSchema = z.object({
  img: z.string().min(1).max(255),
  offer: z.number().min(0).max(100),
  price: z.number().min(1).max(999999),
  stock: z.number().min(0).max(255),
  title: z.string().min(1).max(255),
  rating: z.number().min(0).max(5),
  developer: z.number().min(1).max(999),
  publisher: z.number().min(1).max(999),
  release_date: z.date(),
  short_description: z.string().min(1).max(255),
  genres: z.array(z.number()).min(1).max(3),
});

const gameSchemaNullable = z.object({
  img: z.string().min(1).max(255).nullable(),
  offer: z.number().min(0).max(100).nullable(),
  price: z.number().min(1).max(999999).nullable(),
  stock: z.number().min(0).max(255).nullable(),
  title: z.string().min(1).max(255).nullable(),
  rating: z.number().min(0).max(5).nullable(),
  developer: z.number().min(1).max(999).nullable(),
  publisher: z.number().min(1).max(999).nullable(),
  short_description: z.string().min(1).max(255).nullable(),
  release_date: z.date().nullable(),
  genres: z.array(z.number()).min(0).max(3).nullable(),
});

export function gamesValidation(object, nullable = false) {
  const schemaToUse = nullable ? gameSchemaNullable : gameSchema;
  return schemaToUse.safeParse(object);
}
