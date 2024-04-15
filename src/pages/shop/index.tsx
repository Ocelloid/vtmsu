import Head from "next/head";
import { useState } from "react";
import ProductCard from "~/components/products/ProductCard";
import CartDrawer from "~/components/products/CartDrawer";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import AddProduct from "~/components/modals/addProduct";
import { useSession } from "next-auth/react";

export default function Shop() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: sessionData } = useSession();

  const { data: isAdmin, isLoading: isUserLoading } =
    api.user.userIsAdmin.useQuery(
      { id: sessionData?.user.id ?? "" },
      {
        enabled: !!sessionData,
      },
    );

  const handleCartIconClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const {
    data: products,
    isLoading,
    refetch,
  } = api.shop.getAllProducts.useQuery();
  if (isLoading || isUserLoading) return <LoadingPage />;
  if (!products) return <div>Что-то пошло не так</div>;

  return (
    <>
      <Head>
        <title>Магазин</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CartDrawer isOpen={isDrawerOpen} onCartIconClick={handleCartIconClick} />
      <main className="flex min-h-screen flex-1 flex-col py-24">
        <div className="container grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-12 lg:grid-cols-4">
          {!!isAdmin && <AddProduct onClose={refetch} />}
          {!!products.length &&
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </main>
    </>
  );
}
