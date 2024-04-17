import Head from "next/head";
import { useState } from "react";
import DefaultCard from "~/components/DefaultCard";
import CartDrawer from "~/components/products/CartDrawer";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import AddProduct from "~/components/modals/addProduct";

export default function Shop() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: isAdmin, isLoading: isUserLoading } =
    api.user.userIsAdmin.useQuery();

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
      <main className="flex min-h-screen flex-1 flex-col pt-20">
        <div className="container grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {!!isAdmin && <AddProduct onClose={refetch} />}
          {!!products.length &&
            products.map((product) => (
              <DefaultCard
                key={product.id}
                to={`/shop/${product.id}`}
                image={product.images[0]?.source ?? ""}
                price={product.price}
                title={product.title}
                subtitle={product.subtitle!}
                description={product.description!}
              />
            ))}
        </div>
      </main>
    </>
  );
}
