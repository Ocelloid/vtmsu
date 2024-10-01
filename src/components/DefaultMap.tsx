import dynamic from "next/dynamic";
const DefaultMap = dynamic(() => import("./DynamicMap"), {
  ssr: false,
});
export default DefaultMap;
