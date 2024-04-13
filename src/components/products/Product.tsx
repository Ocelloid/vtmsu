import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";
import type { Product, ProductImage } from "~/server/api/routers/shop";
import { useCartStore } from "../../stores/useCartStore";
import { FaRubleSign } from "react-icons/fa";
import { api } from "~/utils/api";

const Product = () => {
  const addToCart = useCartStore((state) => state.addToCart);

  const router = useRouter();
  const [activeImg, setActiveImage] = useState("");
  const [amount, setAmount] = useState(1);

  const [product, setProduct] = useState<Product>();
  const productId = router.asPath.split("/").splice(-1)[0] ?? 1;
  const { data, isLoading } = api.shop.getProductById.useQuery(
    {
      id: Number(productId),
    },
    {
      enabled: !!productId,
    },
  );

  useEffect(() => {
    const images: ProductImage[] = [
      { id: 1, source: "/tmp/0.jpg", productId: Number(productId) },
      { id: 2, source: "/tmp/1.jpg", productId: Number(productId) },
      { id: 3, source: "/tmp/2.jpg", productId: Number(productId) },
      { id: 4, source: "/tmp/3.jpg", productId: Number(productId) },
    ];
    const sampleProduct: Product = {
      id: Number(productId),
      title: "Кроссовки",
      subtitle: "Просто кроссовки",
      description: "Эти кроссовки такие кроссовки офигеть просто",
      size: null,
      color: null,
      stock: 10,
      price: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: images,
    };
    setProduct(data ?? sampleProduct);
    setActiveImage(
      data?.images[0]?.source ?? sampleProduct.images[0]?.source ?? "",
    );
  }, [data, productId]);

  if (isLoading) return <LoadingPage />;
  if (!product) return <div>Что-то пошло не так</div>;

  return (
    <div className="flex flex-col justify-between gap-16 md:flex-row md:items-center">
      <div className="flex flex-col gap-6 md:w-1/2">
        <Image
          alt=""
          width={1024}
          height={1024}
          src={activeImg}
          className="aspect-square h-full w-full rounded-xl object-cover"
        />
        <div className="flex h-24 flex-row justify-between gap-4">
          {product.images.map((image, index) => (
            <Image
              alt=""
              width={128}
              height={128}
              key={index}
              src={image.source}
              className="h-20 w-20 cursor-pointer rounded-md"
              onClick={() => setActiveImage(image.source)}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 md:w-2/4">
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <span className=" font-semibold text-red-600">
            {product.subtitle}
          </span>
        </div>
        <p className="text-red-200">{product.description}</p>
        <h6 className="flex flex-row text-2xl font-semibold">
          {product.price} <FaRubleSign size={20} className="mt-[.3rem]" />
        </h6>
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
          <Button
            onClick={() => addToCart({ ...product, quantity: amount })}
            className="h-full rounded-xl border-1 border-red-800 bg-transparent px-16 py-3 text-2xl font-semibold text-white"
          >
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Product;
