import { Tab, Tabs } from "@nextui-org/react";
import Head from "next/head";

import { api } from "~/utils/api";

export default function Rules() {
  // const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Правила</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-1 flex-col">
        <div className="container mt-20 flex flex-1 flex-col">
          <Tabs
            aria-label="tabs"
            variant="underlined"
            classNames={{
              base: "mд-auto",
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#dc2626]",
              tab: "first:ml-auto max-w-fit px-0 h-12",
            }}
          >
            <Tab
              key="common"
              title={
                <div className="flex items-center space-x-2">
                  <span className="font-montserrat">Общие правила</span>
                </div>
              }
            >
              <div>ОБЩИЕ ПРАВИЛА</div>
            </Tab>
            <Tab
              key="disciplines"
              title={
                <div className="flex items-center space-x-2">
                  <span className="font-montserrat">Дисциплины</span>
                </div>
              }
            >
              <div>ДИСЦИПЛИНЫ</div>
            </Tab>
            <Tab
              key="rituals"
              title={
                <div className="flex items-center space-x-2">
                  <span className="font-montserrat">Ритуалы</span>
                </div>
              }
            >
              <div>РИТУАЛЫ</div>
            </Tab>
          </Tabs>
        </div>
      </main>
    </>
  );
}
