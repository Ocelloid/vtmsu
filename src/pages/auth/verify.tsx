import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Verify() {
  const router = useRouter();
  const { data: session } = useSession();
  if (session) void router.replace("/settings");
  return (
    <>
      <Head>
        <title>Маскарад Вампиров</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-full w-full items-center justify-center ">
        <Card className="max-w-sm bg-red-950/50 text-red-100">
          <CardHeader className="justify-center text-center text-xl font-semibold">
            Подтверждение почты
          </CardHeader>
          <CardBody className="justify-center text-center">
            На вашу электронную почту выслано письмо с ссылкой для подтверждения
          </CardBody>
        </Card>
      </main>
    </>
  );
}
