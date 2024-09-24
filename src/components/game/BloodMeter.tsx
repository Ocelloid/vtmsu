import {
  GiPrettyFangs,
  GiFangs,
  GiFangsCircle,
  GiRestingVampire,
} from "react-icons/gi";
import { api } from "~/utils/api";
import { BsDroplet, BsDropletFill } from "react-icons/bs";

export default function BloodMeter({ characterId }: { characterId: number }) {
  const { data: char } = api.char.getById.useQuery({
    id: characterId,
  });
  const pool = char?.bloodPool ?? 0;
  const amount = char?.bloodAmount ?? 0;

  return (
    <div className="flex w-full flex-col gap-0 text-red-900 dark:text-red-700">
      <div className="flex w-full flex-row justify-between rounded-lg bg-red-200/50 p-2 transition-all dark:bg-red-950/50">
        {Array.from({ length: pool + 5 }).map((_, i) =>
          i < (amount ?? 0) ? (
            <BsDropletFill size={20} key={i} />
          ) : (
            <BsDroplet size={20} key={i} className="opacity-10" />
          ),
        )}
      </div>
      <div className="-mt-8 mb-1 flex flex-col items-center brightness-125">
        {amount === 0 ? (
          <div className="flex flex-row items-center gap-2 text-lg">
            <GiRestingVampire size={20} />
            Торпор
            <GiRestingVampire size={20} />
          </div>
        ) : amount < 2 ? (
          <div className="flex animate-ping flex-row items-center gap-2 text-lg">
            <GiFangsCircle size={20} />
            Безумие
            <GiFangsCircle size={20} />
          </div>
        ) : amount < 4 ? (
          <div className="flex animate-pulse flex-row items-center gap-2 text-lg">
            <GiFangs size={20} />
            Голод
            <GiFangs size={20} />
          </div>
        ) : amount < 6 ? (
          <div className="flex animate-pulse flex-row items-center gap-2 text-lg">
            <GiPrettyFangs size={20} />
            Жажда
            <GiPrettyFangs size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
