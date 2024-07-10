import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function QRPage() {
  const router = useRouter();
  const [itemId, setItemId] = useState("");
  const { data: item, isLoading: isItemLoading } = api.item.getById.useQuery(
    { id: parseInt(itemId) },
    { enabled: !!itemId },
  );
  useEffect(() => {
    if (router.query.pid) setItemId(router.query.pid.toString());
  }, [router.query.pid]);
  if (isItemLoading) return <LoadingPage />;

  return (
    <div
      className="tiptap-display container pt-24 text-justify"
      dangerouslySetInnerHTML={{
        __html: item?.content ?? "",
      }}
    />
  );
}
