import Head from "next/head";
import { Tabs, Tab, User as UserIcon, Checkbox } from "@nextui-org/react";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { type User } from "~/server/api/routers/user";

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const { data: isPersonnel, isLoading: isUserPersonnelLoading } =
    api.user.userIsPersonnel.useQuery();
  const { data: isAdmin, isLoading: isUserAdminLoading } =
    api.user.userIsAdmin.useQuery();
  const { mutate: changeRole, isPending: isRoleChanging } =
    api.user.userRoleChange.useMutation();
  const {
    data: userList,
    isLoading: isUserListLoading,
    refetch: refetchUserList,
  } = api.user.getUserList.useQuery();

  useEffect(() => {
    setUsers(userList ?? []);
  }, [userList]);

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
    isUserPersonnelLoading ||
    isUserAdminLoading ||
    isUserListLoading ||
    isRoleChanging
  )
    return <LoadingPage />;
  if (!isPersonnel) return <div className="m-auto">403</div>;

  return (
    <>
      <Head>
        <title>АХЧ</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col pt-24">
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
              className="flex flex-col gap-8"
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
                  <span>Виртуальный АХЧ</span>
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
