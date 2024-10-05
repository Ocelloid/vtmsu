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
import Footer from "~/components/Footer";
import WIP from "~/components/WIP";

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
          <WIP />
          <main
            className={`font-sans ${inter.variable} flex flex-1 flex-grow flex-col`}
          >
            <meta name="HandheldFriendly" content="true" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
            <BGImage />
            <Component {...pageProps} />
            <Navigation />
            <Footer />
          </main>
        </SessionProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
