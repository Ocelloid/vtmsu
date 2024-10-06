"use client";
import Head from "next/head";
import type { Donator } from "~/server/api/routers/util";
import { LoadingPage } from "~/components/Loading";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { FaCopy } from "react-icons/fa";
import { api } from "~/utils/api";

export default function Donate() {
  const [donators, setDonators] = useState<Donator[]>([]);
  const { data: TopDonateData, isLoading: isTopDonateLoading } =
    api.util.getTopDonate.useQuery();
  useEffect(() => {
    if (TopDonateData) {
      setDonators(TopDonateData);
    }
  }, [TopDonateData]);

  if (isTopDonateLoading) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Фонд Волкова</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center">
        <div className="container flex h-full flex-col pt-24">
          <h1 className="flex flex-col items-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Фонд
            <span className="text-red-600">Волкова</span>
          </h1>
          <div className="flex w-full flex-col gap-2">
            <p className="text-center font-semibold">
              Поддержите Фонд переводом
            </p>
            <Button
              size="lg"
              variant="light"
              color="warning"
              className="flex w-full flex-row items-center gap-1"
              onClick={() => navigator.clipboard.writeText("58400810")}
            >
              Адрес cчёта: 58400810 <FaCopy size={12} />
            </Button>
            {!!donators.length && (
              <div className="flex w-full flex-col gap-2">
                Топ пожертвований:
              </div>
            )}
            {donators.map((d, i) => (
              <div key={d.address} className="flex w-full flex-col">
                <p className="flex w-full flex-row justify-between gap-1">
                  <span>
                    {i + 1}. {d.name}
                  </span>
                  <span>
                    {(d.amount * 1000).toLocaleString("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </p>
                <p className="w-full text-xs">Номер счёта: {d.address}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
