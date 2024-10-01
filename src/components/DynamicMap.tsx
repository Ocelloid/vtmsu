import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
} from "react-leaflet";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { RecenterAutomatically } from "~/components/map";

function Map({ center }: { center: { lat: number; lng: number } }) {
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  const cityBorders = [
    new LatLng(57.984261983475534, 56.15550041198731),
    new LatLng(57.99408935391382, 56.157903671264656),
    new LatLng(57.99572698684907, 56.16657257080079),
    new LatLng(58.00345924168589, 56.16906166076661),
    new LatLng(58.00382307136166, 56.16253852844238),
    new LatLng(58.00659715104656, 56.16331100463868),
    new LatLng(58.01282667756441, 56.16356849670411),
    new LatLng(58.02873660320649, 56.27188682556153),
    new LatLng(58.02241893691665, 56.285276412963874),
    new LatLng(58.01705486238637, 56.292743682861335),
    new LatLng(58.0100985512297, 56.29411697387696),
    new LatLng(58.00782495374456, 56.30012512207032),
    new LatLng(58.004550719619765, 56.29755020141602),
    new LatLng(57.99513562803938, 56.30484580993653),
    new LatLng(57.9873560760959, 56.29231452941895),
    new LatLng(57.985445050445875, 56.26956939697266),
    new LatLng(57.98499002931178, 56.24373435974122),
    new LatLng(57.98576356180083, 56.23643875122071),
    new LatLng(57.984762516577405, 56.226911544799805),
    new LatLng(57.97044906155012, 56.171636581420906),
    new LatLng(57.984261983475534, 56.15550041198731),
  ];
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
    <div style={{ height: "100%", width: "100%", borderRadius: "0.25rem" }}>
      <MapContainer
        style={{ height: "100%", width: "100%", borderRadius: "0.25rem" }}
        center={center}
        zoom={15}
      >
        <TileLayer
          attribution={
            !!position
              ? `Координаты: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
              : ""
          }
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          smoothFactor={3}
          pathOptions={{ color: "red", dashArray: "10, 10", dashOffset: "10" }}
          positions={cityBorders}
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
    </div>
  );
}
export default Map;
