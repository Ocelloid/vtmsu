import { BsDroplet, BsDropletFill } from "react-icons/bs";
import { api } from "~/utils/api";

export default function BloodMeter({ characterId }: { characterId: number }) {
  const { data: char } = api.char.getById.useQuery({
    id: characterId,
  });
  return (
    <div className="flex w-full flex-row justify-between gap-1 text-red-500">
      {Array.from({ length: char?.bloodPool ?? 0 }).map((_, i) =>
        i < (char?.bloodAmount ?? 0) ? (
          <BsDropletFill size={24} key={i} />
        ) : (
          <BsDroplet size={24} key={i} />
        ),
      )}
    </div>
  );
}
