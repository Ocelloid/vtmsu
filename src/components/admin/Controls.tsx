import { Checkbox, Input, Button } from "@nextui-org/react";
import type { AppData } from "~/server/api/routers/util";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

export default function Controls() {
  const { mutate: setAppData, isPending } = api.util.setAppData.useMutation();
  const { data: appData, isLoading: isAppDataLoading } =
    api.util.getAppData.useQuery();
  const [data, setData] = useState<AppData>({
    id: 0,
    createAllowed: false,
    editAllowed: false,
    gameAllowed: false,
    ticketsLimit: 3,
    changedById: "",
  });
  useEffect(() => {
    if (appData) setData(appData);
  }, [appData]);

  if (isAppDataLoading) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-2 py-2">
      <Input
        variant="underlined"
        value={data.ticketsLimit.toString()}
        onChange={(e) =>
          setData({ ...data, ticketsLimit: Number(e.target.value) })
        }
        label="Предел заявок в день"
        placeholder="Введите число"
        type="number"
      />
      <Checkbox
        isSelected={data.createAllowed}
        onChange={(e) => setData({ ...data, createAllowed: e.target.checked })}
      >
        Разрешить создавать персонажей
      </Checkbox>
      <Checkbox
        isSelected={data.editAllowed}
        onChange={(e) => setData({ ...data, editAllowed: e.target.checked })}
      >
        Разрешить редактировать персонажей
      </Checkbox>
      <Checkbox
        isSelected={data.gameAllowed}
        onChange={(e) => setData({ ...data, gameAllowed: e.target.checked })}
      >
        Разрешить игровой режим
      </Checkbox>
      <Button
        variant="bordered"
        onClick={() => setAppData(data)}
        isDisabled={isPending}
      >
        Сохранить
      </Button>
    </div>
  );
}
