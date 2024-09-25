import QRCode from "qrcode";
import { useEffect } from "react";

export default function CharQRCode({ characterId }: { characterId: number }) {
  useEffect(() => {
    QRCode.toCanvas(
      document.getElementById("canvas"),
      characterId + "-" + Date.now(),
      {
        width: 256,
        margin: 1,
      },
      function (error) {
        if (error) console.error(error);
      },
    );
  }, [characterId]);
  return <canvas id="canvas" className="m-auto"></canvas>;
}
