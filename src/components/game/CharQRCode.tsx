import QRCode from "qrcode";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { FaQrcode } from "react-icons/fa";
import type { Character } from "~/server/api/routers/char";
import EffectsPage from "~/components/game/EffectsPage";
import { LoadingPage } from "~/components/Loading";
import QRScanner from "~/components/QRScanner";

export default function CharQRCode({ char }: { char: Character }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scannedChar, setScannedChar] = useState<Character>();
  const { data: chars, isLoading: charsLoading } = api.char.getAll.useQuery();

  useEffect(() => {
    if (!charsLoading)
      QRCode.toCanvas(
        document.getElementById("canvas"),
        char.id + "-" + Date.now(),
        {
          width: 256,
          margin: 1,
        },
        function (error) {
          if (error) console.error(error);
        },
      );
  }, [char, charsLoading]);

  const handleScanSuccess = (decodedText: string) => {
    if (!chars) {
      alert("Отсутствует список персонажей");
      return;
    }
    if (!decodedText) {
      alert("QR-код пуст");
      return;
    }
    const charId = decodedText.split("-")[0];
    const timecode = decodedText.split("-")[1];
    if (!charId) {
      alert("Отсутствует ID персонажа");
      return;
    }
    if (!timecode) {
      alert("Отсутствует таймкод");
      return;
    }
    const diffMs = Date.now() - Number(timecode);
    if (diffMs > 1000 * 60 * 60) {
      alert("QR-код устарел");
      return;
    }
    const scanned = chars.find((c) => c.id === Number(charId));
    if (!scanned) {
      alert("Персонаж не найден");
      return;
    }
    setScannedChar(scanned);
  };

  if (charsLoading) return <LoadingPage />;

  const now = new Date();
  const hasAuspex = char?.effects
    ?.filter((e) => (e.expires?.getTime() ?? now.getTime()) - now.getTime() > 0)
    .find((e) => e.effect?.name.includes("Прорицание"));

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        size="full"
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6 z-[1001]",
          wrapper: "z-[1001]",
          backdrop: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Сканировать код</ModalHeader>
          <ModalBody>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(e) => console.error(e)}
            />
            {!!scannedChar && (
              <div className="flex w-full flex-col">
                <p>Информация о персонаже {scannedChar.name}:</p>
                <p>
                  {char.alive
                    ? char.bloodAmount === 0 || char.health === 0
                      ? "Торпор"
                      : "Персонаж нежив"
                    : "Финальная смерть"}
                </p>
                {!!hasAuspex && (
                  <div className="flex w-full flex-col">
                    Эффекты персонажа в ауре:
                    <EffectsPage char={scannedChar} auspex={true} />
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-row justify-center gap-2">
            <Button color="success" onClick={onClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <p className="text-justify text-sm">
        Это код вашего персонажа. Он может быть использован для передачи
        предметов, предприятий, очков влияния, скана ауры или применения
        эффектов. В случае гибели персонажа он используется для лута и диаблери.
      </p>
      <canvas id="canvas" className="mx-auto"></canvas>
      <Button
        onClick={() => {
          setScannedChar(undefined);
          onOpen();
        }}
        variant="ghost"
        color="warning"
        className="mx-auto mb-auto max-w-64"
      >
        <FaQrcode size={24} /> Сканировать чужой QR-код
      </Button>
    </>
  );
}
