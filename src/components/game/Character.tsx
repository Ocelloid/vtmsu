import Image from "next/image";
import { api } from "~/utils/api";
import { BsDroplet, BsDropletFill } from "react-icons/bs";
import { LoadingPage } from "~/components/Loading";
import type { Ability, Effect } from "~/server/api/routers/char";
import { disciplines } from "~/assets";
import { Button } from "@nextui-org/react";
import default_char from "~/../public/default_char.png";

export default function Character({ characterId }: { characterId: number }) {
  const { data: char, refetch: refetchChar } = api.char.getById.useQuery({
    id: characterId,
  });
  const { mutate: applyAbility } = api.char.applyAbility.useMutation();

  const handleUseAbility = (id: number) => {
    if (!char) return;
    applyAbility(
      { id, charId: characterId },
      { onSuccess: () => void refetchChar() },
    );
  };

  if (!char) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-4 py-2">
      <BloodMeter amount={char.bloodAmount} pool={char.bloodPool} />
      <div className="flex flex-row gap-2">
        <div className="flex max-w-32 flex-col">
          <Image
            className="mx-auto mt-1 aspect-square h-full w-full rounded-md object-cover"
            alt="char_photo"
            src={!!char.image ? char.image : default_char}
            height="128"
            width="128"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-sm">{char.name}</p>
          <Effects effects={char.effects.map((e) => e.effect)} />
        </div>
      </div>
      <Disciplines
        abilities={char.abilities.map((a) => a.abilitiy)}
        handleUseAbility={handleUseAbility}
      />
    </div>
  );
}

const Effects = ({ effects }: { effects: Effect[] }) => {
  return (
    <div className="flex flex-col gap-2">
      {!!effects.length && <p>Эффекты:</p>}
      {effects.map((e) => (
        <div key={e.id + "_effect"} className="flex flex-col">
          <p className="text-xs">{e.name}</p>
          <p className="text-xs italic">{e.description}</p>
        </div>
      ))}
    </div>
  );
};

const Disciplines = ({
  abilities,
  handleUseAbility,
}: {
  abilities: Ability[];
  handleUseAbility: (id: number) => void;
}) => {
  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {abilities.map((a) => (
        <Button
          key={a.id + "_ability"}
          onClick={() => handleUseAbility(a.id)}
          className="flex h-16 w-full min-w-80 flex-col items-start text-start sm:w-auto"
          variant="light"
          color="warning"
        >
          <div className="flex flex-row items-center gap-2 text-xl">
            <Image
              alt="disc"
              className="max-h-12 max-w-12"
              src={
                !!a.icon
                  ? discIcons.find((di) => di.key === a.icon)?.value ?? ""
                  : ""
              }
              height={128}
              width={128}
            />{" "}
            <div className="flex flex-col">
              <p className="text-sm">{a.name}</p>
              <p className="text-xs">Стоимость: {a.cost}</p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};

const BloodMeter = ({ amount, pool }: { amount: number; pool: number }) => {
  return (
    <div className="flex w-full flex-row justify-between gap-1 text-red-500">
      {Array.from({ length: pool }).map((_, i) =>
        i < amount ? (
          <BsDropletFill size={24} key={i} />
        ) : (
          <BsDroplet size={24} key={i} />
        ),
      )}
    </div>
  );
};
