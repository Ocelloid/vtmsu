import { Checkbox, Input, Button } from "@nextui-org/react";
import type { AppData } from "~/server/api/routers/util";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

export default function Controls() {
  const [allowPush, setAllowPush] = useState(false);
  const { mutate: setAppData, isPending } = api.util.setAppData.useMutation();
  const { mutate: sunrise, isPending: isSunrisePending } =
    api.util.sunrise.useMutation();
  const { data: appData, isLoading: isAppDataLoading } =
    api.util.getAppData.useQuery();
  const { data: companyBalances } = api.util.pushCompanyBalances.useQuery(
    undefined,
    {
      enabled: !!allowPush,
      refetchInterval: 90000,
    },
  );

  useEffect(() => {
    console.log(companyBalances);
  }, [companyBalances]);

  const [data, setData] = useState<AppData>({
    id: 0,
    createAllowed: false,
    editAllowed: false,
    gameAllowed: false,
    ticketsLimit: 3,
    changedById: "",
    radius: 100,
    frequency: 30,
  });
  useEffect(() => {
    if (appData) setData(appData);
  }, [appData]);

  if (isAppDataLoading) return <LoadingPage />;
  return (
    <div className="flex h-full flex-col gap-2 py-2 pb-4">
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
      <Input
        variant="underlined"
        value={data.radius.toString()}
        onChange={(e) => setData({ ...data, radius: Number(e.target.value) })}
        label="Радиус действия геоточек"
        placeholder="Введите число"
        type="number"
      />
      <Input
        variant="underlined"
        value={data.frequency.toString()}
        onChange={(e) =>
          setData({ ...data, frequency: Number(e.target.value) })
        }
        label="Частота охоты в минутах"
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
      <Checkbox
        isSelected={allowPush}
        onChange={(e) => setAllowPush(e.target.checked)}
      >
        Запустить продвижение предприятий костылём из этого браузера
      </Checkbox>
      <Button
        variant="bordered"
        className="mt-auto"
        onClick={() => {
          const confirmed = confirm(
            "Вы уверены, что хотите продвинуть день вперёд?",
          );
          if (confirmed) sunrise();
        }}
        isDisabled={isSunrisePending}
      >
        Продвинуть день вперёд
      </Button>
    </div>
  );
}
