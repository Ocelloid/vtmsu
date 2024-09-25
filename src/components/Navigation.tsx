import Link from "next/link";
import { FaXmark, FaAnkh, FaBars, FaArrowLeft } from "react-icons/fa6";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  User,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { data: isPersonnel } = api.user.userIsPersonnel.useQuery(undefined, {
    enabled: !!sessionData,
  });
  const { data: appData } = api.util.getAppData.useQuery(undefined, {
    enabled: !!sessionData,
  });
  const pathOpen = (pathname: string) => {
    void router.push(`/${pathname}`, `/${pathname}`, { shallow: false });
  };

  return (
    <nav
      className={`${!router.asPath.includes("game") ? "flex" : "hidden"} iphone-backdrop fixed left-0 top-0 z-[950] w-full flex-col items-center justify-between gap-4 bg-transparent p-7 sm:flex md:flex-row md:gap-0`}
    >
      <div className="font-poppins flex w-full items-center justify-between font-bold lowercase tracking-tight dark:text-neutral-100 md:text-4xl">
        <Link
          href={
            !!router.query.pid && !router.asPath.includes("qr")
              ? router.asPath.split("/").slice(0, -1).join("/")
              : "/"
          }
          onClick={() => {
            setIsOpen(false);
          }}
          className="flex flex-row items-center text-xl hover:text-gray-700 dark:hover:text-gray-300"
        >
          {!!router.query.pid && !router.asPath.includes("qr") ? (
            <FaArrowLeft size={30} />
          ) : (
            <FaAnkh size={30} />
          )}
          &nbsp;βeta
        </Link>
        <div className="flex md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaXmark size={30} /> : <FaBars size={30} />}
        </div>
      </div>
      <ul
        className={`${!isOpen && "hidden"} items-right mr-auto flex flex-col gap-4 dark:text-neutral-100 sm:gap-1 md:flex md:flex-row md:justify-end md:gap-2 lg:gap-4 xl:gap-6 2xl:gap-8 [&>*]:px-2`}
      >
        <Button
          onClick={() => {
            setIsOpen(false);
            pathOpen("about");
          }}
          variant="bordered"
          className="w-min min-w-10 border-none py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
        >
          Об игре
        </Button>
        {!!sessionData && (
          <>
            {!!(!!appData?.gameAllowed || !!isPersonnel) && (
              <Button
                onClick={() => {
                  setIsOpen(false);
                  pathOpen("game");
                }}
                variant="bordered"
                className="w-min min-w-10 border-none py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
              >
                Играть
              </Button>
            )}
            <Button
              onClick={() => {
                setIsOpen(false);
                pathOpen("characters");
              }}
              variant="bordered"
              className="w-min min-w-10 border-none py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
            >
              Персонажи
            </Button>
          </>
        )}
        <Button
          onClick={() => {
            setIsOpen(false);
            pathOpen("rules");
          }}
          variant="bordered"
          className="w-min min-w-10 border-none py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
        >
          Правила
        </Button>
        <Button
          onClick={() => {
            setIsOpen(false);
            pathOpen("shop");
          }}
          variant="bordered"
          className="w-min min-w-10 border-none py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
        >
          Магазин
        </Button>
        {!!sessionData && (
          <>
            {isPersonnel && (
              <Button
                onClick={() => {
                  setIsOpen(false);
                  pathOpen("admin");
                }}
                variant="bordered"
                className="w-min min-w-10 border-none py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
              >
                Управление
              </Button>
            )}
            <Button
              onClick={() => {
                setIsOpen(false);
                pathOpen("settings");
              }}
              variant="bordered"
              className="w-min min-w-10 border-none py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300 md:hidden"
            >
              Настройки
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false);
                void signOut();
              }}
              variant="bordered"
              className="w-min min-w-10 border-none py-0 text-medium text-red-500 md:hidden"
            >
              Выйти
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <div className="relative flex">
                  <User
                    as="button"
                    avatarProps={{
                      isBordered: true,
                      size: "sm",
                      className:
                        "w-8 h-8 max-h-8 max-w-8 min-w-8 min-h-8 bg-red-500 ring-offset-red-500 dark:ring-offset-background-red-500",
                      src: sessionData.user.image ?? "",
                    }}
                    className="hidden w-full gap-2 text-medium hover:text-red-900 dark:hover:text-red-400 md:flex"
                    name={sessionData.user.name}
                  />
                </div>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="acconut_actions"
                disabledKeys={!isPersonnel ? ["admin"] : []}
                itemClasses={{
                  title: [
                    "text-medium",
                    "dark:hover:text-gray-300",
                    "hover:text-gray-700",
                  ],
                  base: [
                    "bg-transparent",
                    "hover:bg-transparent",
                    "dark:text-neutral-100",
                  ],
                }}
              >
                <DropdownItem
                  key="settings"
                  onClick={() => pathOpen("settings")}
                >
                  Настройки
                </DropdownItem>
                <DropdownItem
                  key="exit"
                  className="text-danger"
                  color="danger"
                  onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                >
                  Выйти
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        )}
        {!sessionData && (
          <Button
            onClick={() => {
              setIsOpen(false);
              void signIn(undefined, {
                callbackUrl: "/settings",
                redirect: true,
              });
            }}
            variant="bordered"
            className="w-min min-w-10 border-none px-4 py-0 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Войти
          </Button>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
