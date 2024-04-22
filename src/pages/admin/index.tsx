import Head from "next/head";
import {
  Tabs,
  Tab,
  User as UserIcon,
  Checkbox,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { LoadingPage } from "~/components/Loading";
import EditCharacterTrait from "~/components/modals/editCharacterTrait";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import type { User } from "~/server/api/routers/user";
import type {
  Faction,
  Clan,
  Ability,
  Feature,
} from "~/server/api/routers/char";
import { FaPencilAlt, FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { disciplines, factions, clans } from "~/assets";
import { useTheme } from "next-themes";

type characterTraitsType = {
  label: string;
  type: string;
  list: Faction[] | Clan[] | Ability[] | Feature[];
}[];

export default function Admin() {
  const { theme } = useTheme();
  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });
  const clanKeys = Object.keys(clans);
  const clanSelection = Object.values(clans).map((clan, i) => {
    if (theme === "light" && !clanKeys[i]?.includes("_white"))
      return { key: clanKeys[i] ?? "", value: clan };
    if (theme === "dark" && clanKeys[i]?.includes("_white"))
      return { key: clanKeys[i] ?? "", value: clan };
    else return undefined;
  });
  const factionKeys = Object.keys(factions);
  const factionSelection = Object.values(factions).map((faction, i) => {
    if (theme === "light" && !factionKeys[i]?.includes("_white"))
      return { key: factionKeys[i] ?? "", value: faction };
    if (theme === "dark" && factionKeys[i]?.includes("_white"))
      return { key: factionKeys[i] ?? "", value: faction };
    else return undefined;
  });
  const icons = [...discIcons, ...clanSelection, ...factionSelection].filter(
    (i) => !!i,
  );
  const defaultIcon = theme === "light" ? factions._ankh : factions._ankh_white;
  const { data: sessionData } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [characterTraits, setCharacterTraits] = useState<characterTraitsType>([
    { label: "Фракции", type: "Faction", list: [] },
    { label: "Кланы", type: "Clan", list: [] },
    { label: "Способности", type: "Ability", list: [] },
    { label: "Дополнения", type: "Feature", list: [] },
  ]);

  const { data: isPersonnel, isLoading: isUserPersonnelLoading } =
    api.user.userIsPersonnel.useQuery(undefined, { enabled: !!sessionData });
  const { data: isAdmin, isLoading: isUserAdminLoading } =
    api.user.userIsAdmin.useQuery(undefined, { enabled: !!sessionData });
  const { mutate: changeRole, isPending: isRoleChanging } =
    api.user.userRoleChange.useMutation();
  const {
    data: userList,
    isLoading: isUserListLoading,
    refetch: refetchUserList,
  } = api.user.getUserList.useQuery(undefined, { enabled: !!sessionData });
  const {
    data: charTraitsData,
    isLoading: isCharTraitsLoading,
    refetch: refetchTraits,
  } = api.char.getCharTraits.useQuery(undefined, { enabled: !!sessionData });

  useEffect(() => {
    setUsers(userList ?? []);
    setCharacterTraits([
      {
        label: "Фракции",
        type: "Faction",
        list:
          charTraitsData?.factions.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
      },
      {
        label: "Кланы",
        type: "Clan",
        list:
          charTraitsData?.clans.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
      },
      {
        label: "Способности",
        type: "Ability",
        list:
          charTraitsData?.abilities.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
      },
      {
        label: "Дополнения",
        type: "Feature",
        list: charTraitsData?.features.sort((a, b) => a.cost - b.cost) ?? [],
      },
    ]);
  }, [userList, charTraitsData]);

  const handleUserRoleChange = (e: boolean, id: string, role: string) => {
    if (role === "admin" && !e && users.filter((x) => x.isAdmin).length < 2)
      alert("В проекте должен оставаться хотя бы один администратор.");
    else
      changeRole(
        { id: id, role: role, change: e },
        {
          onSuccess: () => {
            void refetchUserList();
          },
        },
      );
    return;
  };

  if (
    isCharTraitsLoading ||
    isUserPersonnelLoading ||
    isUserAdminLoading ||
    isUserListLoading ||
    isRoleChanging
  )
    return <LoadingPage />;
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
      <main className=" flex min-h-screen flex-col pt-20">
        <div className="container flex flex-col px-4">
          <Tabs
            aria-label="tabs"
            variant="underlined"
            disabledKeys={isAdmin ? [] : ["1"]}
            classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#dc2626]",
              tab: "first:ml-auto max-w-fit px-0 h-12 last:mr-auto md:last:mr-0",
            }}
          >
            <Tab
              key={"users"}
              className="flex flex-col gap-8 md:gap-2"
              title={
                <div className="flex items-center space-x-2">
                  <span>Пользователи</span>
                </div>
              }
            >
              {users.map((user) => (
                <div key={user.id} className="flex flex-col gap-4 md:flex-row">
                  <UserIcon
                    name={user.name}
                    className="mr-auto"
                    description={user.email}
                    avatarProps={{
                      src: user.image ?? "",
                    }}
                  />
                  <div className="flex flex-row gap-4">
                    <Checkbox
                      color="warning"
                      isSelected={user.isPersonnel}
                      onValueChange={(e) =>
                        handleUserRoleChange(e, user.id, "personnel")
                      }
                    >
                      Персонал
                    </Checkbox>
                    <Checkbox
                      color="success"
                      isDisabled={!user.isPersonnel}
                      isSelected={user.isAdmin}
                      onValueChange={(e) =>
                        handleUserRoleChange(e, user.id, "admin")
                      }
                    >
                      Администратор
                    </Checkbox>
                  </div>
                </div>
              ))}
            </Tab>
            <Tab
              key={"chars"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Персонажи</span>
                </div>
              }
            >
              Персонажи
            </Tab>
            <Tab
              key={"char_traits"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Черты</span>
                </div>
              }
            >
              <Accordion isCompact>
                {characterTraits.map((cs, i) => (
                  <AccordionItem key={i} aria-label={cs.label} title={cs.label}>
                    <div className="flex flex-col gap-4 pb-4">
                      <EditCharacterTrait
                        traitType={cs.type}
                        onClose={refetchTraits}
                        className="w-full"
                      >
                        <FaPlusCircle size={12} />
                        Добавить
                      </EditCharacterTrait>
                      {cs.list.map((trait) => (
                        <div key={trait.id} className="flex flex-col">
                          <div className="flex flex-row">
                            {cs.type !== "Feature" && (
                              <Image
                                alt="icon"
                                className="mr-2 max-h-12 max-w-12 object-contain"
                                src={
                                  !!(trait as Ability).icon
                                    ? icons.find(
                                        (di) =>
                                          di!.key === (trait as Ability).icon,
                                      )?.value ?? ""
                                    : defaultIcon
                                }
                                height={128}
                                width={128}
                              />
                            )}
                            <div className="mr-auto flex flex-col">
                              <p className="text-2xl">{trait.name}</p>
                              <p className="text-sm italic">
                                {cs.type === "Clan" &&
                                  `${(trait as Clan).ClanInFaction!.map((f) => f.faction?.name).join(", ")}`}
                                {cs.type === "Feature" &&
                                  `${(trait as Feature).cost} `}
                                {cs.type === "Feature" &&
                                  `${(trait as Feature).FeatureAvailable?.map((a) => a.clan?.name).join(", ")}`}
                                {cs.type === "Ability" &&
                                  `${(trait as Ability).AbilityAvailable?.map((a) => a.clan?.name).join(", ")}`}
                                {cs.type === "Ability" &&
                                  `${(trait as Ability).expertise ? " - Экспертная" : ""}`}
                              </p>
                            </div>
                            {trait.visibleToPlayer ? (
                              <FaEye size={24} className="mr-2" />
                            ) : (
                              <FaEyeSlash size={24} className="mr-2" />
                            )}
                            <EditCharacterTrait
                              trait={trait}
                              traitType={cs.type}
                              onClose={refetchTraits}
                              className="-mt-2 h-10 w-10 min-w-10 rounded-full p-0"
                            >
                              <FaPencilAlt size={16} />
                            </EditCharacterTrait>
                          </div>
                          <p className="whitespace-break-spaces text-sm">
                            {trait.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
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
              Виртуальный АХЧ
            </Tab>
            <Tab
              key={"tasks"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Заявки</span>
                </div>
              }
            >
              Заявки
            </Tab>
          </Tabs>
        </div>
      </main>
    </>
  );
}
