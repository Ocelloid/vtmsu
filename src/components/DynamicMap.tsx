import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { RecenterAutomatically } from "~/components/map";

function Map({ center }: { center: { lat: number; lng: number } }) {
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(new LatLng(pos.coords.latitude, pos.coords.longitude));
      },
      (err) => {
        console.error(err);
      },
    );
  }, []);
  return (
    <MapContainer center={center} zoom={13} style={{ height: "480px" }}>
      <TileLayer
        attribution={
          !!position
            ? `Координаты: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
            : ""
        }
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterAutomatically lat={position.lat} lng={position.lng} />
      <CircleMarker
        className="n h-[150px] w-[150px]"
        center={position}
        radius={10}
        color="transparent"
        fillColor="red"
        fillOpacity={0.5}
      >
        <Popup className="-mt-5 h-[50px] w-[180px]">
          <p className="text-[15px]">Вы здесь</p>
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
export default Map;
