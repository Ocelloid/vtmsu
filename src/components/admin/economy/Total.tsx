import { api } from "~/utils/api";

export default function Total() {
  const { data: bankAccounts } = api.econ.getBankAccounts.useQuery(undefined, {
    refetchInterval: 180000,
  });

  const testIds: number[] = [5, 6, 61, 89, 131, 144];
  const nonTestAccounts =
    bankAccounts?.filter((a) => !testIds.includes(a.characterId)) ?? [];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between border-b-1">
        <p>Всего:</p>
        {nonTestAccounts
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Тремер:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 2)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Тореадор:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 3)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Гангрел:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 4)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Ассамит:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 5)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Вентру:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 6)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Носферату:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 7)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Малкавиан:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 8)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Бруха:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 9)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
      <div className="flex flex-row justify-between border-b-1">
        <p>Каитиф:</p>
        {nonTestAccounts
          .filter((a) => a.character.clanId === 12)
          .reduce((acc, curr) => acc + curr.balance, 0)
          .toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
      </div>
    </div>
  );
}
