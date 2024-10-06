import Head from "next/head";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import CharacterCard from "~/components/CharacterCard";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

const UserPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const { data: sessionData } = useSession();
  const { data: isAdmin, isLoading: isUserAdminLoading } =
    api.user.userIsAdmin.useQuery(undefined, { enabled: !!sessionData });
  const { data: userData, isLoading: isUserLoading } =
    api.user.getUserById.useQuery(
      { id: userId },
      { enabled: !!sessionData && !!userId },
    );

  useEffect(() => {
    if (router.query.pid) setUserId(router.query.pid.toString());
  }, [router.query.pid]);

  if (isUserAdminLoading || isUserLoading) return <LoadingPage />;
  if (!sessionData)
    return (
      <div className="flex h-[100svh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!isAdmin) return <div className="m-auto">403</div>;
  return (
    <>
      <Head>
        <title>Аккаунт</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-[calc(100svh-1.5rem)] flex-col pt-24">
        <div className="container flex flex-col gap-2 px-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <Image
                alt="user_img"
                src={userData?.image ?? ""}
                height="400"
                width="400"
              />
            </div>
            <div className="grid grid-cols-4 pb-2 sm:col-span-3 sm:grid-cols-6">
              <span>Имя:</span>
              <span className="col-span-3 sm:col-span-5">{userData?.name}</span>
              <span>Телефон:</span>
              <span className="col-span-3 sm:col-span-5">
                {userData?.phone}
              </span>
              <span>Email:</span>
              <span className="col-span-3 sm:col-span-5">
                {userData?.email}
              </span>
              <span>Telegram:</span>
              <span className="col-span-3 sm:col-span-5">{userData?.tg}</span>
              <span>VKontakte:</span>
              <span className="col-span-3 sm:col-span-5">{userData?.vk}</span>
              <span>Discord:</span>
              <span className="col-span-3 sm:col-span-5">
                {userData?.discord}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {userData?.characters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default UserPage;
