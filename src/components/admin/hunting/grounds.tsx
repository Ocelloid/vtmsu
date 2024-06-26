"use client";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TimeInput,
  Textarea,
} from "@nextui-org/react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Popup, Pane, Circle } from "react-leaflet";
import { LatLng } from "leaflet";
import { MapControl, Draggable } from "~/components/map";
import type { HuntingGround } from "~/server/api/routers/hunt";
import { Time } from "@internationalized/date";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { api } from "~/utils/api";

const Grounds = () => {
  const [grounds, setGrounds] = useState<HuntingGround[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [delay, setDelay] = useState<Time>(new Time(1, 0));
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  const [radius, setRadius] = useState<number>(100);
  const [content, setContent] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(10);
  const [id, setId] = useState<number>();
  const [search, setSearch] = useState<string>("");

  const {
    data: groundsData,
    isLoading: isGroundsLoading,
    refetch: refetchGrounds,
  } = api.hunt.getAllHuntingGrounds.useQuery();

  const { mutate: newGround, isPending: isCreatePending } =
    api.hunt.createHuntingGround.useMutation();

  const { mutate: updateGround, isPending: isUpdatePending } =
    api.hunt.updateHuntingGround.useMutation();

  const { mutate: deleteGround, isPending: isDeletePending } =
    api.hunt.deleteHuntingGround.useMutation();

  useEffect(() => {
    if (!!groundsData) setGrounds(groundsData);
  }, [groundsData]);

  useEffect(() => {
    if (!!groundsData) setGrounds(groundsData);
  }, [groundsData]);

  const handleGroundEdit = (t: HuntingGround) => {
    setId(t.id);
    setMax(t.max_inst);
    setMin(t.min_inst ?? 0);
    setName(t.name);
    setRadius(t.radius);
    setContent(t.content ?? "");
    setPosition(new LatLng(t.coordY, t.coordX));
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    const confirmDelete = confirm("Удалить добычу?");
    if (confirmDelete && !!id)
      deleteGround(
        { id: id },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            void refetchGrounds();
            handleClear();
          },
        },
      );
  };

  const handleFormSubmit = () => {
    if (!!id) {
      updateGround(
        {
          id: id,
          coordX: position.lng,
          coordY: position.lat,
          delay: delay.hour * 3600 + delay.minute * 60 + delay.second,
          max_inst: max,
          min_inst: min,
          radius: radius,
          content: content,
          name: name,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            void refetchGrounds();
            handleClear();
          },
        },
      );
    } else
      newGround(
        {
          coordX: position.lng,
          coordY: position.lat,
          delay: delay.hour * 60 + delay.second,
          max_inst: max,
          min_inst: min,
          radius: radius,
          content: content,
          name: name,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            void refetchGrounds();
            handleClear();
          },
        },
      );
  };

  const handleClear = () => {
    setId(undefined);
    setName("");
    setRadius(100);
    setMin(0);
    setMax(10);
    setContent("");
    setDelay(new Time(1, 0));
    setPosition(new LatLng(58.0075, 56.23));
  };

  if (isGroundsLoading || isGroundsLoading) return <LoadingPage />;

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={handleClear}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
        size="2xl"
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6 z-[1001]",
          wrapper: "z-[1001]",
          backdrop: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {!!id ? "Редактировать" : "Добавить"} кормушку по координатам{" "}
            {position?.lat.toFixed(5)}, {position?.lng.toFixed(5)}
          </ModalHeader>
          <ModalBody className="flex flex-col">
            <Input
              variant="underlined"
              label="Название"
              placeholder="Введите название"
              value={name}
              onValueChange={setName}
            />
            <Textarea
              variant="underlined"
              label={`Описание`}
              placeholder={`Введите описание`}
              value={content}
              onValueChange={setContent}
            />
            <div className="flex flex-row gap-2">
              <TimeInput
                hourCycle={24}
                variant="underlined"
                granularity="second"
                label="Задержка"
                value={delay}
                onChange={setDelay}
              />
              <Input
                type="number"
                variant="underlined"
                label="Радиус"
                placeholder="Введите радиус в метрах"
                value={radius.toString()}
                onValueChange={(n) => setRadius(Number(n))}
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-small text-default-400">
                      в&nbsp;метрах
                    </span>
                  </div>
                }
              />
            </div>
            <div className="flex flex-row gap-2">
              <Input
                variant="underlined"
                label="Минимум целей"
                placeholder="Введите минимальное число целей"
                value={min.toString()}
                onValueChange={(n) => setMin(Number(n))}
              />
              <Input
                variant="underlined"
                label="Максимум целей"
                placeholder="Введите максимальное число целей"
                value={max.toString()}
                onValueChange={(n) => setMax(Number(n))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => {
                setIsModalOpen(!isModalOpen);
                handleClear();
              }}
              className="mr-auto"
            >
              Отменить
            </Button>
            {!!id && (
              <Button
                variant="solid"
                color="danger"
                onClick={handleDelete}
                isDisabled={
                  isCreatePending || isUpdatePending || isDeletePending
                }
                className="mr-auto"
              >
                Удалить
              </Button>
            )}
            <Button
              variant="solid"
              color="success"
              onClick={handleFormSubmit}
              isDisabled={
                isCreatePending ||
                isUpdatePending ||
                isDeletePending ||
                !name ||
                !radius ||
                !max ||
                delay.hour * 3600 + delay.minute * 60 + delay.second <= 60
              }
            >
              {!!id ? "Обновить" : "Добавить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <MapContainer
        center={[58.0075, 56.23]}
        zoom={13.5}
        style={{ height: "480px" }}
      >
        <TileLayer
          attribution={
            !!position
              ? `Координаты: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
              : ""
          }
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapControl />
        <Draggable updatePosition={(p) => setPosition(p)} />
        <Pane name="purple-rectangle">
          {grounds.map((ground) => (
            <Circle
              key={ground.id}
              radius={ground.radius}
              center={new LatLng(ground.coordY, ground.coordX)}
              pathOptions={{ color: "red" }}
            >
              <Popup>
                <div className="flex max-h-20 max-w-60 flex-col items-center text-justify">
                  <span
                    className="cursor-pointer hover:opacity-75"
                    onClick={() => handleGroundEdit(ground)}
                  >
                    {ground.name}
                  </span>
                  {!!ground.content && (
                    <span className="overflow-hidden text-ellipsis pb-1 text-xs">
                      {ground.content}
                    </span>
                  )}
                </div>
              </Popup>
            </Circle>
          ))}
        </Pane>
      </MapContainer>
      <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="bordered"
          isDisabled={!position}
          className="my-auto flex min-w-44 flex-row border-black bg-transparent text-black dark:border-white dark:text-white"
        >
          <FaPlus size={16} />
          &nbsp;Добавить
        </Button>
        <Input
          variant="underlined"
          label="Поиск"
          placeholder="Введите название"
          className="md:col-span-3"
          value={search}
          onValueChange={setSearch}
        />
      </div>
      {grounds
        .filter((t) =>
          !!search ? t.name.toLowerCase().includes(search) : true,
        )
        .map((ground) => (
          <div
            key={ground.id}
            className="flex flex-col rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
          >
            <div className="flex flex-row items-center pb-2 text-xl">
              {ground.name}
              <Button
                variant="light"
                color="warning"
                className="ml-auto h-8 w-8 min-w-0 rounded-full p-0"
                onClick={() => handleGroundEdit(ground)}
              >
                <FaPencilAlt size={16} />
              </Button>
            </div>
            {!!ground.instances?.length && (
              <div className="-mt-2 pb-1 text-xs">
                {ground.instances?.length}&nbsp;
                {ground.instances?.length === 1
                  ? "цель"
                  : ground.instances?.length < 5
                    ? "цели"
                    : "целей"}
              </div>
            )}
            <div className="-mt-2 pb-1 text-xs">
              {ground.coordY.toFixed(5)}, {ground.coordX.toFixed(5)}
            </div>
          </div>
        ))}
    </>
  );
};

export default Grounds;
