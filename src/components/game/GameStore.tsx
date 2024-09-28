import type { Character } from "~/server/api/routers/char";
import type { Item, ItemType } from "~/server/api/routers/item";
import { LoadingPage } from "~/components/Loading";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import Image from "next/image";
import { api } from "~/utils/api";

export default function GameStore({ char }: { char: Character }) {
  const [purchase, setPurchase] = useState<ItemType>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    data: items,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = api.item.getPurchasables.useQuery();
  const { mutate: purchaseItem, isPending: isPurchasePending } =
    api.item.purchase.useMutation();

  const handlePurchase = () => {
    if (!purchase?.id) return;
    purchaseItem(
      { id: purchase.id, charId: char.id },
      {
        onSuccess(res: { message: string; item: Item | undefined }) {
          if (res?.message) alert(res.message);
          if (!!res.item) {
            setPurchase(undefined);
            void refetchItems();
            onClose();
          } else {
            void refetchItems();
            alert(res.message);
          }
        },
      },
    );
  };

  if (itemsLoading) return <LoadingPage />;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Покупка</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <div className="h-16 w-16">
                  <Image
                    src={purchase?.image ?? ""}
                    alt="item pic"
                    width="96"
                    height="96"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="font-bold">{purchase?.name}</div>
                  <div className="text-sm text-gray-500">
                    Стоимость: {purchase?.cost} ОВ
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button
              color="danger"
              onClick={() => {
                setPurchase(undefined);
                onClose();
              }}
            >
              Отменить
            </Button>
            <Button
              color="success"
              onClick={handlePurchase}
              isDisabled={isPurchasePending}
            >
              Купить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="grid grid-cols-1 flex-wrap gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items?.map((item) => (
          <Button
            key={item.id}
            onClick={() => {
              setPurchase(item);
              onOpen();
            }}
            className="flex h-16 flex-row items-center justify-start gap-2"
          >
            {!!item.image && (
              <div className="h-16 w-16">
                <Image src={item.image} alt="item pic" width="96" height="96" />
              </div>
            )}
            <div className="flex flex-col items-start gap-1">
              <div className="font-bold">{item.name}</div>
              <div className="text-sm text-gray-500">
                Стоимость: {item.cost} ОВ
              </div>
            </div>
          </Button>
        ))}
      </div>
    </>
  );
}
