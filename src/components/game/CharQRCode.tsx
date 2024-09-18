import QRCode from "qrcode";
import { useEffect } from "react";

export default function CharQRCode({ id }: { id: number }) {
  useEffect(() => {
    QRCode.toCanvas(
      document.getElementById("canvas"),
      id + "-" + Date.now(),
      {
        width: 256,
        margin: 1,
      },
      function (error) {
        if (error) console.error(error);
        console.log("success!");
      },
    );
  }, [id]);
  return <canvas id="canvas" className="m-auto"></canvas>;
}
