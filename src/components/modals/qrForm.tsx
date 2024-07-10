import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { FaQrcode } from "react-icons/fa";
import { LoadingSpinner } from "~/components/Loading";
import DefaultEditor from "~/components/editors/DefaultEditor";

const QRForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");

  const { mutate: createMutation, isPending } = api.item.create.useMutation();

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  const handleFormSubmit = () => {
    createMutation(
      { name: title, content: description },
      {
        onSuccess() {
          resetForm();
          setIsModalOpen(false);
        },
      },
    );
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
        size="2xl"
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Оформить заказ</ModalHeader>
          <ModalBody>
            <Input
              variant="underlined"
              label="Название"
              placeholder="Введите название"
              value={title}
              onValueChange={setTitle}
            />
            <DefaultEditor
              label="Контент"
              className="min-h-44 sm:min-h-20"
              initialContent={description}
              onUpdate={setDescription}
              placeholder="Введите контент, который игрок увидит, просканировав QR-код"
            />
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
              isDisabled={isPending || !title || !description}
              onClick={handleFormSubmit}
            >
              {isPending ? <LoadingSpinner /> : "Сохранить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="flex w-full flex-row gap-0 rounded-none bg-transparent text-black dark:text-red-100"
      >
        <FaQrcode size={24} />
        &nbsp;Добавить код
      </Button>
    </>
  );
};

export default QRForm;
