import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { FaBoxes } from "react-icons/fa";
import { LoadingSpinner } from "~/components/Loading";
import { type ReactNode, useState, useEffect } from "react";
import DefaultEditor from "~/components/editors/DefaultEditor";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";
import type { Ability } from "~/server/api/routers/char";

const ItemTypeForm = ({
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
  const [auspexData, setAuspexData] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [cost, setCost] = useState(0);
  const [usage, setUsage] = useState(-1);
  const [bloodAmount, setBloodAmount] = useState(0);
  const [bloodPool, setBloodPool] = useState(0);
  const [costIncrease, setCostIncrease] = useState(0);
  const [isPurchasable, setIsPurchasable] = useState(false);
  const [violation, setViolation] = useState("");
  // const [status, setStatus] = useState("");
  // const [boon, setBoon] = useState("");
  const [companyLevels, setCompanyLevels] = useState(0);
  const [addingAbilities, setAddingAbilities] = useState<number[]>([]);
  const [removingAbilities, setRemovingAbilities] = useState<number[]>([]);
  const [usingAbilities, setUsingAbilities] = useState<number[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);

  const { mutate: createMutation, isPending } =
    api.item.createType.useMutation();
  const { mutate: updateMutation, isPending: isPendingUpdate } =
    api.item.updateType.useMutation();
  const { data: abilityData, isLoading: isAbilitiesLoading } =
    api.char.getAbilities.useQuery();
  const { data: itemType, isLoading: isItemTypeLoading } =
    api.item.getTypeById.useQuery(
      {
        id: editId!,
      },
      { enabled: !!editId },
    );

  const resetForm = () => {
    setTitle("");
    setAuspexData("");
    setDescription("");
    setAddingAbilities([]);
    setRemovingAbilities([]);
    setUsingAbilities([]);
    setImage("");
    setCost(0);
    setUsage(-1);
    setBloodAmount(0);
    setBloodPool(0);
    setCompanyLevels(0);
  };

  useEffect(() => {
    if (!!itemType) {
      setCostIncrease(itemType?.costIncrease ?? 0);
      setIsPurchasable(itemType?.isPurchasable ?? false);
      setTitle(itemType?.name ?? "");
      setAuspexData(itemType?.auspexData ?? "");
      setDescription(itemType?.content ?? "");
      setImage(itemType?.image ?? "");
      setCost(itemType?.cost ?? 0);
      setUsage(itemType?.usage ?? -1);
      setBloodAmount(itemType?.bloodAmount ?? 0);
      setBloodPool(itemType?.bloodPool ?? 0);
      setCompanyLevels(itemType?.companyLevels ?? 0);
      setAddingAbilities(
        itemType?.AddingAbility?.map((a) => a.abilityId) ?? [],
      );
      setRemovingAbilities(
        itemType?.RemovingAbility?.map((a) => a.abilityId) ?? [],
      );
      setUsingAbilities(itemType?.UsingAbility?.map((a) => a.abilityId) ?? []);
    }
  }, [itemType]);

  useEffect(() => {
    if (!!abilityData) {
      setAbilities(abilityData);
    }
  }, [abilityData]);

  const handleFormSubmit = () => {
    if (!editId)
      createMutation(
        {
          name: title,
          content: description,
          image,
          cost,
          usage,
          bloodAmount,
          bloodPool,
          auspexData,
          violation,
          isPurchasable,
          costIncrease,
          // status,
          // boon,
          companyLevels,
          addingAbilities,
          removingAbilities,
          usingAbilities,
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
          auspexData,
          image,
          cost,
          usage,
          bloodAmount,
          bloodPool,
          violation,
          isPurchasable,
          costIncrease,
          // status,
          // boon,
          companyLevels,
          addingAbilities,
          removingAbilities,
          usingAbilities,
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

  if (isItemTypeLoading || isAbilitiesLoading)
    return <LoadingSpinner width={24} height={24} />;

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
        size="full"
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
            <div className="flex flex-row gap-2">
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Стоимость"
                value={cost.toString()}
                onValueChange={(v) => setCost(Number(v))}
              />
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Увеличение стоимости в %"
                value={costIncrease.toString()}
                onValueChange={(v) => setCostIncrease(Number(v))}
              />
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Количество использований"
                value={usage.toString()}
                onValueChange={(v) => setUsage(Number(v))}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Количество крови"
                value={bloodAmount.toString()}
                onValueChange={(v) => setBloodAmount(Number(v))}
              />
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Изменение пула крови"
                value={bloodPool.toString()}
                onValueChange={(v) => setBloodPool(Number(v))}
              />
              {/* <Input label="Статус" value={status} />
            <Input label="Услуга" value={boon} /> */}
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Изменение уровня предприятия"
                value={companyLevels.toString()}
                onValueChange={(v) => setCompanyLevels(Number(v))}
              />
            </div>
            <Checkbox
              size="sm"
              isSelected={isPurchasable}
              onValueChange={setIsPurchasable}
            >
              Доступно для покупки
            </Checkbox>
            <div className="flex flex-row gap-2">
              <Input
                size="sm"
                variant="underlined"
                label="Нарушение маскарада"
                placeholder="Заполните, если предмет нарушает маскарад"
                value={violation}
                onValueChange={setViolation}
              />
              <Input
                size="sm"
                variant="underlined"
                label="Информация для прорицания"
                placeholder="Заполните, если предмет можно прорицать"
                value={auspexData}
                onValueChange={setAuspexData}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Select
                size="sm"
                label="Добавление способностей"
                variant="underlined"
                placeholder="Выберите способности"
                selectionMode="multiple"
                selectedKeys={addingAbilities.map((a) => a.toString())}
                onChange={(e) => {
                  setAddingAbilities(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {abilities.map((ability) => (
                  <SelectItem key={ability.id} value={ability.id}>
                    {ability.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                label="Удаление способностей"
                variant="underlined"
                placeholder="Выберите способности"
                selectionMode="multiple"
                selectedKeys={removingAbilities.map((a) => a.toString())}
                onChange={(e) => {
                  setRemovingAbilities(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {abilities.map((ability) => (
                  <SelectItem key={ability.id} value={ability.id}>
                    {ability.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                label="Использование способностей"
                variant="underlined"
                placeholder="Выберите способности"
                selectionMode="multiple"
                selectedKeys={usingAbilities.map((a) => a.toString())}
                onChange={(e) => {
                  setUsingAbilities(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {abilities.map((ability) => (
                  <SelectItem key={ability.id} value={ability.id}>
                    {ability.name}
                  </SelectItem>
                ))}
              </Select>
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
                isPendingUpdate ||
                !title ||
                !description ||
                !cost ||
                !usage
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
            <FaBoxes size={24} />
            &nbsp;Добавить тип предмета
          </>
        )}
      </Button>
    </>
  );
};

export default ItemTypeForm;
