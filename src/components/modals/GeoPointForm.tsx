import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Checkbox,
  Textarea,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { PiMapPinFill } from "react-icons/pi";
import { LoadingSpinner } from "~/components/Loading";
import { type ReactNode, useState, useEffect } from "react";
import DefaultEditor from "~/components/editors/DefaultEditor";
import type { Container } from "~/server/api/routers/item";
import type { Effect } from "~/server/api/routers/char";
import type { LatLng } from "leaflet";

const GeoPointForm = ({
  editId,
  children,
  onRefetch,
  position,
}: {
  editId?: string;
  children?: ReactNode;
  onRefetch?: () => void;
  position?: LatLng;
}) => {
  const [lat, setLat] = useState(position?.lat ?? 0);
  const [lng, setLng] = useState(position?.lng ?? 0);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState("");
  const [auspexData, setAuspexData] = useState("");
  const [animalismData, setAnimalismData] = useState("");
  const [hackerData, setHackerData] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [effectIds, setEffectIds] = useState<number[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [containerIds, setContainerIds] = useState<string[]>([]);

  const { mutate: createMutation, isPending } =
    api.city.createGeoPoint.useMutation();
  const { mutate: updateMutation, isPending: isPendingUpdate } =
    api.city.updateGeoPoint.useMutation();
  const { data: geoPointData, isLoading: isGeoPointLoading } =
    api.city.getGeoPointById.useQuery(
      {
        id: editId!,
      },
      { enabled: !!editId },
    );
  const { data: effectsData, isLoading: isEffectsLoading } =
    api.char.getEffects.useQuery();
  const { data: containersData, isLoading: isContainersLoading } =
    api.item.getAllContainers.useQuery();

  const resetForm = () => {
    setName("");
    setEffectIds([]);
    setIsVisible(false);
    setAuspexData("");
    setAnimalismData("");
    setHackerData("");
    setContent("");
    setIcon("");
    setLng(0);
    setLat(0);
  };

  useEffect(() => {
    if (!!effectsData) setEffects(effectsData);
  }, [effectsData]);

  useEffect(() => {
    if (!!containersData) setContainers(containersData);
  }, [containersData]);

  useEffect(() => {
    if (!!geoPointData) {
      setName(geoPointData?.name ?? "");
      setIsVisible(geoPointData?.isVisible ?? false);
      setAuspexData(geoPointData?.auspexData ?? "");
      setAnimalismData(geoPointData?.animalismData ?? "");
      setHackerData(geoPointData?.hackerData ?? "");
      setContent(geoPointData?.content ?? "");
      setIcon(geoPointData?.icon ?? "");
      setLng(geoPointData?.lng ?? 0);
      setLat(geoPointData?.lat ?? 0);
      setEffectIds(geoPointData?.GeoPointEffects?.map((e) => e.effectId) ?? []);
      setContainerIds(
        geoPointData?.GeoPointContainers?.map((e) => e.containerId) ?? [],
      );
    } else {
      setLat(position?.lat ?? 0);
      setLng(position?.lng ?? 0);
    }
  }, [geoPointData, position]);

  const handleFormSubmit = () => {
    if (!editId)
      createMutation(
        {
          name,
          content,
          icon,
          isVisible,
          auspexData,
          animalismData,
          hackerData,
          lng,
          lat,
          effectIds,
          containerIds,
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
          name,
          content,
          icon,
          isVisible,
          auspexData,
          animalismData,
          hackerData,
          lng,
          lat,
          effectIds,
          containerIds,
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

  if (isGeoPointLoading || isEffectsLoading || isContainersLoading)
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
            {!!editId ? "Редактирование геоточки" : "Добавить геоточку"}
          </ModalHeader>
          <ModalBody>
            <Input
              size="sm"
              variant="underlined"
              label="Название"
              placeholder="Введите название"
              value={name}
              onValueChange={setName}
            />
            <div className="flex w-full flex-row items-center gap-2">
              <Input
                size="sm"
                variant="underlined"
                label="Название иконки"
                placeholder="Введите название иконки"
                value={icon}
                onValueChange={setIcon}
              />
              <Checkbox
                size="sm"
                isSelected={isVisible}
                onValueChange={setIsVisible}
              >
                Видимая на карте
              </Checkbox>
            </div>
            <DefaultEditor
              label="Контент"
              className="min-h-44 sm:min-h-20"
              initialContent={content}
              onUpdate={setContent}
              placeholder="Введите описание"
            />
            <Textarea
              size="sm"
              variant="underlined"
              label="Информация для прорицания"
              value={auspexData}
              onValueChange={setAuspexData}
            />
            <Textarea
              size="sm"
              variant="underlined"
              label="Информация для анимализма"
              value={animalismData}
              onValueChange={setAnimalismData}
            />
            <Textarea
              size="sm"
              variant="underlined"
              label="Информация для хакерства"
              value={hackerData}
              onValueChange={setHackerData}
            />
            <div className="flex w-full flex-row gap-2">
              <Select
                label="Эффекты"
                variant="underlined"
                placeholder="Выберите эффекты"
                selectionMode="multiple"
                selectedKeys={effectIds.map((f) => f.toString())}
                onChange={(e) => {
                  if (!!e.target.value) {
                    setEffectIds(
                      e.target.value.split(",").map((s) => Number(s)),
                    );
                  }
                }}
              >
                {effects.map((effect) => (
                  <SelectItem key={effect.id} value={effect.id}>
                    {effect.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Контейнеры"
                variant="underlined"
                placeholder="Выберите контейнеры"
                selectionMode="multiple"
                selectedKeys={containerIds.map((f) => f.toString())}
                onChange={(e) => {
                  if (!!e.target.value) {
                    setContainerIds(e.target.value.split(",").map((s) => s));
                  }
                }}
              >
                {containers.map((container) => (
                  <SelectItem key={container.id} value={container.id}>
                    {container.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex w-full flex-row gap-2">
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Долгота"
                value={lng.toString()}
                onValueChange={(v) => setLng(Number(v))}
              />
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Широта"
                value={lat.toString()}
                onValueChange={(v) => setLat(Number(v))}
              />
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
                !name ||
                !content ||
                !lat ||
                !lng
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
            <PiMapPinFill size={24} />
            &nbsp;Добавить геоточку
          </>
        )}
      </Button>
    </>
  );
};

export default GeoPointForm;
