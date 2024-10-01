import "leaflet/dist/leaflet.css";
import { MapControl } from "~/components/map";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Company } from "~/server/api/routers/econ";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const marker_icon = L.icon({ iconUrl: "/map-marker.png" });

export default function CompaniesMap({ companies }: { companies: Company[] }) {
  return (
    <MapContainer
      center={[58.0075, 56.23]}
      zoom={13.5}
      style={{ height: "480px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapControl />
      {companies.map((company) => (
        <Marker
          key={company.id}
          position={[company.coordY, company.coordX]}
          icon={marker_icon}
        >
          <Popup>
            <div className="flex flex-col items-center gap-0">
              <span>{company.name}</span>
              <div dangerouslySetInnerHTML={{ __html: company.content }} />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
