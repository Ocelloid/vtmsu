import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { FaQrcode } from "react-icons/fa";
import { LoadingSpinner } from "~/components/Loading";
import { type ReactNode, useState, useEffect } from "react";
import DefaultEditor from "~/components/editors/DefaultEditor";

const QRForm = ({
  editId,
  children,
  onRefetch,
}: {
  editId?: number;
  children?: ReactNode;
  onRefetch?: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [hackerData, setHackerData] = useState("");
  const [auspexData, setAuspexData] = useState("");
  const [animalismData, setAnimalismData] = useState("");
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");

  const { mutate: createMutation, isPending } = api.item.create.useMutation();
  const { mutate: updateMutation, isPending: isPendingUpdate } =
    api.item.update.useMutation();
  const { data: item, isLoading: isItemLoading } = api.item.getById.useQuery(
    {
      id: editId!,
    },
    { enabled: !!editId },
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  useEffect(() => {
    if (!!item) {
      setTitle(item?.name ?? "");
      setDescription(item?.content ?? "");
      setAddress(item?.address ?? "");
      setHackerData(item?.hackerData ?? "");
      setAuspexData(item?.auspexData ?? "");
      setAnimalismData(item?.animalismData ?? "");
    }
  }, [item]);

  const handleFormSubmit = () => {
    if (!editId)
      createMutation(
        {
          name: title,
          content: description,
          address,
          hackerData,
          auspexData,
          animalismData,
        },
        {
          onSuccess() {
            resetForm();
            if (onRefetch) onRefetch();
            setIsModalOpen(false);
          },
        },
      );
    else
      updateMutation(
        {
          id: editId,
          name: title,
          content: description,
          address,
          hackerData,
          auspexData,
          animalismData,
        },
        {
          onSuccess(e) {
            if (e?.message) alert(e.message);
            resetForm();
            if (onRefetch) onRefetch();
            setIsModalOpen(false);
          },
        },
      );
  };

  if (isItemLoading) return <LoadingSpinner height={24} />;

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
          wrapper: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100 mt-24",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {!!editId ? "Редактирование кода" : "Добавить код"}
          </ModalHeader>
          <ModalBody>
            <Input
              variant="underlined"
              label="Название"
              placeholder="Введите название"
              value={title}
              onValueChange={setTitle}
            />
            <Input
              variant="underlined"
              label="Адрес"
              placeholder="Введите адрес"
              value={address}
              onValueChange={setAddress}
            />
            <Textarea
              label="Данные при прорицании"
              placeholder="Введите данные при прорицании"
              value={auspexData}
              onValueChange={setAuspexData}
            />
            <Textarea
              label="Данные при анимализме"
              placeholder="Введите данные при анимализме"
              value={animalismData}
              onValueChange={setAnimalismData}
            />
            <Textarea
              label="Данные при хакерстве"
              placeholder="Введите данные при хакерстве"
              value={hackerData}
              onValueChange={setHackerData}
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
              isDisabled={
                isPending || !title || !description || isPendingUpdate
              }
              onClick={handleFormSubmit}
            >
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="light"
        size="sm"
        className="flex min-w-10 flex-row gap-0 bg-transparent text-black dark:text-red-100"
      >
        {children ? (
          children
        ) : (
          <>
            <FaQrcode size={24} />
            &nbsp;Добавить код
          </>
        )}
      </Button>
    </>
  );
};

export default QRForm;
