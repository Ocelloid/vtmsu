import "leaflet/dist/leaflet.css";
import { MapControl, Draggable } from "~/components/map";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { GeoPoint } from "~/server/api/routers/city";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L, { LatLng } from "leaflet";

const marker_icon = L.icon({ iconUrl: "/map-marker.png" });
const sewer_icon = L.icon({ iconUrl: "/sewer.png" });

export default function GeoPointsMap({
  geoPoints,
  handleCopyPosition,
}: {
  geoPoints: GeoPoint[];
  handleCopyPosition: (position: LatLng) => void;
}) {
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  return (
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
          handleCopyPosition(p);
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
  );
}
