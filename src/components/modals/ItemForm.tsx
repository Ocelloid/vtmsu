import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { FaDropbox } from "react-icons/fa";
import { LoadingSpinner } from "~/components/Loading";
import { type ReactNode, useState, useEffect } from "react";
import DefaultEditor from "~/components/editors/DefaultEditor";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";
import CharacterCard from "~/components/CharacterCard";

const ItemForm = ({
  editId,
  children,
  onRefetch,
}: {
  editId?: number;
  children?: ReactNode;
  onRefetch?: () => void;
}) => {
  const { data: characterData, isLoading: isCharactersLoading } =
    api.char.getAll.useQuery();
  const { data: itemTypes, isLoading: isTypesLoading } =
    api.item.getAllTypes.useQuery();
  const [selectedCharacter, setSelectedCharacter] = useState<number>();
  const [selectedType, setSelectedType] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [auspexData, setAuspexData] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [usage, setUsage] = useState(-1);
  const [coordX, setCoordX] = useState(0);
  const [coordY, setCoordY] = useState(0);

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
    setAuspexData("");
    setDescription("");
    setImage("");
    setUsage(-1);
    setSelectedType(1);
    setCoordX(0);
    setCoordY(0);
  };

  useEffect(() => {
    if (!!itemData) {
      setTitle(itemData?.name ?? "");
      setAuspexData(itemData?.auspexData ?? "");
      setDescription(itemData?.content ?? "");
      setImage(itemData?.image ?? "");
      setUsage(itemData?.usage ?? -1);
      setSelectedType(itemData?.typeId ?? 1);
      setSelectedCharacter(itemData?.ownedById ?? 1);
      setCoordX(itemData?.coordX ?? 0);
      setCoordY(itemData?.coordY ?? 0);
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
          coordX,
          coordY,
          typeId: selectedType,
          auspexData,
          ownedById: selectedCharacter ?? 1,
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
          coordX,
          coordY,
          typeId: selectedType,
          auspexData,
          ownedById: selectedCharacter,
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

  if (isItemLoading || isCharactersLoading || isTypesLoading)
    return <LoadingSpinner width={24} height={24} />;

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
            {!!editId ? "Редактирование предмета" : "Добавить предмет"}
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
            <Textarea
              size="sm"
              variant="underlined"
              label="Информация для прорицания"
              value={auspexData}
              onValueChange={setAuspexData}
            />
            <Input
              size="sm"
              type="number"
              variant="underlined"
              label="Количество использований"
              value={usage.toString()}
              onValueChange={(v) => setUsage(Number(v))}
            />
            <div className="flex w-full flex-row gap-2">
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Долгота"
                value={coordX.toString()}
                onValueChange={(v) => setCoordX(Number(v))}
              />
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Широта"
                value={coordY.toString()}
                onValueChange={(v) => setCoordY(Number(v))}
              />
            </div>
            <Autocomplete
              size="md"
              variant="bordered"
              placeholder="Выберите персонажа"
              aria-label="characters"
              className="w-full rounded-sm"
              selectedKey={
                selectedCharacter ? selectedCharacter.toString() : undefined
              }
              onSelectionChange={(e) => {
                setSelectedCharacter(!!e ? Number(e) : selectedCharacter);
              }}
            >
              {!!characterData?.length
                ? characterData.map((c) => (
                    <AutocompleteItem
                      key={c.id.toString()}
                      value={c.id.toString()}
                      textValue={c.name}
                    >
                      <CharacterCard character={c} isSelect={true} />
                    </AutocompleteItem>
                  ))
                : []}
            </Autocomplete>
            <Autocomplete
              size="md"
              variant="bordered"
              placeholder="Выберите тип предмета"
              aria-label="characters"
              className="w-full rounded-sm"
              selectedKey={selectedType ? selectedType.toString() : undefined}
              onSelectionChange={(e) => {
                const newType = !!e ? Number(e) : selectedType;
                setSelectedType(newType);
                setTitle(itemTypes?.find((t) => t.id === newType)?.name ?? "");
                setDescription(
                  itemTypes?.find((t) => t.id === newType)?.content ?? "",
                );
                setImage(itemTypes?.find((t) => t.id === newType)?.image ?? "");
                setUsage(itemTypes?.find((t) => t.id === newType)?.usage ?? -1);
              }}
            >
              {!!itemTypes?.length
                ? itemTypes.map((c) => (
                    <AutocompleteItem
                      key={c.id.toString()}
                      value={c.id.toString()}
                      textValue={c.name}
                    >
                      {c.name}
                    </AutocompleteItem>
                  ))
                : []}
            </Autocomplete>
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
                isPending || isPendingUpdate || !title || !description
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
            <FaDropbox size={24} />
            &nbsp;Добавить предмет
          </>
        )}
      </Button>
    </>
  );
};

export default ItemForm;
