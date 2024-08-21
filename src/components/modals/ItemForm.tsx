import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { FaDropbox } from "react-icons/fa";
import { LoadingSpinner } from "~/components/Loading";
import { type ReactNode, useState, useEffect } from "react";
import DefaultEditor from "~/components/editors/DefaultEditor";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";

const ItemForm = ({
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
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [usage, setUsage] = useState(-1);
  const [typeId, setTypeId] = useState(1);

  const { mutate: createMutation, isPending } = api.item.create.useMutation();
  const { mutate: updateMutation, isPending: isPendingUpdate } =
    api.item.update.useMutation();
  const { data: itemData, isLoading: isItemLoading } =
    api.item.getById.useQuery(
      {
        id: editId!,
      },
      { enabled: !!editId },
    );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImage("");
    setUsage(-1);
    setTypeId(1);
  };

  useEffect(() => {
    if (!!itemData) {
      setTitle(itemData?.name ?? "");
      setDescription(itemData?.content ?? "");
      setImage(itemData?.image ?? "");
      setUsage(itemData?.usage ?? -1);
      setTypeId(itemData?.typeId ?? 1);
    }
  }, [itemData]);

  const handleFormSubmit = () => {
    if (!editId)
      createMutation(
        {
          name: title,
          content: description,
          image,
          usage,
          typeId,
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
          image,
          usage,
          typeId,
        },
        {
          onSuccess() {
            resetForm();
            if (onRefetch) onRefetch();
            setIsModalOpen(false);
          },
        },
      );
  };

  if (isItemLoading) return <LoadingSpinner width={24} height={24} />;

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
            {!!editId
              ? "Редактирование типа предмета"
              : "Добавить тип предмета"}
          </ModalHeader>
          <ModalBody>
            <Input
              size="sm"
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
              placeholder="Введите описание"
            />
            <UploadButton
              content={{
                button: "Загрузить",
                allowedContent: "Изображение (до 4 Мб)",
              }}
              className="cursor-pointer"
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setImage(res[0]?.url ?? "");
              }}
            />
            {!!image && (
              <Image
                src={image}
                alt=""
                width="256"
                height="144"
                objectFit="contain"
                className="mx-auto"
              />
            )}
            <Input
              size="sm"
              type="number"
              variant="underlined"
              label="Количество использований"
              value={usage.toString()}
              onValueChange={(v) => setUsage(Number(v))}
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
                isPending || isPendingUpdate || !title || !description || !usage
              }
              onClick={handleFormSubmit}
            >
              {isPending ? <LoadingSpinner /> : "Сохранить"}
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
            <FaDropbox size={24} />
            &nbsp;Добавить предмет
          </>
        )}
      </Button>
    </>
  );
};

export default ItemForm;
