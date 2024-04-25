import Image from "next/image";
import { VscUnverified, VscVerified, VscWarning } from "react-icons/vsc";
import { FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import type { Character } from "~/server/api/routers/char";
import default_char from "~/../public/default_char.png";
import { Button, Tooltip } from "@nextui-org/react";
import { clans, factions } from "~/assets";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

const CharacterCard = ({
  character,
  handleEditCharacter,
}: {
  character: Character;
  handleEditCharacter?: (id: number) => void | null;
}) => {
  const router = useRouter();
  const { theme } = useTheme();

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

  const iconSelection = [...factionSelection, ...clanSelection].filter(
    (x) => x !== undefined,
  );

  return (
    <div
      key={character.id}
      onClick={() => {
        void router.push(
          {
            pathname: `/characters/${character.id}`,
          },
          undefined,
          { shallow: false },
        );
      }}
      className="grid min-h-44 cursor-pointer grid-cols-3 gap-2 rounded-md bg-red-950/50 p-2 text-default transition-all duration-1000 hover:shadow-md hover:shadow-red-950/50 hover:brightness-110 hover:drop-shadow-xl dark:text-white sm:grid-cols-3"
    >
      <div className="flex flex-col">
        <Image
          className="mx-auto mt-1 aspect-square h-full w-full rounded-md object-cover"
          alt="char_photo"
          src={!!character.image ? character.image : default_char}
          height="640"
          width="640"
        />
      </div>
      <div className="relative col-span-2 flex flex-1 flex-col">
        <div className="flex h-full flex-row">
          <div className="flex w-[85%] flex-1 flex-col gap-1">
            <p className="mr-auto max-w-[90%] break-words text-xl">
              {character.name}
            </p>
            <div className="flex flex-row">
              <Tooltip
                className="text-tiny text-black dark:text-white"
                content={character.faction?.name}
                placement="bottom"
              >
                <Image
                  alt="faction"
                  className="max-h-8 min-h-8 min-w-8 object-contain"
                  src={
                    iconSelection.find(
                      (is) => is!.value === character.faction?.icon,
                    )?.image ?? ""
                  }
                  width={32}
                  height={32}
                />
              </Tooltip>
              <Tooltip
                className="text-tiny text-black dark:text-white"
                content={character.clan?.name}
                placement="bottom"
              >
                <Image
                  alt="faction"
                  className="max-h-8 min-h-8 min-w-8 object-contain"
                  src={
                    iconSelection.find(
                      (is) => is!.value === character.clan?.icon,
                    )?.image ?? ""
                  }
                  width={32}
                  height={32}
                />
              </Tooltip>
            </div>
            <div>
              <p className="text-xs font-bold">{character.playerName}</p>
              <p className="text-xs font-bold">{character.playerContact}</p>
            </div>
            <div>
              <p className="text-xs italic">{character.status}</p>
              <p className="text-xs italic">{character.title}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-end gap-1">
            {!!handleEditCharacter && (
              <div className="flex flex-col items-center justify-end">
                {character.visible && character.verified ? (
                  <FaEye size={24} />
                ) : (
                  character.verified && <FaEyeSlash size={24} />
                )}
                {character.verified ? (
                  <VscVerified size={24} className="mt-1 text-success" />
                ) : character.pending ? (
                  <VscUnverified size={24} className="mt-1 text-white" />
                ) : (
                  <VscWarning size={24} className="mt-1 text-danger" />
                )}
                <Button
                  variant="light"
                  color="warning"
                  className="h-8 w-8 min-w-8 rounded-full p-0 text-default dark:text-warning"
                  onClick={() => handleEditCharacter(character.id)}
                >
                  <FaPencilAlt size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
