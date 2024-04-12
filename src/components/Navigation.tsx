import Link from "next/link";
import { FaXmark, FaAnkh, FaBars } from "react-icons/fa6";
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

  if (!sessionData)
    return (
      <nav className="iphone-backdrop fixed left-0 top-0 z-50 flex w-full flex-col items-center justify-between gap-8 bg-transparent p-7 md:flex-row md:gap-0">
        <div className="font-poppins flex w-full items-center justify-between font-bold lowercase tracking-tight dark:text-neutral-100 md:text-4xl">
          <Link
            href="/"
            onClick={() => {
              setIsOpen(false);
              pathOpen("");
            }}
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaAnkh size={30} />
          </Link>
          <div className="flex md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaXmark size={30} /> : <FaBars size={30} />}
          </div>
        </div>
        <ul
          className={`items-right font-montserrat mr-auto flex flex-col gap-8 dark:text-neutral-100 md:flex-row md:justify-end md:gap-10 ${!isOpen && "hidden md:flex"}`}
        >
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("about");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Об игре
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("rules");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Правила
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("store");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Магазин
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              void signIn();
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-0 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Войти
          </Button>
        </ul>
      </nav>
    );

  if (sessionData)
    return (
      <nav className="iphone-backdrop absolute left-0 top-0 z-50 flex w-full flex-col items-center justify-between gap-8 bg-transparent p-7 md:fixed md:flex-row md:gap-0">
        <div className="font-poppins flex w-full items-center justify-between font-bold lowercase tracking-tight dark:text-neutral-100 md:text-4xl">
          <Link
            href="/"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaAnkh size={40} />
          </Link>
          <div className="flex md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaXmark size={40} /> : <FaBars size={40} />}
          </div>
        </div>
        <ul
          className={`items-right font-montserrat mr-auto flex flex-col gap-4 dark:text-neutral-100 md:flex-row md:justify-end md:gap-4 ${!isOpen && "hidden md:flex"}`}
        >
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("about");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Об игре
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("game");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Играть
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("characters");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Персонажи
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("rules");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Правила
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("store");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            Магазин
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              pathOpen("settings");
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-2 text-medium hover:text-gray-700 dark:hover:text-gray-300 md:hidden"
          >
            Настройки
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              void signOut();
            }}
            variant="bordered"
            className="font-montserrat w-min min-w-10 border-none px-4 py-0 text-medium text-red-500 md:hidden"
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
                  className="font-montserrat hidden border-none text-medium hover:text-gray-300 md:flex"
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
              <DropdownItem key="settings" onClick={() => pathOpen("settings")}>
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
        </ul>
      </nav>
    );
};

// export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
//     return {
//       props: {
//         ...(await serverSideTranslations(locale ?? "en", ["common"])),
//       },
//     };
//   };

export default Navigation;
