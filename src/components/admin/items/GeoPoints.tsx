"use client";
import GeoPointForm from "~/components/modals/GeoPointForm";
import { FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import { MapControl, Draggable } from "~/components/map";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { LatLng } from "leaflet";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { api } from "~/utils/api";
import type { GeoPoint } from "~/server/api/routers/city";

const sewer_icon = L.icon({ iconUrl: "/sewer.png" });
const marker_icon = L.icon({ iconUrl: "/map-marker.png" });

const GeoPoints = () => {
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);

  const { mutate: deleteGeoPoint } = api.city.deleteGeoPoint.useMutation();
  const {
    data: geoPointsData,
    refetch: refetchPoints,
    isLoading,
  } = api.city.getAllGeoPoints.useQuery();

  useEffect(() => {
    if (geoPointsData) setGeoPoints(geoPointsData);
  }, [geoPointsData]);

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Вы уверены, что хотите удалить эту геоточку?");
    if (!confirmed) return;
    deleteGeoPoint({ id });
    void refetchPoints();
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="flex flex-col gap-2 pt-2">
      <GeoPointForm onRefetch={refetchPoints} position={position} />
      <MapContainer
        center={[58.0075, 56.23]}
        zoom={13.5}
        style={{ height: "480px" }}
      >
        <TileLayer
          attribution={
            !!position
              ? `Координаты: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
              : ""
          }
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapControl />
        <Draggable
          updatePosition={(p) => {
            setPosition(p);
            void navigator.clipboard.writeText(p.lat + "," + p.lng);
          }}
        />
        {geoPoints.map((geoPoint) => (
          <Marker
            key={geoPoint.id}
            position={[geoPoint.lat ?? 0, geoPoint.lng ?? 0]}
            icon={geoPoint.icon === "sewer" ? sewer_icon : marker_icon}
          >
            <Popup>
              <div className="flex flex-col items-center gap-0">
                <span>{geoPoint.name}</span>
                <div
                  dangerouslySetInnerHTML={{ __html: geoPoint.content ?? "" }}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
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
};

export default GeoPoints;
