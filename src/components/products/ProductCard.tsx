import React from "react";
import Image from "next/image";
import shoe from "~/../public/tmp/0.jpg";
import { useRouter } from "next/router";

type ProductCardProps = {
  id: string;
};

const ProductCard = ({ id }: ProductCardProps) => {
  const router = useRouter();

  return (
    <div
      className="product_card group mt-16 flex h-80 w-60 cursor-pointer flex-col rounded-2xl bg-red-950"
      onClick={() => {
        void router.replace(`/store/${id}`);
      }}
    >
      <div className="top_card relative h-[45%] rounded-2xl">
        <Image
          src={shoe}
          className="product_image absolute -top-14 left-1/2 h-auto w-52 -translate-x-1/2 -rotate-6 rounded-2xl duration-300 group-hover:rotate-0"
          alt="product image"
        />
      </div>
      <div className="bottom_card relative h-[55%] rounded-b-2xl bg-red-100 text-red-950">
        <span className="product_price absolute bottom-0 right-3 text-2xl font-extrabold italic">
          $ 455
        </span>
        <div className="product_name flex flex-col gap-1 text-center">
          <h6 className="text-xl font-bold">Nike</h6>
          <h4 className="text-md font-semibold">Air Jordan 1 Retro</h4>
        </div>
        <div className="product_description max-w-3/4 m-auto mt-1">
          <p className="text-center text-xs font-normal">
            The extremely popular Air Jordan 1 shoes are the best-selling Air
            Jordans in the history of the brand, not to mention the success that
            the versions dedicated to Michael Jordan&apos;s career have had.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
