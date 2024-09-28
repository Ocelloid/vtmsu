import Head from "next/head";
import { Tabs, Tab } from "@nextui-org/react";
import { LoadingPage } from "~/components/Loading";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import CharacterTraits from "~/components/admin/CharacterTraits";
import Hunting from "~/components/admin/hunting";
import Characters from "~/components/admin/Characters";
import QRCodes from "~/components/admin/QRCodes";
import OghamTransliteration from "~/components/admin/OghamTransliteration";
import Users from "~/components/admin/Users";
import Items from "~/components/admin/Items";
import ItemTypes from "~/components/admin/ItemTypes";
import Economy from "~/components/admin/Economy";
import Controls from "~/components/admin/Controls";
import Tickets from "~/components/admin/Tickets";
import ForceEffects from "~/components/admin/ForceEffects";

export default function Admin() {
  const { data: sessionData } = useSession();

  const { data: isPersonnel, isLoading: isUserPersonnelLoading } =
    api.user.userIsPersonnel.useQuery(undefined, { enabled: !!sessionData });
  const { data: isAdmin, isLoading: isUserAdminLoading } =
    api.user.userIsAdmin.useQuery(undefined, { enabled: !!sessionData });

  if (isUserPersonnelLoading || isUserAdminLoading) return <LoadingPage />;
  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!isPersonnel) return <div className="m-auto">403</div>;

  return (
    <>
      <Head>
        <title>Управление</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-[calc(100vh-3em)] flex-col pt-24">
        <div className="container flex h-full flex-col px-4">
          <Tabs
            aria-label="tabs"
            variant="underlined"
            disabledKeys={isAdmin ? [] : ["users", "chars", "char_traits"]}
            classNames={{
              tabList:
                "gap-0 grid grid-cols-4 md:grid-cols-8 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#dc2626]",
              tab: "max-w-full px-0 h-8",
              base: "bg-danger/5",
              panel: "px-0 py-0 h-full",
            }}
          >
            <Tab
              key={"users"}
              className="flex flex-col gap-8 md:gap-2"
              title={
                <div className="flex items-center space-x-2">
                  <span>Аккаунты</span>
                </div>
              }
            >
              <Users />
            </Tab>
            <Tab
              key={"chars"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Персонажи</span>
                </div>
              }
            >
              <Characters />
            </Tab>
            <Tab
              key={"char_traits"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Черты</span>
                </div>
              }
            >
              <CharacterTraits />
            </Tab>
            <Tab
              key={"economy"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Экономика</span>
                </div>
              }
            >
              <Economy />
            </Tab>
            <Tab
              key={"items"}
              title={
                <div className="flex items-center space-x-2">
                  <span>АХЧ</span>
                </div>
              }
            >
              АХЧ
            </Tab>
            <Tab
              key={"virtual_items"}
              title={
                <div className="flex items-center space-x-2">
                  <span>ВАХЧ</span>
                </div>
              }
            >
              <Tabs
                aria-label="tabs"
                variant="underlined"
                disabledKeys={isAdmin ? [] : ["users", "chars", "char_traits"]}
                classNames={{
                  tabList:
                    "gap-0 grid grid-cols-4 md:grid-cols-8 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "w-full bg-[#dc2626]",
                  tab: "max-w-full px-0 h-8",
                  base: "bg-danger/5 w-full",
                  panel: "px-0 py-0 h-full",
                }}
              >
                <Tab
                  key={"qr_codes"}
                  className="flex flex-col gap-8 md:gap-2"
                  title={
                    <div className="flex items-center space-x-2">
                      <span>QR-коды</span>
                    </div>
                  }
                >
                  <QRCodes />
                </Tab>
                <Tab
                  key={"ogham"}
                  className="flex flex-col gap-8 md:gap-2"
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Охам</span>
                    </div>
                  }
                >
                  <OghamTransliteration />
                </Tab>
                <Tab
                  key={"item_types"}
                  className="flex flex-col gap-8 md:gap-2"
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Типы предметов</span>
                    </div>
                  }
                >
                  <ItemTypes />
                </Tab>
                <Tab
                  key={"all_items"}
                  className="flex flex-col gap-8 md:gap-2"
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Все предметы</span>
                    </div>
                  }
                >
                  <Items />
                </Tab>
              </Tabs>
            </Tab>
            <Tab
              key={"hunt"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Охота</span>
                </div>
              }
            >
              <Hunting />
            </Tab>
            <Tab
              key={"tasks"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Управление</span>
                </div>
              }
            >
              <Tabs
                aria-label="tickets-tabs"
                variant="underlined"
                disabledKeys={isAdmin ? [] : ["users", "chars", "char_traits"]}
                classNames={{
                  tabList:
                    "gap-0 grid grid-cols-4 md:grid-cols-8 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "w-full bg-[#dc2626]",
                  tab: "max-w-full px-0 h-8",
                  base: "bg-danger/5 w-full",
                  panel: "px-0 py-0 h-full",
                }}
              >
                <Tab
                  key={"tickets"}
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Заявки</span>
                    </div>
                  }
                >
                  <Tickets />
                </Tab>
                <Tab
                  key={"controls"}
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Контроль</span>
                    </div>
                  }
                >
                  <Controls />
                </Tab>
                <Tab
                  key={"force_effects"}
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Эффекты</span>
                    </div>
                  }
                >
                  <ForceEffects />
                </Tab>
              </Tabs>
            </Tab>
          </Tabs>
        </div>
      </main>
    </>
  );
}
