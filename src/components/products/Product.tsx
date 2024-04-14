import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";
import type { Product } from "~/server/api/routers/shop";
import { useCartStore } from "../../stores/useCartStore";
import { FaRubleSign } from "react-icons/fa";
import { api } from "~/utils/api";
import EditProduct from "~/components/modals/editProuct";
import { useSession } from "next-auth/react";

const Product = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [activeImg, setActiveImage] = useState("");
  const [amount, setAmount] = useState(1);

  const [product, setProduct] = useState<Product>();
  const productId = router.asPath.split("/").splice(-1)[0] ?? 1;
  const {
    data,
    isLoading,
    refetch: refetchProduct,
  } = api.shop.getProductById.useQuery(
    {
      id: Number(productId),
    },
    {
      enabled: !!productId,
    },
  );

  const { data: isAdmin, isLoading: isUserLoading } =
    api.user.userIsAdmin.useQuery(
      { id: sessionData?.user.id ?? "" },
      {
        enabled: !!sessionData,
      },
    );

  useEffect(() => {
    setProduct(data!);
    setActiveImage(data?.images[0]?.source ?? "");
  }, [data, productId]);

  if (isLoading || isUserLoading) return <LoadingPage />;
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
        <div className="flex h-24 flex-row justify-between gap-1 md:gap-4">
          {product.images.map((image, index) => (
            <Image
              alt=""
              width={128}
              height={128}
              key={index}
              src={image.source}
              className="aspect-square h-20 w-20 cursor-pointer rounded-md object-cover"
              onClick={() => setActiveImage(image.source)}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 md:w-2/4">
        <div>
          <h1 className="text-3xl font-bold text-red-100">{product.title}</h1>
          <span className=" font-semibold text-red-600">
            {product.subtitle}
          </span>
        </div>
        <p className="text-red-100">{product.description}</p>
        <h6 className="flex flex-row text-2xl font-semibold text-red-100">
          {product.price} <FaRubleSign size={20} className="mt-[.3rem]" />
        </h6>
        <div className="flex flex-row items-center gap-2 md:gap-12">
          <div className="flex flex-row items-center">
            <button
              className="rounded-lg bg-red-100 px-5 py-2 text-3xl text-red-950"
              onClick={() => setAmount((prev) => (prev > 1 ? prev - 1 : 1))}
            >
              -
            </button>
            <span className="min-w-20 rounded-lg px-6 py-4 text-center">
              {amount}
            </span>
            <button
              className="rounded-lg bg-red-100 px-4 py-2 text-3xl text-red-950"
              onClick={() => setAmount((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          <Button
            onClick={() => addToCart({ ...product, quantity: amount })}
            className="h-full rounded-lg border-1 border-red-800 bg-transparent px-16 py-3 text-2xl font-semibold text-red-100"
          >
            Добавить
          </Button>
        </div>
        {!!isAdmin && (
          <EditProduct product={product} onClose={() => refetchProduct()} />
        )}
      </div>
    </div>
  );
};

export default Product;
