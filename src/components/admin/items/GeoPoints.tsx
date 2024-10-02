import GeoPointForm from "~/components/modals/GeoPointForm";
import DynamicGeoPointsMap from "~/components/admin/items/DynamicGeoPointsMap";
import { api } from "~/utils/api";
import { useState } from "react";
import { LoadingPage } from "~/components/Loading";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { Button } from "@nextui-org/react";
import { LatLng } from "leaflet";

export default function GeoPoints() {
  const {
    data: geoPoints,
    isLoading: isItemsLoading,
    refetch: refetchPoints,
  } = api.city.getAllGeoPoints.useQuery();
  const { mutate: deleteGeoPoint } = api.city.deleteGeoPoint.useMutation();
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Вы уверены, что хотите удалить эту геоточку?",
    );
    if (!confirm) return;
    deleteGeoPoint({ id });
    void refetchPoints();
  };

  const handleCopyPosition = (p: LatLng) => {
    setPosition(p);
  };

  if (isItemsLoading) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-2 pt-2">
      <GeoPointForm onRefetch={refetchPoints} position={position} />
      {!!geoPoints && (
        <DynamicGeoPointsMap
          geoPoints={geoPoints}
          handleCopyPosition={handleCopyPosition}
        />
      )}
      {geoPoints?.map((geoPoint) => (
        <div
          key={geoPoint.id}
          className="flex w-auto flex-row items-center justify-between rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
        >
          <div className="flex flex-col gap-1">
            <p>{geoPoint.name}</p>
            <p
              className="max-h-32 overflow-hidden text-justify text-xs"
              dangerouslySetInnerHTML={{ __html: geoPoint.content ?? "" }}
            />
          </div>
          <div className="flex flex-row gap-1">
            <Button
              variant="light"
              size="sm"
              className="flex min-w-10 flex-row gap-0 bg-transparent text-black dark:text-red-100"
              onClick={() => handleDelete(geoPoint.id)}
            >
              <FaTrashAlt size={12} />
            </Button>
            <GeoPointForm editId={geoPoint.id} onRefetch={refetchPoints}>
              <FaPencilAlt />
            </GeoPointForm>
          </div>
        </div>
      ))}
    </div>
  );
}
