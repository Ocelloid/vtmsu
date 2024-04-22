import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Input, Switch, Divider, Button } from "@nextui-org/react";
import { FaImage, FaSun, FaMoon } from "react-icons/fa";
import Image from "next/image";
import { UploadButton } from "~/utils/uploadthing";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { data: sessionData, update: updateSession } = useSession();
  const [uploading, setUploading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [userVK, setUserVK] = useState<string>("");
  const [userTG, setUserTG] = useState<string>("");
  const [userDiscord, setUserDiscord] = useState<string>("");
  const { mutate: changePP } = api.user.changePP.useMutation();
  const { mutate: update } = api.user.update.useMutation();
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = api.user.getCurrent.useQuery();

  const validateEmail = (value: string) =>
    value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const isEmailInvalid = useMemo(() => {
    if (userEmail === "") return false;
    return validateEmail(userEmail) ? false : true;
  }, [userEmail]);

  const validatePhone = (value: string) =>
    value.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{10}$/i);

  const isPhoneInvalid = useMemo(() => {
    if (userPhone === "") return false;
    return validatePhone(userPhone) ? false : true;
  }, [userPhone]);

  useEffect(() => {
    if (!!sessionData && !!userData) {
      setUserName(sessionData.user.name ?? "");
      setUserEmail(sessionData.user.email ?? "");
      setUserPhone(userData.phone ?? "");
      setUserVK(userData.vk ?? "");
      setUserTG(userData.tg ?? "");
      setUserDiscord(userData.discord ?? "");
    }
  }, [sessionData, userData]);

  const handleClear = () => {
    if (!!sessionData && !!userData) {
      setUserName(sessionData.user.name ?? "");
      setUserEmail(sessionData.user.email ?? "");
      setUserPhone(userData.phone ?? "");
      setUserVK(userData.vk ?? "");
      setUserTG(userData.tg ?? "");
      setUserDiscord(userData.discord ?? "");
    }
  };

  const handleUpdate = () => {
    update(
      {
        name: userName,
        email: userEmail,
        phone: userPhone,
        vk: userVK,
        tg: userTG,
        discord: userDiscord,
      },
      {
        onSuccess: () => {
          void updateSession();
          void refetchUser();
        },
      },
    );
  };

  const handleChangeProfilePic = (pp: string) => {
    void changePP(
      { pp: pp },
      {
        onSuccess: () => {
          setUploading(false);
          void updateSession();
        },
      },
    );
  };

  if (isUserLoading) return <LoadingPage />;
  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!userData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Что-то пошло не так
      </div>
    );

  const isChanged =
    userName !== sessionData.user.name ||
    userEmail !== sessionData.user.email ||
    userPhone !== userData.phone ||
    userVK !== userData.vk ||
    userTG !== userData.tg ||
    userDiscord !== userData.discord;

  return (
    <>
      <Head>
        <title>Настройки</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-1 flex-col">
        <Button
          color="success"
          variant="ghost"
          isDisabled={isPhoneInvalid || isEmailInvalid || !userName}
          onClick={() => handleUpdate()}
          className={`${isChanged ? "" : "opacity-0"} container fixed inset-x-0 bottom-20 mx-auto max-w-80 transition-all duration-1000 lg:max-w-screen-lg`}
        >
          Сохранить
        </Button>
        <Button
          color="danger"
          variant="ghost"
          onClick={() => handleClear()}
          className={`${isChanged ? "" : "opacity-0"} container fixed inset-x-0 bottom-7 mx-auto max-w-80 transition-all duration-1000 lg:max-w-screen-lg`}
        >
          Отмена
        </Button>
        <div className="container mt-24 flex flex-1 flex-col gap-2 lg:max-w-screen-lg">
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
              <div className="flex flex-col items-center justify-center">
                <div className="my-auto flex flex-row">
                  {uploading ? (
                    <LoadingSpinner width={64} height={64} />
                  ) : (
                    <Image
                      alt="pp"
                      src={sessionData.user.image ?? ""}
                      width={256}
                      height={256}
                    />
                  )}
                </div>
                <UploadButton
                  content={{
                    button: (
                      <>
                        <FaImage size={16} />
                        <p className="text-xs">Сменить</p>
                      </>
                    ),
                    allowedContent: "Изображение (1 Мб)",
                  }}
                  className="h-8 w-full max-w-[160px] cursor-pointer pt-2 dark:text-white [&>div]:hidden [&>div]:text-sm [&>label>svg]:mr-1 [&>label]:w-full [&>label]:min-w-[84px] [&>label]:flex-1 [&>label]:rounded-medium [&>label]:border-2 [&>label]:bg-transparent [&>label]:focus-within:ring-0 [&>label]:hover:bg-white/25 [&>label]:dark:border-white"
                  endpoint="imageUploader"
                  onUploadBegin={() => setUploading(true)}
                  onClientUploadComplete={(res) =>
                    handleChangeProfilePic(res[0]?.url ?? "")
                  }
                />
              </div>
              <div className="flex flex-1 flex-grow flex-col sm:col-span-2">
                <Input
                  variant="underlined"
                  label="Имя игрока"
                  placeholder="Введите имя"
                  isInvalid={!userName}
                  color={!userName ? "danger" : "success"}
                  value={userName}
                  onValueChange={setUserName}
                />
                <Input
                  type="email"
                  variant="underlined"
                  label="Электронная почта"
                  placeholder="Введите электронную почту"
                  isInvalid={isEmailInvalid}
                  color={isEmailInvalid ? "danger" : "success"}
                  value={userEmail}
                  onValueChange={setUserEmail}
                />
                <Input
                  type="phone"
                  variant="underlined"
                  label="Телефон"
                  placeholder="Введите телефон"
                  isInvalid={isPhoneInvalid}
                  color={isPhoneInvalid ? "danger" : "success"}
                  value={userPhone}
                  onValueChange={setUserPhone}
                />
              </div>
              <div className="col-span-2 flex flex-1 flex-grow flex-col">
                <Input
                  variant="underlined"
                  label="ВКонтакте"
                  placeholder="Введите страницу ВКонтакте"
                  value={userVK}
                  onValueChange={setUserVK}
                />
                <Input
                  variant="underlined"
                  label="Telegram"
                  placeholder="Введите ник в Telegram"
                  value={userTG}
                  onValueChange={setUserTG}
                />
                <Input
                  type="phone"
                  variant="underlined"
                  label="Discord"
                  placeholder="Введите хэндл в Discord"
                  value={userDiscord}
                  onValueChange={setUserDiscord}
                />
              </div>
            </div>
          </div>
          <Divider className="my-2 bg-warning/50" />
          <Switch
            isSelected={theme === "light"}
            onValueChange={(value) => {
              setTheme(value ? "light" : "dark");
            }}
            size="md"
            color="success"
            startContent={<FaSun />}
            endContent={<FaMoon />}
          >
            {theme === "light" ? "Светлая тема" : "Тёмная тема"}
          </Switch>
        </div>
      </main>
    </>
  );
}
