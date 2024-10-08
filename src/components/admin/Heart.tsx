import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";

export default function Heart() {
  const { data: heartData, isLoading } = api.util.getHeartUsage.useQuery(
    undefined,
    {
      refetchInterval: 5000,
    },
  );
  if (isLoading) return <LoadingPage />;
  if (!!heartData)
    return (
      <div className="flex flex-col gap-2">
        {heartData.map((hd) => (
          <div key={hd.char.id} className="grid grid-cols-3">
            <p>{hd.createdAt.toLocaleString()}</p>
            <p>{hd.ashes?.createdBy.name ?? "-"}</p>
            <p>{hd.focus?.createdBy.name ?? "-"}</p>
            <p>{hd.char.name}</p>
            <p>{hd.ashesName}</p>
            <p>{hd.focusName}</p>
            <p className="col-span-3">{hd.content}</p>
          </div>
        ))}
      </div>
    );
  return null;
}
