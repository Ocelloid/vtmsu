import Head from "next/head";
import { useState } from "react";
import { LoadingPage } from "~/components/Loading";
import Product from "~/components/products/Product";
import CartDrawer from "~/components/products/CartDrawer";

import { api } from "~/utils/api";

export default function ProductPage() {
  const { data, isLoading } = api.post.getAll.useQuery();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCartIconClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  if (isLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

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
          <Product />
        </div>
      </main>
    </>
  );
}
