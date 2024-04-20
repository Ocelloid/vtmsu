import Head from "next/head";
import { useSession } from "next-auth/react";

import { api } from "~/utils/api";

export default function Settings() {
  const { data: sessionData } = useSession();
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Настройки</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">НАСТРОЙКИ</p>
          </div>
        </div>
      </main>
    </>
  );
}
