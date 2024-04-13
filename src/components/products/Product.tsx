import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import img0 from "~/../public/tmp/0.jpg";
import img1 from "~/../public/tmp/1.jpg";
import img2 from "~/../public/tmp/2.jpg";
import img3 from "~/../public/tmp/3.jpg";

const Product = () => {
  const [images] = useState({
    img0: img0,
    img1: img1,
    img2: img2,
    img3: img3,
  });

  const [activeImg, setActiveImage] = useState(images.img0);

  const [amount, setAmount] = useState(1);

  return (
    <div className="flex flex-col justify-between gap-16 md:flex-row md:items-center">
      <div className="flex flex-col gap-6 md:w-1/2">
        <Image
          src={activeImg}
          alt=""
          className="aspect-square h-full w-full rounded-xl object-cover"
        />
        <div className="flex h-24 flex-row justify-between gap-4">
          <Image
            src={images.img0}
            alt=""
            className="h-20 w-20 cursor-pointer rounded-md"
            onClick={() => setActiveImage(images.img0)}
          />
          <Image
            src={images.img1}
            alt=""
            className="h-20 w-20 cursor-pointer rounded-md"
            onClick={() => setActiveImage(images.img1)}
          />
          <Image
            src={images.img2}
            alt=""
            className="h-20 w-20 cursor-pointer rounded-md"
            onClick={() => setActiveImage(images.img2)}
          />
          <Image
            src={images.img3}
            alt=""
            className="h-20 w-20 cursor-pointer rounded-md"
            onClick={() => setActiveImage(images.img3)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 md:w-2/4">
        <div>
          <span className=" font-semibold text-red-600">Special Sneaker</span>
          <h1 className="text-3xl font-bold">Nike Invincible 3</h1>
        </div>
        <p className="text-red-200">
          Con un&apos;ammortizzazione incredibile per sostenerti in tutti i tuoi
          chilometri, Invincible 3 offre un livello di comfort elevatissimo
          sotto il piede per aiutarti a dare il massimo oggi, domani e oltre.
          Questo modello incredibilmente elastico e sostenitivo, è pensato per
          dare il massimo lungo il tuo percorso preferito e fare ritorno a casa
          carico di energia, in attesa della prossima corsa.
        </p>
        <h6 className="text-2xl font-semibold">$ 199.00</h6>
        <div className="flex flex-row items-center gap-12">
          <div className="flex flex-row items-center">
            <button
              className="rounded-lg bg-gray-200 px-5 py-2 text-3xl text-red-800"
              onClick={() => setAmount((prev) => (prev > 1 ? prev - 1 : 1))}
            >
              -
            </button>
            <span className="min-w-20 rounded-lg px-6 py-4 text-center">
              {amount}
            </span>
            <button
              className="rounded-lg bg-gray-200 px-4 py-2 text-3xl text-red-800"
              onClick={() => setAmount((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          <Button className="border-1 h-full rounded-xl border-red-800 bg-transparent px-16 py-3 text-2xl font-semibold text-white">
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Product;
