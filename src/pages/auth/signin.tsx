import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { FaDiscord, FaYandex, FaVk } from "react-icons/fa";
import { Input, Button } from "@nextui-org/react";
import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  const isEmailInvalid = useMemo(() => {
    if (email === "") return false;
    return email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)
      ? false
      : true;
  }, [email]);

  const flashError = () => {
    setEmailError(true);
    setTimeout(() => setEmailError(false), 1000);
  };

  return (
    <div className="flex h-full w-full items-center justify-center ">
      <Card className="max-w-sm bg-red-950/50 text-red-100">
        <CardHeader className="justify-center text-center text-xl font-semibold">
          Вход в аккаунт
        </CardHeader>
        <CardBody className="justify-center gap-2 text-center">
          Войдите, используя электронную почту или аккаунт в социальных сетях
          <Input
            variant="bordered"
            className="min-w-28 max-w-96"
            aria-label="Email"
            placeholder="Введите электронную почту"
            errorMessage="Некорректный адрес электронной почты"
            isInvalid={emailError}
            value={email}
            onValueChange={setEmail}
          />
          <div
            className="flex flex-col"
            onClick={() => {
              if (isEmailInvalid || !email) flashError();
            }}
          >
            <Button
              variant="solid"
              isDisabled={!email || isEmailInvalid}
              onClick={() =>
                signIn("email", {
                  email,
                  callbackUrl: "/settings",
                  redirect: true,
                })
              }
            >
              Войти
            </Button>
          </div>
          <div className="flex justify-between gap-2">
            <Button
              title="Войти через Discord"
              variant="ghost"
              className="w-full"
              onClick={() =>
                signIn("discord", {
                  callbackUrl: "/settings",
                  redirect: true,
                })
              }
            >
              <FaDiscord size={24} />
            </Button>
            <Button
              title="Войти через ВКонтакте"
              variant="ghost"
              className="w-full"
              onClick={() =>
                signIn("vk", {
                  callbackUrl: "/settings",
                  redirect: true,
                })
              }
            >
              <FaVk size={24} />
            </Button>
            <Button
              title="Войти через Яндекс"
              variant="ghost"
              className="w-full"
              onClick={() =>
                signIn("yandex", {
                  callbackUrl: "/settings",
                  redirect: true,
                })
              }
            >
              <FaYandex size={18} />
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
