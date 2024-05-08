import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Discord() {
  const router = useRouter();
  useEffect(() => {
    void router.push(
      `https://discord.gg/y63xx7vw4M`,
      `https://discord.gg/y63xx7vw4M`,
      { shallow: false },
    );
  }, [router]);
  return;
}
