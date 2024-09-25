import QrReader from "react-qr-reader-es6";
import { useEffect, useState } from "react";

export default function QRScanner({
  onScanSuccess,
  onScanError,
}: {
  onScanSuccess: (data: string) => void;
  onScanError: (error: string) => void;
}) {
  const [scan, setScan] = useState<string | null>(null);
  useEffect(() => {
    if (!!scan) {
      onScanSuccess(scan);
    }
  }, [onScanSuccess, scan]);
  return (
    <QrReader
      delay={300}
      onError={onScanError}
      onScan={(e) => setScan(e)}
      style={{ width: "50%", marginLeft: "auto", marginRight: "auto" }}
    />
  );
}
