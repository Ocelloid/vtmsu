import ItemForm from "~/components/modals/ItemForm";
import DynamicItemsMap from "~/components/admin/items/DynamicItemsMap";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { Button } from "@nextui-org/react";

export default function Items() {
  const {
    data: items,
    isLoading: isItemsLoading,
    refetch: refetchItems,
  } = api.item.getAll.useQuery();
  const { mutate: deleteItem } = api.item.delete.useMutation();

  const handleDelete = async (id: number) => {
    const confirm = window.confirm(
      "Вы уверены, что хотите удалить этот предмет?",
    );
    if (!confirm) return;
    deleteItem({ id });
    void refetchItems();
  };

  if (isItemsLoading) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-2 pt-2">
      <ItemForm onRefetch={refetchItems} />
      <DynamicItemsMap
        items={items?.filter((i) => i.ownedById === null) ?? []}
      />
      {items?.map((item) => (
        <div
          key={item.id}
          className="flex w-auto flex-row items-center justify-between rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
        >
          <div className="flex flex-col gap-1">
            <p>{item.name}</p>
            <p className="text-sm text-gray-500">{item.type?.name}</p>
          </div>
          <div className="flex flex-row gap-1">
            <Button
              variant="light"
              size="sm"
              className="flex min-w-10 flex-row gap-0 bg-transparent text-black dark:text-red-100"
              onClick={() => handleDelete(item.id)}
            >
              <FaTrashAlt size={12} />
            </Button>
            <ItemForm editId={item.id} onRefetch={refetchItems}>
              <FaPencilAlt />
            </ItemForm>
          </div>
        </div>
      ))}
    </div>
  );
}
