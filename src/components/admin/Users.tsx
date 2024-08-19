/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Input, User as UserIcon, Checkbox, Link } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import type { User } from "~/server/api/routers/user";

export default function Users() {
  const { data: sessionData } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tg, setTg] = useState("");
  const [vk, setVk] = useState("");
  const [discord, setDiscord] = useState("");
  const [phone, setPhone] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const {
    data: userList,
    isLoading: isUserListLoading,
    refetch: refetchUserList,
  } = api.user.getUserList.useQuery(undefined, { enabled: !!sessionData });
  const { mutate: changeRole, isPending: isRoleChanging } =
    api.user.userRoleChange.useMutation();

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

  if (isUserListLoading || isRoleChanging) return <LoadingPage />;

  return (
    <>
      <div className="flex flex-col justify-start gap-2 pt-2 sm:flex-row">
        <p className="hidden justify-end py-1 sm:flex">Поиск:</p>
        <Input
          size="sm"
          variant="bordered"
          className="col-span-4 sm:col-span-2"
          aria-label="Имя"
          placeholder="Имя"
          value={name}
          onValueChange={setName}
        />
        <Input
          size="sm"
          variant="bordered"
          className="col-span-4  sm:col-span-2"
          aria-label="Почта"
          placeholder="Почта"
          value={email}
          onValueChange={setEmail}
        />
        <Input
          size="sm"
          variant="bordered"
          className="col-span-4  sm:col-span-2"
          aria-label="phone"
          placeholder="Телефон"
          value={phone}
          onValueChange={setPhone}
        />
      </div>
      <div className="flex flex-col justify-start gap-2 pb-2 sm:flex-row">
        <Input
          size="sm"
          variant="bordered"
          className="col-span-4  sm:col-span-2"
          aria-label="Tg"
          placeholder="Tg"
          value={tg}
          onValueChange={setTg}
        />
        <Input
          size="sm"
          variant="bordered"
          className="col-span-4  sm:col-span-2"
          aria-label="ВК"
          placeholder="ВК"
          value={vk}
          onValueChange={setVk}
        />
        <Input
          size="sm"
          variant="bordered"
          className="col-span-4 sm:col-span-2"
          aria-label="Discord"
          placeholder="Discord"
          value={discord}
          onValueChange={setDiscord}
        />
      </div>
      <div className="flex flex-col gap-2 py-2">
        {users
          .filter(
            (u) =>
              u.name?.toLowerCase().includes(name.toLowerCase()) ||
              (!!email &&
                u.email?.toLowerCase().includes(email.toLowerCase())) ||
              (!!tg && u.tg?.toLowerCase().includes(tg.toLowerCase())) ||
              (!!vk && u.vk?.toLowerCase().includes(vk.toLowerCase())) ||
              (!!discord &&
                u.discord?.toLowerCase().includes(discord.toLowerCase())) ||
              (!!phone && u.phone?.toLowerCase().includes(phone.toLowerCase())),
          )
          .map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-4 rounded-lg bg-white/75 p-2 dark:bg-red-950/50 md:flex-row"
            >
              <div className="flex flex-col md:mr-auto">
                <UserIcon
                  name={
                    <Link
                      className="text-default-600"
                      href={`/admin/${user.id}`}
                    >
                      {user.name}
                    </Link>
                  }
                  className="mr-auto"
                  classNames={{ description: "text-foreground-600" }}
                  description={
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      <span>
                        Персонажей:&nbsp;
                        {!!user.characters ? user.characters.length : 0}
                      </span>
                    </div>
                  }
                  avatarProps={{
                    src: user.image ?? "",
                  }}
                />
              </div>
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
      </div>
    </>
  );
}
