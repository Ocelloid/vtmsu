import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { clans, factions } from "~/assets";
import { useTheme } from "next-themes";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading";

const BGImage = () => {
  const { theme } = useTheme();
  const { data: sessionData } = useSession();
  const defaultBackground =
    theme === "light" ? factions._ankh : factions._ankh_white;
  const [background, setBackground] = useState<string>("_ankh");
  const clanKeys = Object.keys(clans);
  const factionKeys = Object.keys(factions);
  const clanSelection = Object.values(clans).map((clan, i) => {
    if (theme === "light" && !clanKeys[i]?.includes("_white"))
      return { value: clanKeys[i] ?? "", image: clan };
    if (theme === "dark" && clanKeys[i]?.includes("_white"))
      return { value: clanKeys[i] ?? "", image: clan };
    else return undefined;
  });

  const factionSelection = Object.values(factions).map((faction, i) => {
    if (theme === "light" && !factionKeys[i]?.includes("_white"))
      return { value: factionKeys[i] ?? "", image: faction };
    if (theme === "dark" && factionKeys[i]?.includes("_white"))
      return { value: factionKeys[i] ?? "", image: faction };
    else return undefined;
  });

  const bgSelection = [...factionSelection, ...clanSelection].filter(
    (x) => x !== undefined,
  );

  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = api.user.getCurrent.useQuery(undefined, { enabled: !!sessionData });

  useEffect(() => {
    if (!!userData) {
      const bg = userData.background!;
      setBackground(bg + (theme === "dark" ? "_white" : ""));
    }
  }, [userData, theme]);

  useEffect(() => {
    if (!!sessionData) void refetchUser();
  }, [sessionData, refetchUser]);

  console.log(defaultBackground);

  return (
    <div className="fixed -z-50 h-screen w-screen bg-gradient-to-b from-red-100 to-red-400 dark:from-red-800 dark:to-black [&>*]:opacity-10">
      {isUserLoading ? (
        <LoadingPage />
      ) : (
        <Image
          className="mx-auto my-auto mt-32 max-w-80 sm:max-w-96"
          height={640}
          alt="bg"
          src={
            bgSelection.find((bgs) => bgs?.value === background)?.image ??
            defaultBackground
          }
        />
      )}
    </div>
  );
};

export default BGImage;
