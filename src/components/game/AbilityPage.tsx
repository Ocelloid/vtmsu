import Image from "next/image";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import { disciplines } from "~/assets";
import { Button } from "@nextui-org/react";
import type { Character, Ability } from "~/server/api/routers/char";
import { GiConfirmed, GiCancel } from "react-icons/gi";
import { useState } from "react";

export default function AbilityPage({
  char,
  refetch,
}: {
  char: Character;
  refetch: () => void;
}) {
  if (!char) return <LoadingPage />;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-row flex-wrap gap-0">
        {char.abilities?.map((a) => (
          <Ability
            key={a.id + "_ability"}
            ability={a.abilitiy}
            refetch={refetch}
            char={char}
          />
        ))}
      </div>
    </div>
  );
}

const Ability = ({
  ability,
  refetch,
  char,
}: {
  ability: Ability | undefined;
  refetch: () => void;
  char: Character;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });
  const { mutate: applyAbility } = api.char.applyAbility.useMutation();

  const handleUseAbility = (id: number) => {
    if (!char) return;
    applyAbility(
      { id, charId: char.id },
      {
        onSuccess: () => {
          void refetch();
          setIsConfirming(false);
        },
      },
    );
  };

  if (isConfirming)
    return (
      <div className="flex h-14 w-full min-w-80 flex-col justify-center text-start sm:w-auto">
        <div className="flex flex-row items-center gap-2 px-4 text-xl">
          <Image
            alt="disc"
            className="max-h-12 max-w-12"
            src={
              !!ability?.icon
                ? discIcons.find((di) => di.key === ability?.icon)?.value ?? ""
                : ""
            }
            height={128}
            width={128}
          />{" "}
          <div className="flex w-full flex-col">
            <p className="text-xs text-warning">
              Стоимость: {ability?.cost ?? ""}
            </p>
            <div className="flex flex-row justify-between">
              <Button
                variant="light"
                color="warning"
                onClick={() => handleUseAbility(ability?.id ?? 0)}
                className="flex h-6 flex-row px-1"
              >
                <GiConfirmed size={16} />
                Применить
              </Button>
              <Button
                variant="light"
                color="warning"
                onClick={() => setIsConfirming(false)}
                className="flex h-6 flex-row px-1"
              >
                <GiCancel size={16} />
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  else
    return (
      <Button
        key={ability?.id + "_ability"}
        isDisabled={(char.bloodAmount ?? 0) < (ability?.cost ?? 0) + 1}
        onClick={() => setIsConfirming(true)}
        className="flex h-14 w-full min-w-80 flex-col items-start text-start sm:w-auto"
        variant="light"
        color="warning"
      >
        <div className="flex flex-row items-center gap-2 text-xl">
          <Image
            alt="disc"
            className="max-h-12 max-w-12"
            src={
              !!ability?.icon
                ? discIcons.find((di) => di.key === ability?.icon)?.value ?? ""
                : ""
            }
            height={128}
            width={128}
          />{" "}
          <div className="flex flex-col">
            <p className="text-sm">{ability?.name ?? ""}</p>
            <p className="text-xs">Стоимость: {ability?.cost ?? ""}</p>
          </div>
        </div>
      </Button>
    );
};
