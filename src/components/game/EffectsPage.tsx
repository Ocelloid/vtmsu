import { LoadingPage } from "~/components/Loading";
import type { CharacterEffects } from "~/server/api/routers/char";
import { CircularProgress } from "@nextui-org/react";
import { useEffect, useState } from "react";
import type { Character } from "~/server/api/routers/char";

export default function EffectsPage({ char }: { char: Character }) {
  console.log(char);
  if (!char) return <LoadingPage />;

  return (
    <div className="flex w-full flex-col gap-2">
      {char.effects
        ?.filter(
          (e) =>
            e.effect?.visibleToPlayer &&
            (e.expires ? e.expires > new Date() : true),
        )
        .map((e) => <Effect key={e.id + "_char_effect"} e={e} />)}
      {char.abilities
        ?.map((a) => a.abilitiy?.AbilityEffects)
        .flat()
        .filter(
          (e) =>
            e?.effect?.visibleToPlayer &&
            (e.expires ? e.expires > new Date() : true),
        )
        .map((e) => (
          <Effect
            key={e?.effect?.id + "_ability_effect"}
            e={{
              characterId: char.id,
              effectId: e?.effect?.id ?? 0,
              effect: e?.effect,
            }}
          />
        ))}
      {char.features
        ?.map((f) => f.feature?.FeatureEffects)
        .flat()
        .map((e) => (
          <Effect
            key={e?.id + "_feature_effect"}
            e={{
              characterId: char.id,
              effectId: e?.effectId ?? 0,
              effect: e?.effect,
            }}
          />
        ))}
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
        }
      />
      <div className="flex flex-col">
        <p className="text-xs font-semibold">{e.effect?.name}</p>
        <p className="text-xs">{e.effect?.content}</p>
      </div>
    </div>
  );
};
