import dynamic from "next/dynamic";
const DynamicItemsMap = dynamic(
  () => import("~/components/admin/items/ItemsMap"),
  {
    ssr: false,
  },
);
export default DynamicItemsMap;
