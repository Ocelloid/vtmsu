import { FaTrashAlt } from "react-icons/fa";

import { type Product } from "~/server/api/routers/product";
import Image from "next/image";

interface Props {
  product: Product;
}

export default function CartItem({ product }: Props) {
  return (
    <li className="mb-2 flex items-center justify-between  gap-4 p-4 shadow-md">
      <div className="flex items-center">
        <Image
          src={product.thumbnail ?? ""}
          alt={product.title}
          width={100}
          height={100}
          className="mr-4 h-10 w-10 rounded-full"
        />
        <div className="flex flex-col">
          <span className="flex-1 font-bold">{product.title}</span>
          <span className="font-bold text-gray-600">${product.price}</span>
          <span>Количество: {product.quantity}</span>
        </div>
      </div>
      <div>
        <button
          title="Remove Item"
          className="ml-4 text-red-500 hover:text-red-600"
          onClick={() => void {}}
        >
          <FaTrashAlt size={18} />
        </button>
      </div>
    </li>
  );
}
