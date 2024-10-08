import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Input,
  Switch,
  Divider,
  Button,
  RadioGroup,
  Radio,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { FaImage, FaSun, FaMoon } from "react-icons/fa";
import Image from "next/image";
import { UploadButton } from "~/utils/uploadthing";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useTheme } from "next-themes";
import { clans, factions, other } from "~/assets";
import { signOut } from "next-auth/react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { data: sessionData, update: updateSession } = useSession();
  const [uploading, setUploading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [bgSelected, setBgSelected] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [userVK, setUserVK] = useState<string>("");
  const [userTG, setUserTG] = useState<string>("");
  const [userDiscord, setUserDiscord] = useState<string>("");
  const [bgLoading, setBgLoading] = useState<boolean>(false);
  const { mutate: deleteUser } = api.user.delete.useMutation();
  const { mutate: changePP } = api.user.changePP.useMutation();
  const { mutate: updateBG } = api.user.updateBG.useMutation();
  const { mutate: update } = api.user.update.useMutation();

  const clanKeys = Object.keys(clans);
  const factionKeys = Object.keys(factions);

  const clanSelection = Object.values(clans).map((clan, i) => {
    if (theme === "light" && !clanKeys[i]?.includes("_white"))
      return { value: clanKeys[i] ?? "", image: clan };
    if (theme === "dark" && clanKeys[i]?.includes("_white"))
      return { value: clanKeys[i]?.replace("_white", "") ?? "", image: clan };
    else return undefined;
  });

  const factionSelection = Object.values(factions).map((faction, i) => {
    if (theme === "light" && !factionKeys[i]?.includes("_white"))
      return { value: factionKeys[i] ?? "", image: faction };
    if (theme === "dark" && factionKeys[i]?.includes("_white"))
      return {
        value: factionKeys[i]?.replace("_white", "") ?? "",
        image: faction,
      };
    else return undefined;
  });

  const bgSelection = [...factionSelection, ...clanSelection].filter(
    (x) => x !== undefined,
  );

  const defaultImage = theme === "dark" ? factions._ankh_white : factions._ankh;

  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = api.user.getCurrent.useQuery(undefined, { enabled: !!sessionData });

  const validateEmail = (value: string) =>
    value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const isEmailInvalid = useMemo(() => {
    if (userEmail === "") return true;
    return validateEmail(userEmail) ? false : true;
  }, [userEmail]);

  const validatePhone = (value: string) =>
    value.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{10}$/i);

  const isPhoneInvalid = useMemo(() => {
    if (userPhone === "") return true;
    return validatePhone(userPhone) ? false : true;
  }, [userPhone]);

  useEffect(() => {
    if (!!sessionData && !!userData) {
      const bg = userData.background;
      setUserName(sessionData.user.name ?? "");
      setUserEmail(sessionData.user.email ?? "");
      setUserPhone(userData.phone ?? "");
      setUserVK(userData.vk ?? "");
      setUserTG(userData.tg ?? "");
      setUserDiscord(userData.discord ?? "");
      setBgSelected(bg ?? "");
    }
  }, [sessionData, userData, theme]);

  const handleClear = () => {
    if (!!sessionData && !!userData) {
      const bg = userData.background!;
      setUserName(sessionData.user.name ?? "");
      setUserEmail(sessionData.user.email ?? "");
      setUserPhone(userData.phone ?? "");
      setUserVK(userData.vk ?? "");
      setUserTG(userData.tg ?? "");
      setUserDiscord(userData.discord ?? "");
      setBgSelected(bg);
    }
  };

  const handleUpdateBG = (bgs: string) => {
    setBgLoading(true);
    updateBG(
      {
        bg: bgs.includes("_white") ? bgs.replace("_white", "") : bgs,
      },
      {
        onSuccess: () => {
          setBgSelected(bgs);
          setTimeout(() => {
            void updateSession();
            void refetchUser();
            setBgLoading(false);
          }, 500);
        },
      },
    );
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

  const handleDeleteUser = () => {
    const confirm = window.confirm(
      "Вы уверены, что хотите удалить аккаунт?\nЭто действие необратимо - вы потеряете все свои данные!",
    );
    if (!confirm) return;
    else
      void deleteUser(undefined, {
        onSuccess: () => {
          void signOut({ callbackUrl: "/", redirect: true });
        },
      });
  };

  if (isUserLoading) return <LoadingPage />;
  if (!sessionData)
    return (
      <div className="flex h-[100svh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!userData)
    return (
      <div className="flex h-[100svh] w-[100vw] items-center justify-center">
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
      <main
        className={`${isChanged ? "mb-36 min-h-[calc(100svh-9rem)]" : "min-h-[calc(100svh-1.5rem)]"} flex  flex-1 flex-col sm:pb-4`}
      >
        <div
          className={`${isChanged ? "bottom-0 z-20" : "-bottom-36 opacity-0"} fixed inset-x-0 h-36 w-full bg-black/75`}
        />
        <Button
          color="success"
          variant="ghost"
          isDisabled={isPhoneInvalid || isEmailInvalid || !userName}
          onClick={() => handleUpdate()}
          className={`${isChanged ? "bottom-20 z-30" : "-bottom-36 opacity-0"} container fixed inset-x-0 mx-auto max-w-80 transition-all duration-1000 lg:max-w-screen-lg`}
        >
          Сохранить
        </Button>
        <Button
          color="danger"
          variant="ghost"
          onClick={() => handleClear()}
          className={`${isChanged ? "bottom-7 z-30" : "-bottom-36 opacity-0"} container fixed inset-x-0 mx-auto max-w-80 transition-all duration-1000 lg:max-w-screen-lg`}
        >
          Отмена
        </Button>
        <div className="container mt-24 flex flex-1 flex-col gap-2 bg-white/75 py-2 dark:bg-red-950/50 sm:rounded-lg lg:max-w-screen-lg">
          <div className="flex flex-col">
            <span className="pb-2 text-xl text-default-600">Контакты</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
              <div className="flex flex-col items-center justify-center">
                <div className="max my-auto flex w-[128px] flex-row">
                  {uploading ? (
                    <LoadingSpinner width={64} height={64} />
                  ) : (
                    <>
                      <Image
                        alt="pp"
                        className="absolute -ml-1 -mt-1 w-[136px] rounded-full"
                        src={other.circle_red}
                        width={256}
                        height={256}
                      />
                      <Image
                        alt="pp"
                        className="rounded-full p-1"
                        src={sessionData.user.image ?? ""}
                        width={256}
                        height={256}
                      />
                    </>
                  )}
                </div>
                <UploadButton
                  content={{
                    button: (
                      <>
                        <FaImage
                          size={16}
                          className="text-black dark:text-white"
                        />
                        <p className="text-sm text-black dark:text-white">
                          {`Фото (до 4 Мб)`}
                        </p>
                      </>
                    ),
                    allowedContent: "Изображение (1 Мб)",
                  }}
                  className="h-8 w-full max-w-[160px] cursor-pointer pt-2 [&>div]:hidden [&>div]:text-sm [&>label>svg]:mr-1 [&>label]:w-full [&>label]:min-w-[84px] [&>label]:flex-1 [&>label]:rounded-medium [&>label]:border-2 [&>label]:border-black [&>label]:bg-transparent [&>label]:focus-within:ring-0 [&>label]:hover:bg-white/25 [&>label]:dark:border-white"
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
                {(isPhoneInvalid || isEmailInvalid || !userName) && (
                  <span className="ml-1 text-xs text-danger">
                    Обязательные поля отмечены красным
                  </span>
                )}
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
          <Divider className="my-2 bg-danger/50" />
          <span className="pb-2 text-xl text-default-600">Внешний вид</span>
          <span className="text-foreground-500">Выберите тему</span>
          <Switch
            isSelected={theme === "light"}
            onValueChange={(value) => {
              setTheme(value ? "light" : "dark");
            }}
            size="md"
            color="danger"
            startContent={<FaSun />}
            endContent={<FaMoon />}
          >
            {theme === "light" ? "Светлая тема" : "Тёмная тема"}
          </Switch>
          <Accordion isCompact>
            <AccordionItem
              aria-label={"Фон"}
              title={"Фон"}
              subtitle="Сменить фоновое изображение"
              startContent={
                <>
                  {bgLoading && (
                    <div className="absolute -ml-1 items-center justify-center py-1">
                      <LoadingSpinner width={24} height={24} />
                    </div>
                  )}
                  <Image
                    alt="current_background"
                    className="-ml-2 max-h-8 max-w-8 object-contain"
                    src={
                      bgSelected
                        ? bgSelection?.find((bgs) => bgs?.value === bgSelected)
                            ?.image ?? ""
                        : defaultImage
                    }
                  />
                </>
              }
            >
              <RadioGroup
                label="Выберите фон"
                orientation="horizontal"
                classNames={{
                  wrapper:
                    "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 overflow-hidden",
                }}
                color="danger"
                value={bgSelected ?? bgSelection[0]?.value ?? ""}
                onValueChange={handleUpdateBG}
              >
                {bgSelection.map((bg) => (
                  <Radio
                    value={bg!.value}
                    key={bg!.value}
                    className={
                      "flex min-w-32 [&>div]:flex-1 [&>div]:justify-center [&>span]:border-black [&>span]:dark:border-white"
                    }
                  >
                    <Image
                      alt="clan"
                      src={bg!.image}
                      height="64"
                      className="mx-auto"
                    />
                  </Radio>
                ))}
              </RadioGroup>
            </AccordionItem>
          </Accordion>
          <Button
            className="mb-2 mt-auto"
            variant="ghost"
            color="danger"
            onClick={() => handleDeleteUser()}
          >
            Удалить аккаунт
          </Button>
        </div>
      </main>
    </>
  );
}
