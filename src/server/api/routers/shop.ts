import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export type Product = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  size: string | null;
  color: string | null;
  stock: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImage[];
  quantity?: number;
};

export type ProductImage = {
  id: number;
  source: string;
  productId: number;
};

export const shopRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        price: z.number(),
        stock: z.number().optional(),
        images: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newProduct = await ctx.db.product.create({
        data: {
          title: input.title,
          subtitle: input.subtitle,
          price: input.price,
          stock: input.stock,
          images: {
            createMany: {
              data: input.images.map((image) => {
                return { source: image };
              }),
            },
          },
        },
        include: { images: true },
      });
      return newProduct;
    }),

  getProductById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      const product = ctx.db.product.findUnique({
        where: {
          id: input.id,
        },
        include: {
          images: true,
        },
      });
      return product;
    }),

  getAllProducts: publicProcedure.query(({ ctx }) => {
    return ctx.db.product.findMany({
      include: {
        images: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),
});
