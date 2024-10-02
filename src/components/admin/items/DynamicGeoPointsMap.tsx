import dynamic from "next/dynamic";
const DynamicGeoPointsMap = dynamic(
  () => import("~/components/admin/items/GeoPointsMap"),
  {
    ssr: false,
  },
);
export default DynamicGeoPointsMap;
