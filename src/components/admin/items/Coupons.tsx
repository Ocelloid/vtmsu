import CouponForm from "~/components/modals/CouponForm";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import { FaPencilAlt, FaTrashAlt, FaCopy } from "react-icons/fa";
import { Button } from "@nextui-org/react";

export default function Coupons() {
  const {
    data: coupons,
    isLoading: couponsLoading,
    refetch: refetchCoupons,
  } = api.util.getAllCoupons.useQuery();
  const { mutate: deleteCoupon } = api.util.deleteCoupon.useMutation();

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Вы уверены, что хотите удалить этот купон?",
    );
    if (!confirm) return;
    deleteCoupon({ id });
    void refetchCoupons();
  };

  if (couponsLoading) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-2 pt-2">
      <CouponForm onRefetch={refetchCoupons} />
      {coupons?.map((c) => (
        <div
          key={c.id}
          className="flex w-auto flex-row items-center justify-between rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
        >
          <div className="flex flex-col gap-1">
            <p>{c.name}</p>
            <Button
              size="sm"
              variant="light"
              className="flex w-min flex-row items-center gap-1 text-sm text-gray-500"
              onClick={() => navigator.clipboard.writeText(c.address)}
            >
              Адрес купона: {c.address} <FaCopy size={12} />
            </Button>
            <p className="text-sm text-gray-500">
              {c.usage < 0 ? "Безлимит" : `Осталось использований: ${c.usage}`}
            </p>
          </div>
          <div className="flex flex-row gap-1">
            <Button
              variant="light"
              size="sm"
              className="flex min-w-10 flex-row gap-0 bg-transparent text-black dark:text-red-100"
              onClick={() => handleDelete(c.id)}
            >
              <FaTrashAlt size={12} />
            </Button>
            <CouponForm editId={c.id} onRefetch={refetchCoupons}>
              <FaPencilAlt />
            </CouponForm>
          </div>
        </div>
      ))}
    </div>
  );
}
