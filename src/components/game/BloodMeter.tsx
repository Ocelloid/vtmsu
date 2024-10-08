import {
  GiPrettyFangs,
  GiFangs,
  GiFangsCircle,
  GiRestingVampire,
  GiDeathSkull,
} from "react-icons/gi";
import { BsDroplet, BsDropletFill } from "react-icons/bs";
import type { Character } from "~/server/api/routers/char";

export default function BloodMeter({ char }: { char: Character }) {
  const pool = char?.bloodPool ?? 0;
  const amount = char?.bloodAmount ?? 0;
  const featureEffects = char?.features
    ?.map((f) => f.feature?.FeatureEffects)
    .flat();
  const hasConcentratedBlood = !!featureEffects?.find((e) =>
    e?.effect?.name.includes("Концентрированная кровь"),
  );

  return (
    <div className="flex w-full flex-col gap-0 text-red-900 dark:text-red-700">
      <div className="flex w-full flex-row justify-between rounded-lg bg-red-200/50 p-2 transition-all dark:bg-red-950/50">
        {Array.from({
          length: pool + (hasConcentratedBlood ? 2 : 0),
        }).map((_, i) =>
          i < (amount ?? 0) ? (
            <BsDropletFill size={20} key={i} />
          ) : (
            <BsDroplet size={20} key={i} className="opacity-10" />
          ),
        )}
      </div>
      {!char.alive ? (
        <div className="mx-auto -mt-8 mb-1 flex flex-row items-center gap-2 text-lg brightness-125">
          <GiDeathSkull size={20} />
          Погиб
          <GiDeathSkull size={20} />
        </div>
      ) : amount === 0 ? (
        <div className="mx-auto -mt-8 mb-1 flex flex-row items-center gap-2 text-lg brightness-125">
          <GiRestingVampire size={20} />
          Торпор
          <GiRestingVampire size={20} />
        </div>
      ) : amount < 2 ? (
        <div className="mx-auto -mt-8 mb-1 flex animate-ping flex-row items-center gap-2 text-lg brightness-125">
          <GiFangsCircle size={20} />
          Безумие
          <GiFangsCircle size={20} />
        </div>
      ) : amount < 4 ? (
        <div className="mx-auto -mt-8 mb-1 flex animate-pulse flex-row items-center gap-2 text-lg brightness-125">
          <GiFangs size={20} />
          Голод
          <GiFangs size={20} />
        </div>
      ) : amount < 6 ? (
        <div className="mx-auto -mt-8 mb-1 flex animate-pulse flex-row items-center gap-2 text-lg brightness-125">
          <GiPrettyFangs size={20} />
          Жажда
          <GiPrettyFangs size={20} />
        </div>
      ) : null}
    </div>
  );
}
