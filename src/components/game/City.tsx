import DefaultMap from "~/components/DefaultMap";
import { Button } from "@nextui-org/react";

export default function City() {
  return (
    <div className="flex h-full w-full flex-col gap-1">
      <DefaultMap center={{ lat: 58.0075, lng: 56.23 }} />
      <Button size="sm" color="warning" variant="faded">
        Осмотреться
      </Button>
    </div>
  );
}
