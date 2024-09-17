import { LoadingPage } from "~/components/Loading";
import QRForm from "~/components/modals/qrForm";
import { Button } from "@nextui-org/react";
import { FaDownload, FaPencilAlt } from "react-icons/fa";
import { api } from "~/utils/api";
import Link from "next/link";
import QRCode from "qrcode";

export default function QRCodes() {
  const {
    data: itemList,
    isLoading: isItemListLoading,
    refetch: refetchItemList,
  } = api.item.getAll.useQuery();
  const generateQRCode = (url: string) => {
    QRCode.toDataURL(url, { width: 1024, margin: 2 }, (err, url) => {
      if (err) throw err;
      const aEl = document.createElement("a");
      aEl.href = url;
      aEl.download = "QR_Code.png";
      document.body.appendChild(aEl);
      aEl.click();
      document.body.removeChild(aEl);
    });
  };
  if (isItemListLoading) return <LoadingPage />;

  return (
    <>
      <div className="flex flex-col gap-2 pt-2">
        <QRForm onRefetch={refetchItemList} />
        {itemList
          ?.filter((item) => item.typeId === 1)
          .map((item) => (
            <div
              key={item.id}
              className="flex w-auto flex-row items-center justify-between rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
            >
              <div className="gap-full flex w-full flex-row">
                <Link href={`/qr/${item.id}`}>{item.name}</Link>
                <span className="ml-auto px-2">
                  {item.createdAt.toLocaleDateString()}
                </span>
              </div>
              <Button
                size="sm"
                variant="light"
                className="w-10 min-w-10"
                onClick={() => generateQRCode(`https://vtm.su/qr/${item.id}`)}
              >
                <FaDownload />
              </Button>
              <QRForm editId={item.id} onRefetch={refetchItemList}>
                <FaPencilAlt />
              </QRForm>
            </div>
          ))}
      </div>
    </>
  );
}
