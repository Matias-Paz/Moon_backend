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
  img: z.string().min(1).max(255).nullable().optional(),
  offer: z.number().min(0).max(100).nullable().optional(),
  price: z.number().min(1).max(999999).nullable().optional(),
  stock: z.number().min(0).max(255).nullable().optional(),
  title: z.string().min(1).max(255).nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  developer: z.number().min(1).max(999).nullable().optional(),
  publisher: z.number().min(1).max(999).nullable().optional(),
  short_description: z.string().min(1).max(255).nullable().optional(),
  release_date: z.date().nullable().optional(),
  genres: z.array(z.number()).min(0).max(3).nullable().optional(),
});

export function gamesValidation(object, nullable = false) {
  const schemaToUse = nullable ? gameSchemaNullable : gameSchema;
  return schemaToUse.safeParse(object);
}
