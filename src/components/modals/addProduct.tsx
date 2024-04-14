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
import { FaRubleSign, FaPlusCircle } from "react-icons/fa";
import { UploadButton } from "~/utils/uploadthing";

const AddProduct = ({ onClose }: { onClose: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");

  const { mutate: createMutation, isPending } =
    api.shop.createProduct.useMutation({
      onSuccess() {
        onClose();
        setTitle("");
        setStock("");
        setPrice("");
        setImages([]);
        setSubtitle("");
        setDescription("");
        setIsModalOpen(false);
      },
    });

  const handleFormSubmit = () => {
    createMutation({
      title: title,
      description: description,
      subtitle: subtitle,
      price: Number(price),
      stock: Number(stock),
      images: images,
    });
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
          <ModalHeader>Добавить товар</ModalHeader>
          <ModalBody>
            <Input
              variant="underlined"
              label="Название"
              placeholder="Введите название товара"
              value={title}
              onValueChange={setTitle}
            />
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
                <Image key={index} src={image} alt="" width="96" height="96" />
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
                isPending ||
                !title ||
                !stock ||
                !price ||
                !subtitle ||
                !description
              }
              onClick={handleFormSubmit}
            >
              {isPending ? <LoadingSpinner /> : "Добавить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="mt-16 h-80 w-40 flex-col gap-0 rounded-2xl bg-red-950 text-2xl text-red-100 md:w-60"
      >
        <FaPlusCircle size={64} />
        Добавить <br />
        товар
      </Button>
    </>
  );
};

export default AddProduct;
