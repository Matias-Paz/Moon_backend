import { z } from "zod";

const gameSchema = z.object({
  img_url: z.string().min(1).max(255),
  offer: z.number().min(0).max(100),
  price: z.number().min(1).max(999999),
  stock: z.number().min(0).max(255),
  title: z.string().min(1).max(255),
  rating: z.number().min(0).max(5),
  developer: z.number().min(1).max(999),
  publisher: z.number().min(1).max(999),
  release_date: z.date(),
  short_description: z.string().min(1).max(255),
  genres: z.array(z.number()),
});

export function gamesValidation(object) {
  return gameSchema.safeParse(object);
}
