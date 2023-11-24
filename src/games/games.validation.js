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
  img: z.string().min(1).max(255).optional(),
  offer: z.number().min(0).max(100).optional(),
  price: z.number().min(1).max(999999).optional(),
  stock: z.number().min(0).max(255).optional(),
  title: z.string().min(1).max(255).optional(),
  rating: z.number().min(0).max(5).optional(),
  developer: z.number().min(1).max(999).optional(),
  publisher: z.number().min(1).max(999).optional(),
  short_description: z.string().min(1).max(255).optional(),
  release_date: z.date().optional(),
  genres: z.array(z.number()).min(0).max(3).optional(),
});

export function gamesValidation(object, nullable = false) {
  const schemaToUse = nullable ? gameSchemaNullable : gameSchema;
  return schemaToUse.safeParse(object);
}
