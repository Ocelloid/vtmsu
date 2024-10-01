import dynamic from "next/dynamic";
const DynamicCompaniesMap = dynamic(
  () => import("~/components/admin/economy/CompaniesMap"),
  {
    ssr: false,
  },
);
export default DynamicCompaniesMap;
