"use client";
import { Tabs, Tab } from "@nextui-org/react";
import { LoadingPage } from "~/components/Loading";
import dynamic from "next/dynamic";
import Targets from "~/components/admin/hunting/targets";
import { useState, useEffect } from "react";
import type { HuntingGround, Hunt } from "~/server/api/routers/hunt";
import { api } from "~/utils/api";

const DynamicInstances = dynamic(
  () => import("~/components/admin/hunting/instances"),
  {
    ssr: false,
  },
);

const Hunting = () => {
  const [grounds, setGrounds] = useState<HuntingGround[]>([]);
  const [hunts, setHunts] = useState<Hunt[]>([]);

  const { data: groundsData, isLoading: isGroundsLoading } =
    api.hunt.getAllHuntingGrounds.useQuery();
  const { data: huntsData, isLoading: isHuntsLoading } =
    api.hunt.getAllHunts.useQuery();

  useEffect(() => {
    if (!!groundsData) setGrounds(groundsData);
  }, [groundsData]);
  useEffect(() => {
    if (!!huntsData) setHunts(huntsData);
  }, [huntsData]);

  if (isGroundsLoading || isHuntsLoading) return <LoadingPage />;

  return (
    <>
      <Tabs
        aria-label="hunting"
        variant="underlined"
        classNames={{
          tabList:
            "grid gap-0 grid-cols-4 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-[#dc2626]",
          tab: "max-w-full px-0 h-8",
          base: "w-full bg-danger/10",
          panel: "px-0",
        }}
      >
        <Tab
          key={"targets"}
          className="flex flex-col gap-8 md:gap-2"
          title={
            <div className="flex items-center space-x-2">
              <span>Добыча</span>
            </div>
          }
        >
          <Targets />
        </Tab>
        <Tab
          key={"instances"}
          className="flex flex-col gap-2 md:gap-2"
          title={
            <div className="flex items-center space-x-2">
              <span>Цели</span>
            </div>
          }
        >
          <DynamicInstances />
        </Tab>
        <Tab
          key={"grounds"}
          className="flex flex-col gap-8 md:gap-2"
          title={
            <div className="flex items-center space-x-2">
              <span>Кормушки</span>
            </div>
          }
        ></Tab>
        <Tab
          key={"hunts"}
          className="flex flex-col gap-8 md:gap-2"
          title={
            <div className="flex items-center space-x-2">
              <span>Атаки</span>
            </div>
          }
        ></Tab>
      </Tabs>
    </>
  );
};

export default Hunting;
