import { FaShoppingCart } from "react-icons/fa";
import CartItem from "~/components/products/CartItem";
import { Button } from "@nextui-org/react";
import { type Product } from "~/server/api/routers/product";

interface Props {
  isOpen: boolean;
  onCartIconClick: () => void;
}

const CartDrawer = ({ isOpen, onCartIconClick }: Props) => {
  const total = 0;
  const cart: Product[] = [];

  return (
    <div className="relative">
      <div
        className={`fixed ${isOpen ? "right-80" : "right-6"} top-[6.75rem] z-50 duration-300`}
      >
        <div className="relative">
          <Button
            title="Корзина"
            className="flex min-w-10 items-center bg-red-950 px-2 text-xl text-white"
            onClick={onCartIconClick}
          >
            <FaShoppingCart />
            {!!cart?.length && (
              <div className="-ml-1 h-5 w-5 rounded-full bg-red-700 text-sm text-white">
                {cart?.length}
              </div>
            )}
          </Button>
        </div>
      </div>
      <div
        className={`fixed right-0 top-[5.4rem] z-50 h-full w-[19rem] transform bg-red-950 bg-opacity-90 text-white transition duration-700 ease-in-out md:top-24 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: `${isOpen ? "rgba(0, 0, 0, 0.4) 0px 30px 30px" : ""}`,
        }}
      >
        <aside className="h-full overflow-y-auto">
          <main className="bg-white bg-opacity-90 p-4 text-black">
            <section>
              <h3 className="mb-4 text-2xl font-bold">Корзина</h3>
              <ul>
                {cart?.map((product) => (
                  <CartItem key={product.id} product={product} />
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">Всего:</span>
                <span className="text-xl font-bold">${total.toFixed(2)}</span>
              </div>
            </section>
          </main>
        </aside>
      </div>
    </div>
  );
};

export default CartDrawer;
