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

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: sessionData } = useSession();
  const pathOpen = (pathname: string) => {
    void router.replace(`/${pathname}`);
  };

  return (
    <nav className="iphone-backdrop fixed left-0 top-0 z-50 flex w-full flex-col items-center justify-between gap-4 bg-transparent p-7 md:flex-row md:gap-0">
      <div className="font-poppins flex w-full items-center justify-between font-bold lowercase tracking-tight dark:text-neutral-100 md:text-4xl">
        <Link
          href={
            router.asPath.split("/").length < 3
              ? "/"
              : router.asPath.split("/").slice(0, -1).join("/")
          }
          onClick={() => {
            setIsOpen(false);
          }}
          className="hover:text-gray-700 dark:hover:text-gray-300"
        >
          {router.asPath.split("/").length < 3 ? (
            <FaAnkh size={30} />
          ) : (
            <FaArrowLeft size={30} />
          )}
        </Link>
        <div className="flex md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaXmark size={30} /> : <FaBars size={30} />}
        </div>
      </div>
      <ul
        className={`${!isOpen && "hidden"} items-right font-montserrat mr-auto flex flex-col gap-4 dark:text-neutral-100 md:flex md:flex-row md:justify-end md:gap-4`}
      >
        <Button
          onClick={() => {
            setIsOpen(false);
            pathOpen("about");
          }}
          variant="bordered"
          className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Об игре
        </Button>
        {!!sessionData && (
          <>
            <Button
              onClick={() => {
                setIsOpen(false);
                pathOpen("game");
              }}
              variant="bordered"
              className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Играть
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false);
                pathOpen("characters");
              }}
              variant="bordered"
              className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300"
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
          className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Правила
        </Button>
        <Button
          onClick={() => {
            setIsOpen(false);
            pathOpen("shop");
          }}
          variant="bordered"
          className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Магазин
        </Button>
        {!!sessionData && (
          <>
            <Button
              onClick={() => {
                setIsOpen(false);
                pathOpen("admin");
              }}
              variant="bordered"
              className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300 md:hidden"
            >
              Управление
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false);
                pathOpen("settings");
              }}
              variant="bordered"
              className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300 md:hidden"
            >
              Настройки
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false);
                void signOut();
              }}
              variant="bordered"
              className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-0 text-red-500 md:hidden"
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
                      className: "w-10 h-8",
                      src: sessionData.user.image ?? "",
                    }}
                    className="font-montserrat text-medium hidden border-none hover:text-gray-300 md:flex"
                    name={sessionData.user.name}
                  />
                </div>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="acconut_actions"
                disabledKeys={[]}
                itemClasses={{
                  title: [
                    "font-montserrat",
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
                <DropdownItem key="admin" onClick={() => pathOpen("admin")}>
                  Управление
                </DropdownItem>
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
                  onClick={() => signOut()}
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
              void signIn();
            }}
            variant="bordered"
            className="font-montserrat text-medium w-min min-w-10 border-none px-4 py-0 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Войти
          </Button>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
