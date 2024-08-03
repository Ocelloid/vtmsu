import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Navigation from "~/components/Navigation";
import BGImage from "~/components/BGImage";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <SessionProvider session={session}>
          <main className={`font-sans ${inter.variable} flex flex-1 flex-grow`}>
            <meta name="HandheldFriendly" content="true" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
            <BGImage />
            <Component {...pageProps} />
            <Navigation />
            {/* <div
              className="relative h-[160px] md:h-[80px]"
              style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
            > */}
            <div className="mb-6" />
            <div className="fixed bottom-0 flex h-6 w-full flex-col justify-between bg-slate-950 px-12 py-1 text-slate-400">
              <a
                href="https://ocelloid.com"
                target="_blank"
                className="ml-auto text-xs"
              >
                © Ocelloid 2024
              </a>
            </div>
            {/* </div> */}
          </main>
        </SessionProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
