import ItemTypeForm from "~/components/modals/ItemTypeForm";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import { FaPencilAlt } from "react-icons/fa";

export default function ItemTypes() {
  const {
    data: itemTypes,
    isLoading: isItemTypesLoading,
    refetch: refetchItemTypes,
  } = api.item.getAllTypes.useQuery();
  if (isItemTypesLoading) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-2 pt-2">
      <ItemTypeForm onRefetch={refetchItemTypes} />
      {itemTypes?.map((itemType) => (
        <div
          key={itemType.id}
          className="flex w-auto flex-row items-center justify-between rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
        >
          <p>{itemType.name}</p>
          <ItemTypeForm editId={itemType.id} onRefetch={refetchItemTypes}>
            <FaPencilAlt />
          </ItemTypeForm>
        </div>
      ))}
    </div>
  );
}
