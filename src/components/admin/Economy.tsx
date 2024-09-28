import { Tabs, Tab } from "@nextui-org/react";
import BankAccounts from "./economy/BankAccounts";
import Companies from "./economy/Companies";

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
