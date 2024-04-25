import Head from "next/head";
import { Tabs, Tab, User as UserIcon, Checkbox } from "@nextui-org/react";
import { LoadingPage } from "~/components/Loading";
import type { User } from "~/server/api/routers/user";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import CharacterTraits from "~/components/admin/CharacterTraits";
import Characters from "~/components/admin/Characters";

export default function Admin() {
  const { data: sessionData } = useSession();
  const [users, setUsers] = useState<User[]>([]);

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

  useEffect(() => {
    setUsers(userList ?? []);
  }, [userList]);

  if (
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
            disabledKeys={isAdmin ? [] : ["users", "chars", "char_traits"]}
            classNames={{
              tabList:
                "grid grid-cols-4 md:grid-cols-8 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#dc2626]",
              tab: "max-w-агдд px-0 h-12",
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
              Экономика
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
              key={"hunt"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Охота</span>
                </div>
              }
            >
              Охота
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
