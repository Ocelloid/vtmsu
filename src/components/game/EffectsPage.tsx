import { LoadingPage } from "~/components/Loading";
import type { CharacterEffects } from "~/server/api/routers/char";
import { CircularProgress } from "@nextui-org/react";
import { useEffect, useState } from "react";
import type { Character } from "~/server/api/routers/char";
import { formatTime } from "~/utils/text";

export default function EffectsPage({
  char,
  auspex,
}: {
  char: Character;
  auspex: boolean;
}) {
  if (!char) return <LoadingPage />;

  const activeEffects =
    char.effects?.filter((e) => (e.expires ?? new Date()) > new Date()) ?? [];

  return (
    <div className="flex w-full flex-col gap-2">
      {activeEffects
        ?.filter(
          (e) =>
            (auspex ? !!e.effect?.auspexData : true) &&
            e.effect?.visibleToPlayer,
        )
        .map((e, i) =>
          e.effect?.name === "Таудроновое похмелье" &&
          activeEffects?.some((e) => e.effect?.name === "Таудрон") ? null : (
            <Effect key={e.id + "_char_effect" + i} e={e} auspex={auspex} />
          ),
        )}
      {char.abilities
        ?.map((a) => a.abilitiy?.AbilityEffects)
        .flat()
        .filter(
          (e) =>
            (auspex ? !!e?.effect?.auspexData : true) &&
            e?.effect?.visibleToPlayer &&
            (e.expires ? e.expires > new Date() : true),
        )
        .map((e, i) => (
          <Effect
            key={e?.effect?.id + "_ability_effect" + i}
            auspex={auspex}
            e={{
              characterId: char.id,
              effectId: e?.effect?.id ?? 0,
              effect: e?.effect,
            }}
          />
        ))}
      {char.Item?.map((i) => i?.type?.ItemEffects)
        .flat()
        .filter(
          (e) =>
            (auspex ? !!e?.effect?.auspexData : true) &&
            e?.effect?.visibleToPlayer &&
            (e.expires ? e.expires > new Date() : true),
        )
        .map((e, i) => (
          <Effect
            key={e?.id + "_item_effect" + i}
            auspex={auspex}
            e={{
              characterId: char.id,
              effectId: e?.effectId ?? 0,
              effect: e?.effect,
            }}
          />
        ))}
      {char.features
        ?.map((f) => f.feature?.FeatureEffects)
        .flat()
        .filter(
          (e) =>
            (auspex ? !!e?.effect?.auspexData : true) &&
            e?.effect?.visibleToPlayer &&
            (e.expires ? e.expires > new Date() : true),
        )
        .map((e, i) => (
          <Effect
            key={e?.id + "_feature_effect" + i}
            auspex={auspex}
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

const Effect = ({ auspex, e }: { auspex: boolean; e: CharacterEffects }) => {
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

  return (
    <div
      className={`flex-row items-center gap-1 ${!!e.effect?.expiration && timeRemaining <= 0 ? "hidden" : "flex"}`}
    >
      <CircularProgress
        size="md"
        strokeWidth={2}
        showValueLabel={true}
        aria-label="progress"
        value={!!timeRemaining ? timeRemaining : 60}
        maxValue={!!e.effect?.expiration ? e.effect?.expiration * 60 : 60}
        classNames={{
          value: !!timeRemaining ? "" : "text-3xl",
        }}
        valueLabel={!!timeRemaining ? formatTime(timeRemaining) : "∞"}
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
      {auspex ? (
        <div className="flex flex-col">
          <p className="text-xs">{e.effect?.auspexData}</p>
        </div>
      ) : (
        <div className="flex flex-col">
          <p className="text-xs font-semibold">{e.effect?.name}</p>
          <p className="text-xs">{e.effect?.content}</p>
        </div>
      )}
    </div>
  );
};
