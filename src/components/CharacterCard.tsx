import Image from "next/image";
import { FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import type { Character } from "~/server/api/routers/char";
import default_char from "~/../public/default_char.png";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/react";

const CharacterCard = ({
  character,
  handleEditCharacter,
}: {
  character: Character;
  handleEditCharacter?: (id: number) => void | null;
}) => {
  const router = useRouter();
  return (
    <div
      key={character.id}
      onClick={() => {
        void router.push(
          {
            pathname: `/characters/${character.id}`,
          },
          undefined,
          { shallow: true },
        );
      }}
      className="grid cursor-pointer grid-cols-3 rounded-md bg-red-950/50 p-2 text-default transition-all duration-1000 hover:shadow-md hover:shadow-red-950/50 hover:brightness-110 hover:drop-shadow-xl dark:text-white sm:grid-cols-3 sm:gap-4"
    >
      <div className="mb-2 flex flex-col sm:mb-0">
        <Image
          className="mx-auto mt-1 aspect-square h-full w-full rounded-md object-cover"
          alt="char_photo"
          src={!!character.image ? character.image : default_char}
          height="640"
          width="640"
        />
      </div>
      <div className="relative col-span-2 flex flex-1 flex-col">
        {!!handleEditCharacter && (
          <div className="absolute bottom-0 right-0 flex flex-row">
            {character.visible ? (
              <FaEye size={24} className="mr-2 mt-1 min-w-8" />
            ) : (
              <FaEyeSlash size={24} className="mr-1 min-w-8" />
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
        <div className="flex flex-row">
          <p className="mr-auto max-w-full break-words text-xl">
            {character.name}
          </p>
        </div>
        {character.playerName && character.playerContact && (
          <p className="text-xs font-bold">
            {character.playerName}
            {" - "}
            {character.playerContact}
          </p>
        )}
        <p className="italic">
          {character.faction?.name}
          {" - "}
          {character.clan?.name}
        </p>
        <p className="text-xs italic">{character.status}</p>
        <p className="text-xs italic">{character.title}</p>
      </div>
    </div>
  );
};

export default CharacterCard;
