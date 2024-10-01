import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Circle,
  Popup,
} from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { RecenterAutomatically } from "~/components/map";
import { api } from "~/utils/api";
import type { HuntingInstance } from "~/server/api/routers/hunt";
import { LoadingPage } from "~/components/Loading";
import { GiVampireCape } from "react-icons/gi";

const skull_icon = L.icon({ iconUrl: "/skull.png" });
const cape_icon = L.icon({ iconUrl: "/cape.png" });
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

function Map({ center }: { center: { lat: number; lng: number } }) {
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  const [instances, setInstances] = useState<HuntingInstance[]>([]);
  const { data: huntingInstances, isLoading: isHuntingInstancesLoading } =
    api.hunt.getAllHuntingInstances.useQuery(undefined, {
      refetchInterval: 10000,
    });

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

  useEffect(() => {
    if (!!huntingInstances) setInstances(huntingInstances);
  }, [huntingInstances]);

  useEffect(() => {
    setTimeout(() => {
      const red = document.getElementsByClassName("animate-pulse");
      for (const item of red) {
        if (!!item)
          (item as HTMLElement).style.animationDuration =
            Math.random() * 5 + 1 + "s";
      }
    }, 250);
  }, []);

  if (isHuntingInstancesLoading) return <LoadingPage />;

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
        {instances
          .filter(
            (i) =>
              (!!i.expires ? i.expires < new Date() : true) &&
              i.isVisible &&
              i.remains! > 1,
          )
          .map((instance) => (
            <Circle
              key={instance.id}
              center={[instance.coordY, instance.coordX]}
              pathOptions={{
                color: "transparent",
                opacity: 0.05,
                fillColor: "red",
                className: "animate-pulse",
              }}
              fillOpacity={0.05}
              radius={100 * instance.remains!}
            />
          ))}
        {instances
          .filter(
            (i) =>
              (!!i.expires ? i.expires < new Date() : true) &&
              i.isVisible &&
              i.remains! <= 1,
          )
          .map((instance) => (
            <Marker
              key={instance.id}
              position={[instance.coordY, instance.coordX]}
              icon={skull_icon}
            >
              <Popup>
                <div className="flex flex-col items-center gap-0">
                  <span>{instance.target?.name}</span>
                  <span className="pb-1 text-xs">Нарушение маскарада</span>
                  <span>
                    {
                      instance.target?.descs![
                        (instance.target?.descs?.length ?? 0) - 1
                      ]?.content
                    }
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        {!!position && (
          <Marker position={position} icon={cape_icon}>
            <GiVampireCape />
            <Popup className="-mt-5 h-[50px] w-[180px]">
              <p className="text-[15px]">Вы здесь</p>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
export default Map;
