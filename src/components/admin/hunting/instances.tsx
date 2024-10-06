"use client";
import {
  Button,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
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
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L, { LatLng } from "leaflet";
import { MapControl, Draggable } from "~/components/map";
import type { HuntingInstance, HuntingData } from "~/server/api/routers/hunt";
import default_char from "~/../public/default_char.png";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { api } from "~/utils/api";

const marker_icon = L.icon({ iconUrl: "/map-marker.png" });
const skull_icon = L.icon({ iconUrl: "/skull.png" });
const cityBorders = [
  new LatLng(57.984261983475534, 56.15550041198731),
  new LatLng(57.99408935391382, 56.157903671264656),
  new LatLng(57.99572698684907, 56.16657257080079),
  new LatLng(58.00345924168589, 56.16906166076661),
  new LatLng(58.00382307136166, 56.16253852844238),
  new LatLng(58.00659715104656, 56.16331100463868),
  new LatLng(58.01282667756441, 56.16356849670411),
  new LatLng(58.02873660320649, 56.27188682556153),
  new LatLng(58.02241893691665, 56.285276412963874),
  new LatLng(58.01705486238637, 56.292743682861335),
  new LatLng(58.0100985512297, 56.29411697387696),
  new LatLng(58.00782495374456, 56.30012512207032),
  new LatLng(58.004550719619765, 56.29755020141602),
  new LatLng(57.99513562803938, 56.30484580993653),
  new LatLng(57.9873560760959, 56.29231452941895),
  new LatLng(57.985445050445875, 56.26956939697266),
  new LatLng(57.98499002931178, 56.24373435974122),
  new LatLng(57.98576356180083, 56.23643875122071),
  new LatLng(57.984762516577405, 56.226911544799805),
  new LatLng(57.97044906155012, 56.171636581420906),
  new LatLng(57.984261983475534, 56.15550041198731),
];

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
    // setTargetId(0);
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
            <Autocomplete
              size="sm"
              variant="bordered"
              placeholder="Выберите добычу"
              aria-label="characters"
              className="w-full rounded-sm"
              selectedKey={targetId ? targetId.toString() : undefined}
              onSelectionChange={(e) => {
                const targetId = Number(e);
                setTargetId(targetId);
              }}
            >
              {targets.map((target) => (
                <AutocompleteItem
                  key={target.id?.toString() ?? ""}
                  value={target.id?.toString() ?? ""}
                  textValue={target.name}
                >
                  <p>{target.name}</p>
                  <p className="text-xs">{target.descs![0]!.content}</p>
                </AutocompleteItem>
              ))}
            </Autocomplete>
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
        <Polyline
          smoothFactor={3}
          pathOptions={{ color: "red", dashArray: "10, 10", dashOffset: "10" }}
          positions={cityBorders}
        />
        <Draggable updatePosition={(p) => setPosition(p)} />
        {instances.map((instance) => (
          <Marker
            key={instance.id}
            position={[instance.coordY, instance.coordX]}
            icon={instance.remains! > 1 ? marker_icon : skull_icon}
          >
            <Popup>
              <div className="flex flex-col items-center">
                <span
                  className="cursor-pointer hover:opacity-75"
                  onClick={() => handleInstanceEdit(instance)}
                >
                  {instance.target!.name}
                </span>
                {instance.remains! < 2 ? (
                  <span className="pb-1 text-xs">Истощена</span>
                ) : (
                  <span className="pb-1 text-xs">
                    Осталось попыток: {instance.remains! - 1}
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
                Осталось попыток: {instance.remains - 1}
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
