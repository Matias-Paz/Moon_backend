import { z } from "zod";

export class Validation {
  static schema = {
    base: {
      img: z.string().min(1).max(255).optional(),
      offer: z.number().min(0).max(100).optional(),
      price: z.number().min(1).max(999999).optional(),
      stock: z.number().min(0).max(255).optional(),
      title: z.string().min(1).max(255).optional(),
      developer: z.number().min(1).max(999).optional(),
      publisher: z.number().min(1).max(999).optional(),
      release_date: z.date().optional(),
      short_description: z.string().min(1).max(255).optional(),
      genres: z.array(z.number()).min(1).max(3).optional(),
    },
    creation: {
      rating: z.number().min(0).max(5),
    },
  };

  static creationValidation(object) {
    const schema = z.object({
      ...Validation.schema.base,
      ...Validation.schema.creation,
    });

    return schema.safeParse(object);
  }

  static updateValidation(object) {
    const schema = z.object(Validation.schema.base);
    return schema.safeParse(object);
  }
}
