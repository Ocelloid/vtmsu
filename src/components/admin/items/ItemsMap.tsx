import "leaflet/dist/leaflet.css";
import { MapControl } from "~/components/map";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Item } from "~/server/api/routers/item";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const marker_icon = L.icon({ iconUrl: "/map-marker.png" });

export default function ItemsMap({ items }: { items: Item[] }) {
  return (
    <MapContainer
      center={[58.0075, 56.23]}
      zoom={13.5}
      style={{ height: "480px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapControl />
      {items.map((item) => (
        <Marker
          key={item.id}
          position={[item.coordY ?? 0, item.coordX ?? 0]}
          icon={marker_icon}
        >
          <Popup>
            <div className="flex flex-col items-center gap-0">
              <span>
                {item.id}: {item.name}
              </span>
              <div dangerouslySetInnerHTML={{ __html: item.content ?? "" }} />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
