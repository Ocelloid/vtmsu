import { type Product } from "~/server/api/routers/shop";
import { useCartStore } from "~/stores/useCartStore";
import { FaTrashAlt, FaRubleSign } from "react-icons/fa";
import Image from "next/image";

export default function CartItem({ product }: { product: Product }) {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateProduct = useCartStore((state) => state.updateProduct);

  return (
    <li className="mb-2 flex items-center justify-between gap-4 p-4 shadow-md">
      <div className="flex w-[200px] max-w-[200px] items-center">
        <Image
          src={product.images[0]?.source ?? ""}
          alt={product.title}
          width={128}
          height={128}
          className="mr-4 aspect-square h-16 w-16 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="flex-1 font-bold">{product.title}</span>
          <span className="flex flex-row font-bold text-gray-600">
            {product.price} <FaRubleSign size={14} className="mt-[.3rem]" />
          </span>
          <div className="flex select-none whitespace-nowrap">
            <span
              className={`${product.quantity === 1 ? "opacity-25" : "cursor-pointer"}`}
              onClick={() =>
                updateProduct({
                  ...product,
                  quantity: product.quantity! > 1 ? product.quantity! - 1 : 1,
                })
              }
            >
              &larr;
            </span>
            &nbsp;
            <span className="min-w-28 text-center">
              В корзине: {product.quantity}
            </span>
            &nbsp;
            <span
              className="cursor-pointer"
              onClick={() =>
                updateProduct({
                  ...product,
                  quantity: product.quantity! + 1,
                })
              }
            >
              &rarr;
            </span>
          </div>
        </div>
      </div>
      <div>
        <button
          title="Remove Item"
          className="text-red-500 hover:text-red-600"
          onClick={() => removeFromCart(product)}
        >
          <FaTrashAlt size={18} />
        </button>
      </div>
    </li>
  );
}
