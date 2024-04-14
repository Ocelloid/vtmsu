import {
  Button,
  Input,
  Image,
  Textarea,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/Loading";
import { FaTrashAlt, FaRubleSign, FaPencilAlt } from "react-icons/fa";
import type { Product } from "~/server/api/routers/shop";
import { UploadButton } from "~/utils/uploadthing";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";

const EditProduct = ({
  onClose,
  product,
}: {
  onClose: () => void;
  product: Product;
}) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState(product.description ?? "");
  const [subtitle, setSubtitle] = useState(product.subtitle ?? "");
  const [images, setImages] = useState<string[]>(
    product.images.map((image) => image.source),
  );
  const [title, setTitle] = useState(product.title);
  const [stock, setStock] = useState(product.stock.toString());
  const [price, setPrice] = useState(product.price.toString());
  const router = useRouter();

  const { mutate: updateMutation, isPending: isUpdatePending } =
    api.shop.updateProduct.useMutation();

  const { mutate: deleteMutation } = api.shop.deleteProduct.useMutation();

  const handleProductDelete = () => {
    const confirmDeletion = confirm("Удалить товар?");
    if (confirmDeletion)
      deleteMutation(
        { id: product.id },
        {
          async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: ["product"] });
            setIsModalOpen(false);
            void router.replace("/shop");
          },
        },
      );
  };

  const handleFormSubmit = () => {
    updateMutation(
      {
        id: product.id,
        title: title,
        description: description,
        subtitle: subtitle,
        price: Number(price),
        stock: Number(stock),
        images: images,
      },
      {
        async onSuccess() {
          onClose();
          await queryClient.invalidateQueries({ queryKey: ["product"] });
          setIsModalOpen(false);
        },
      },
    );
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={onClose}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
        size="2xl"
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6",
          base: "bg-red-950 bg-opacity-95 text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Редактировать товар</ModalHeader>
          <ModalBody>
            <div className="flex flex-row gap-2">
              <Input
                variant="underlined"
                label="Название"
                placeholder="Введите название товара"
                value={title}
                onValueChange={setTitle}
              />
              <Button
                onClick={handleProductDelete}
                color="danger"
                className="h-14"
              >
                <FaTrashAlt size={32} />
              </Button>
            </div>
            <div className="flex flex-row gap-2">
              <Input
                type="number"
                variant="underlined"
                label="Количество"
                placeholder="0.00"
                value={stock}
                onValueChange={setStock}
              />
              <Input
                type="number"
                variant="underlined"
                label="Цена"
                placeholder="0.00"
                value={price}
                onValueChange={setPrice}
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <FaRubleSign />
                  </div>
                }
              />
            </div>
            <Input
              variant="underlined"
              label="Краткое описание"
              placeholder="Введите краткое описание"
              value={subtitle}
              onValueChange={setSubtitle}
            />
            <Textarea
              variant="bordered"
              label="Полное описание"
              placeholder="Введите полное описание"
              value={description}
              onValueChange={setDescription}
            />
            <div className="flex flex-row-reverse gap-2">
              <UploadButton
                content={{
                  button: "Загрузить",
                  allowedContent: "Изображение (1 Мб)",
                }}
                className="cursor-pointer"
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  setImages([...images, res[0]?.url ?? ""]);
                }}
              />
              {images.map((image, index) => (
                <div key={index} className="group">
                  <Button
                    color="danger"
                    onClick={() =>
                      setImages(images.filter((source) => source !== image))
                    }
                    className="absolute z-50 h-6 min-h-0 w-6 min-w-0 p-1 opacity-0 group-hover:opacity-75"
                  >
                    x
                  </Button>
                  <Image src={image} alt="" width="96" height="96" />
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="mr-auto"
            >
              Отменить
            </Button>
            <Button
              variant="solid"
              color="success"
              isDisabled={
                isUpdatePending ||
                !title ||
                !stock ||
                !price ||
                !subtitle ||
                !description
              }
              onClick={handleFormSubmit}
            >
              {isUpdatePending ? <LoadingSpinner /> : "Обновить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="mb-2 w-full flex-row gap-2 rounded-lg bg-red-100 text-red-950"
      >
        <FaPencilAlt size={24} />
        Редактировать товар
      </Button>
    </>
  );
};

export default EditProduct;
