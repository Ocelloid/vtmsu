import { Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useMemo, useRef, useEffect } from "react";
import L, {
  type LatLng,
  type LatLngExpression,
  type Marker as LeafletMarker,
} from "leaflet";

const target_icon = L.icon({ iconUrl: "/crosshair.png" });

export const MapControl = () => {
  // const map = useMapEvents({
  //   loading() {
  //     map.locate();
  //   },
  //   locationfound(e) {
  //     map.flyTo(e.latlng, map.getZoom());
  //   },
  // });
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

export const RecenterAutomatically = ({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};
