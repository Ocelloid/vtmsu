import { Card, CardBody, CardHeader } from "@nextui-org/react";

export default function Verify() {
  return (
    <div className="flex h-full w-full items-center justify-center ">
      <Card className="max-w-sm bg-red-950/50 text-red-100">
        <CardHeader className="justify-center text-center text-xl font-semibold">
          Подтверждение почты
        </CardHeader>
        <CardBody className="justify-center text-center">
          На вашу электронную почту выслано письмо с ссылкой для подтверждения
        </CardBody>
      </Card>
    </div>
  );
}
