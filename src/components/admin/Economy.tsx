import { Tabs, Tab } from "@nextui-org/react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";

export default function Economy() {
  return (
    <Tabs
      aria-label="tabs"
      variant="underlined"
      classNames={{
        tabList:
          "gap-0 grid grid-cols-4 md:grid-cols-8 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full bg-[#dc2626]",
        tab: "max-w-full px-0 h-8",
        base: "bg-danger/5 w-full",
        panel: "px-0 py-0",
      }}
    >
      <Tab
        key={"bank_accounts"}
        className="flex flex-col gap-8 md:gap-2"
        title={
          <div className="flex items-center space-x-2">
            <span>Счета</span>
          </div>
        }
      >
        <BankAccounts />
      </Tab>
      <Tab
        key={"companies"}
        className="flex flex-col gap-8 md:gap-2"
        title={
          <div className="flex items-center space-x-2">
            <span>Компании</span>
          </div>
        }
      >
        <Companies />
      </Tab>
    </Tabs>
  );
}

function BankAccounts() {
  const { data: bankAccounts, isLoading } = api.econ.getBankAccounts.useQuery();
  if (isLoading) return <LoadingPage />;
  return (
    <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 xl:grid-cols-4">
      {bankAccounts?.map((bankAccount) => (
        <div
          key={bankAccount.id}
          className="flex w-full flex-col rounded border p-2"
        >
          <div className="text-lg font-bold">Адрес: {bankAccount.address}</div>
          <div className="text-lg font-bold">
            Персонаж: {bankAccount.character.name}
          </div>
          <div className="text-lg font-bold">
            Компания: {bankAccount.company?.name}
          </div>
          <div className="text-muted text-sm">Счёт: {bankAccount.balance}</div>
        </div>
      ))}
    </div>
  );
}

function Companies() {
  const { data: companies, isLoading } = api.econ.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  return (
    <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 xl:grid-cols-4">
      {companies?.map((company) => (
        <div
          key={company.id}
          className="flex w-full flex-col rounded border p-2"
        >
          <div className="text-lg font-bold">Название: {company.name}</div>
          <div className="text-lg font-bold">
            Персонаж: {company.character.name}
          </div>
          <div className="text-muted text-sm">
            Счета:
            {company.BankAccount?.map((bankAccount) => (
              <div key={bankAccount.id} className="flex flex-col gap-2">
                <div className="text-lg font-bold">
                  Адрес: {bankAccount.address}
                </div>
                <div className="text-muted text-sm">
                  Счёт: {bankAccount.balance}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
