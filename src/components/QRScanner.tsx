import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function QRScanner({
  onScanSuccess,
  onScanError,
}: {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}) {
  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-scanner",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      true,
    );

    html5QrcodeScanner.render(handleSuccess, onScanError);

    function handleSuccess(decodedText: string) {
      void html5QrcodeScanner.clear();
      onScanSuccess(decodedText);
    }

    return () => {
      void html5QrcodeScanner.clear();
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-scanner" />;
}
