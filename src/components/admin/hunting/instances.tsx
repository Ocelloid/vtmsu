"use client";
import {
  Button,
  Select,
  SelectItem,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  DateInput,
  type DateValue,
  CalendarDate,
} from "@nextui-org/react";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { LatLng } from "leaflet";
import { MapControl, Draggable } from "~/components/map";
import type { HuntingInstance, HuntingData } from "~/server/api/routers/hunt";
import default_char from "~/../public/default_char.png";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { api } from "~/utils/api";

const marker_icon = L.icon({ iconUrl: "/map-marker.png" });

const Instances = () => {
  const [targets, setTargets] = useState<HuntingData[]>([]);
  const [instances, setInstances] = useState<HuntingInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  const [expires, setExpires] = useState<DateValue>();
  const [targetId, setTargetId] = useState<number>();
  const [id, setId] = useState<number>();
  const [search, setSearch] = useState<string>("");

  const {
    data: instancesData,
    isLoading: isInstancesLoading,
    refetch: refetchInstances,
  } = api.hunt.getAllHuntingInstances.useQuery();

  const { data: targetsData, isLoading: isTargetsLoading } =
    api.hunt.getAllHuntingTargets.useQuery();

  const { mutate: newInstance, isPending: isCreatePending } =
    api.hunt.createHuntingInstance.useMutation();

  const { mutate: updateInstance, isPending: isUpdatePending } =
    api.hunt.updateHuntingInstance.useMutation();

  const { mutate: deleteInstance, isPending: isDeletePending } =
    api.hunt.deleteHuntingInstance.useMutation();

  useEffect(() => {
    if (!!instancesData) setInstances(instancesData);
  }, [instancesData]);

  useEffect(() => {
    if (!!targetsData) setTargets(targetsData);
  }, [targetsData]);

  const handleInstanceEdit = (t: HuntingInstance) => {
    setId(t.id);
    setTargetId(t.targetId);
    setExpires(
      !!t.expires
        ? new CalendarDate(
            t.expires.getFullYear(),
            t.expires.getMonth() + 1,
            t.expires.getDate(),
          )
        : undefined,
    );
    setPosition(new LatLng(t.coordY, t.coordX));
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    const confirmDelete = confirm("Удалить цель?");
    if (confirmDelete && !!id)
      deleteInstance(
        { id: id },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            void refetchInstances();
            handleClear();
          },
        },
      );
  };

  const handleFormSubmit = () => {
    if (!!id) {
      updateInstance(
        {
          id: id,
          coordX: !!position ? position.lng : undefined,
          coordY: !!position ? position.lat : undefined,
          targetId: targetId,
          expires: !!expires
            ? new Date(expires.year, expires.month, expires.day)
            : undefined,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            void refetchInstances();
            handleClear();
          },
        },
      );
    } else
      newInstance(
        {
          coordX: position.lng,
          coordY: position.lat,
          targetId: targetId ?? 0,
          expires: !!expires
            ? new Date(expires.year, expires.month, expires.day)
            : undefined,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            void refetchInstances();
            handleClear();
          },
        },
      );
  };

  const handleClear = () => {
    setId(undefined);
    setExpires(undefined);
    setPosition(new LatLng(58.0075, 56.23));
    setTargetId(0);
  };

  if (isInstancesLoading || isTargetsLoading) return <LoadingPage />;

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
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100 z-[1001]",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {!!id ? "Редактировать" : "Добавить"} цель по координатам{" "}
            {position?.lat.toFixed(5)}, {position?.lng.toFixed(5)}
          </ModalHeader>
          <ModalBody className="flex flex-col">
            <Image
              className="mx-auto mt-1 aspect-square h-[196px] w-full rounded-md object-cover"
              alt="char_photo"
              src={
                !!targets.find((t) => t.id === targetId)?.image
                  ? targets.find((t) => t.id === targetId)!.image ?? ""
                  : default_char
              }
              height="640"
              width="640"
            />
            <DateInput
              variant="underlined"
              label="Доступно до"
              value={expires}
              onChange={setExpires}
            />
            <Select
              size="sm"
              variant="underlined"
              placeholder="Выберите добычу"
              aria-label="Добыча"
              selectedKeys={[targetId ?? 0]}
              onChange={(e) => setTargetId(Number(e.target.value))}
            >
              {targets.map((target) => (
                <SelectItem
                  key={target.id ?? ""}
                  value={target.id}
                  textValue={target.name}
                >
                  <p>{target.name}</p>
                  <p className="text-xs">{target.descs![0]!.content}</p>
                </SelectItem>
              ))}
            </Select>
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
                !targetId
              }
            >
              Добавить
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
        {instances.map((instance) => (
          <Marker
            key={instance.id}
            position={[instance.coordY, instance.coordX]}
            icon={marker_icon}
          >
            <Popup>
              <div className="flex flex-col items-center">
                <span
                  className="cursor-pointer hover:opacity-75"
                  onClick={() => handleInstanceEdit(instance)}
                >
                  {instance.target!.name}
                </span>
                {!instance.remains && (
                  <span className="pb-1 text-xs">Истощена</span>
                )}
                {!!instance.remains && (
                  <span className="pb-1 text-xs">
                    Осталось {instance.remains}&nbsp;
                    {instance.remains === 1
                      ? "охота"
                      : instance.remains < 5
                        ? "охоты"
                        : "охот"}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
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
      {instances
        .filter((t) =>
          !!search ? t.target!.name.toLowerCase().includes(search) : true,
        )
        .map((instance) => (
          <div
            key={instance.id}
            className="flex flex-col rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
          >
            <div className="flex flex-row items-center pb-2 text-xl">
              {instance.target!.name}
              <Button
                variant="light"
                color="warning"
                className="ml-auto h-8 w-8 min-w-0 rounded-full p-0"
                onClick={() => handleInstanceEdit(instance)}
              >
                <FaPencilAlt size={16} />
              </Button>
            </div>
            {!instance.remains && (
              <div className="-mt-2 pb-1 text-xs">Истощена</div>
            )}
            {!!instance.remains && (
              <div className="-mt-2 pb-1 text-xs">
                Осталось {instance.remains}&nbsp;
                {instance.remains === 1
                  ? "охота"
                  : instance.remains < 5
                    ? "охоты"
                    : "охот"}
              </div>
            )}
            <div className="-mt-2 pb-1 text-xs">
              {instance.coordY.toFixed(5)}, {instance.coordX.toFixed(5)}
            </div>
            {instance.groundId && (
              <div className="-mt-2 pb-1 text-xs">{instance.ground?.name}</div>
            )}
            <div className="flex max-h-20 flex-row overflow-hidden text-ellipsis text-justify text-xs">
              {instance.target!.descs![0]!.content}
            </div>
          </div>
        ))}
    </>
  );
};

export default Instances;
