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
  colorsAvailabe: string | null;
  stock: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImage[];
  quantity?: number;
};

export type ProductImage = {
  id?: number;
  source: string;
  productId?: number;
};

export const shopRouter = createTRPCRouter({
  createProduct: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        description: z.string().optional(),
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
          description: input.description,
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

  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        subtitle: z.string().nullish(),
        description: z.string().nullish(),
        price: z.number(),
        stock: z.number().optional(),
        images: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedProduct = await ctx.db.product.update({
        where: { id: input.id },
        data: {
          title: input.title,
          subtitle: input.subtitle,
          description: input.description,
          price: input.price,
          stock: input.stock,
        },
        include: { images: true },
      });

      const imagesToRemove = updatedProduct.images
        .map((image) => {
          if (!input.images.includes(image.source)) return image.id;
          else return 0;
        })
        .filter((x) => x !== 0);

      await ctx.db.productImage.deleteMany({
        where: { id: { in: imagesToRemove } },
      });

      const productImages = updatedProduct.images.map((image) => image.source);
      const imagesToAdd = input.images
        .map((image) => (!productImages.includes(image) ? image : ""))
        .filter((x) => x !== "")
        .map((image) => {
          return { source: image, productId: updatedProduct.id };
        });

      await ctx.db.productImage.createMany({
        data: imagesToAdd,
      });

      const updatedProductWithNewImages = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: { images: true },
      });

      return updatedProductWithNewImages;
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.product.delete({ where: { id: input.id } });
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
