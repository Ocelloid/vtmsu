import Head from "next/head";
import { useState } from "react";
import Product from "~/components/products/Product";
import CartDrawer from "~/components/products/CartDrawer";

export default function ProductPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCartIconClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <Head>
        <title>Товар</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CartDrawer isOpen={isDrawerOpen} onCartIconClick={handleCartIconClick} />
      <main className="flex min-h-screen flex-1 flex-col py-24">
        <div className="container flex flex-col gap-12">
          <p className="mx-auto px-4">
            Раздел находится в разработке - товары ненастоящие, это только
            пример того, как они могут выглядеть.
          </p>
          <Product />
        </div>
      </main>
    </>
  );
}
