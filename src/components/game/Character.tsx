import Image from "next/image";
import { api } from "~/utils/api";
import { BsDroplet, BsDropletFill } from "react-icons/bs";
import { LoadingPage } from "~/components/Loading";
import type { Ability, CharacterEffects } from "~/server/api/routers/char";
import { disciplines } from "~/assets";
import { Button, CircularProgress } from "@nextui-org/react";
import default_char from "~/../public/default_char.png";
import { useEffect, useState } from "react";

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
      <p className="text-lg font-semibold">{char.name}</p>
      <div className="flex flex-row gap-2">
        <div className="flex min-w-32 max-w-32 flex-col">
          <Image
            className="mx-auto mt-1 aspect-square h-full w-full rounded-md object-cover"
            alt="char_photo"
            src={!!char.image ? char.image : default_char}
            height="128"
            width="128"
          />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex max-h-32 w-full flex-col gap-1 overflow-y-auto">
            {char.effects
              .filter(
                (e) =>
                  e.effect?.visibleToPlayer &&
                  (e.expires ? e.expires > new Date() : true),
              )
              .map((e) => (
                <Effect key={e.id + "_ability_effect"} e={e} />
              ))}
            {char.features
              .map((f) => f.feature.FeatureEffects)
              .flat()
              .map((e) => (
                <Effect
                  key={e.id + "_feature_effect"}
                  e={{
                    characterId: char.id,
                    effectId: e.effectId,
                    effect: e.effect,
                  }}
                />
              ))}
          </div>
        </div>
      </div>
      <Disciplines
        abilities={char.abilities.map((a) => a.abilitiy)}
        handleUseAbility={handleUseAbility}
      />
    </div>
  );
}

const Effect = ({ e }: { e: CharacterEffects }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const now = new Date();
    const diffMs = (e.expires?.getTime() ?? now.getTime()) - now.getTime();
    setTimeRemaining(Math.round(diffMs / 1000));

    const intervalId = setInterval(() => {
      const now = new Date();
      const diffMs = (e.expires?.getTime() ?? now.getTime()) - now.getTime();
      setTimeRemaining(Math.round(diffMs / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [e.expires]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div
      className={`flex-row items-center gap-1 ${!!e.effect?.expiration && timeRemaining <= 0 ? "hidden" : "flex"}`}
    >
      <CircularProgress
        size="md"
        strokeWidth={2}
        showValueLabel={true}
        value={!!timeRemaining ? timeRemaining : 60}
        maxValue={!!e.effect?.expiration ? e.effect?.expiration * 60 : 60}
        classNames={{
          value: !!timeRemaining ? "" : "text-3xl",
        }}
        valueLabel={
          !!timeRemaining
            ? `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
            : "∞"
        }
        color={
          e.effect?.color as
            | "default"
            | "success"
            | "warning"
            | "primary"
            | "secondary"
            | "danger"
          // - Канализация и Превращение: белый
          // - Могущество: оранжевый
          // - Затемнение: синий
          // - Очарование: зелёный
          // - Тауматургия: красный
        }
      />
      <div className="flex flex-col">
        <p className="text-xs font-semibold">{e.effect?.name}</p>
        <p className="text-xs">{e.effect?.content}</p>
      </div>
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
    <div className="flex flex-row flex-wrap gap-0">
      {abilities.map((a) => (
        <Button
          key={a.id + "_ability"}
          onClick={() => handleUseAbility(a.id)}
          className="flex h-14 w-full min-w-80 flex-col items-start text-start sm:w-auto"
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
