import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaRubleSign } from "react-icons/fa6";
import { type Product } from "~/server/api/routers/shop";

const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();

  return (
    <div
      className="group mt-16 flex h-80 w-40 cursor-pointer flex-col rounded-2xl bg-red-950 md:w-60"
      onClick={() => {
        void router.replace(`/shop/${product.id}`);
      }}
    >
      <div className="relative h-[45%] rounded-2xl">
        <Image
          src={product.images[0]?.source ?? ""}
          width={256}
          height={256}
          className="absolute -top-8 left-1/2 h-auto w-44 -translate-x-1/2 -rotate-6 rounded-2xl duration-300 group-hover:rotate-0 md:w-52"
          alt="product image"
        />
      </div>
      <div className="relative h-[55%] rounded-b-2xl bg-red-100 p-1 text-red-950">
        <p className="absolute bottom-0 right-3 flex flex-row text-2xl font-semibold">
          {product.price} <FaRubleSign size={20} className="mt-[.325rem]" />
        </p>
        <div className="flex flex-col gap-1 text-center">
          <h6 className="text-xl font-bold">{product.title}</h6>
          <h4 className="text-md font-semibold">{product.subtitle}</h4>
        </div>
        <div className="max-w-3/4 m-auto mt-1">
          <p className="px-1 text-justify text-xs font-normal">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
