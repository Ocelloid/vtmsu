import { Marker, useMapEvents } from "react-leaflet";
import { useState, useMemo, useRef } from "react";
import L, {
  type LatLng,
  type LatLngExpression,
  type Marker as LeafletMarker,
} from "leaflet";

const target_icon = L.icon({ iconUrl: "/crosshair.png" });

export const MapControl = () => {
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      console.log(e, typeof e);
    },
  });
  return null;
};

export const Draggable = ({
  updatePosition,
}: {
  updatePosition: (p: LatLng) => void;
}) => {
  const [position, setPosition] = useState<LatLngExpression>([58.0075, 56.23]);
  const markerRef = useRef<LeafletMarker | null>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!!marker) {
          setPosition(marker.getLatLng());
          updatePosition(marker.getLatLng());
        }
      },
    }),
    [updatePosition],
  );
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      updatePosition(e.latlng);
    },
  });
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      position={position}
      ref={markerRef}
      icon={target_icon}
    />
  );
};
