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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Передача предметов</ModalHeader>
          <ModalBody>
            {!scannedChar ? (
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onScanError={(e) => console.error(e)}
              />
            ) : (
              <>
                {!!hasAuspex && (
                  <div className="flex w-full flex-col">
                    Эффекты персонажа в ауре:
                    <EffectsPage char={scannedChar} />
                  </div>
                )}
              </>
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
        При каждом открытии этой страницы генерируется новый QR-код - сохранять
        старые не нужно, так как они вскоре потеряют действие.
      </p>
      <canvas id="canvas" className="mx-auto"></canvas>
      <Button
        onClick={onOpen}
        variant="ghost"
        color="warning"
        className="mx-auto mb-auto max-w-64"
      >
        <FaQrcode size={24} /> Сканировать чужой QR-код
      </Button>
    </>
  );
}
