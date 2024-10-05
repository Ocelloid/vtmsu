"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

export default function WIP() {
  const [openWIP, setOpenWIP] = useState(false);
  const { data: appData } = api.util.getAppData.useQuery();
  useEffect(() => {
    if (!!appData && appData.wip) setOpenWIP(true);
  }, [appData]);
  if (openWIP) {
    return (
      <Image
        src="/wip.png"
        alt="wip"
        layout="fill"
        objectFit="none"
        className="z-[10000]"
      />
    );
  }
}
