"use client";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L, {
  type LatLng,
  type LatLngExpression,
  type Marker as LeafletMarker,
} from "leaflet";
import type { Hunt, HuntingInstance } from "~/server/api/routers/hunt";
import type { Character } from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect, useMemo, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { api } from "~/utils/api";

const target_icon = L.icon({ iconUrl: "/crosshair.png" });
const marker_icon = L.icon({ iconUrl: "/map-marker.png" });

const InstanceMapControl = () => {
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      console.log(e, typeof e);
    },
  });
  return null;
};

const DraggableInstance = ({
  updatePosition,
}: {
  updatePosition: (p: LatLng) => void;
}) => {
  const [position, setPosition] = useState<LatLngExpression>([58.0075, 56.23]);
  const markerRef = useRef<LeafletMarker | null>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!!marker) {
          setPosition(marker.getLatLng());
          updatePosition(marker.getLatLng());
        }
      },
    }),
    [updatePosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      position={position}
      ref={markerRef}
      icon={target_icon}
    >
      <Popup>Новая цель</Popup>
    </Marker>
  );
};

const Hunts = () => {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [instances, setInstances] = useState<HuntingInstance[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [characterId, setCharacterId] = useState<number>();
  const [instanceId, setInstanceId] = useState<number>();
  const [position, setPosition] = useState<LatLng>();
  const [search, setSearch] = useState<string>("");

  const {
    data: huntsData,
    isLoading: isHuntsLoading,
    refetch: refetchHunts,
  } = api.hunt.getAllHunts.useQuery();

  const {
    data: instancesData,
    isLoading: isInstancesLoading,
    refetch: refetchInstances,
  } = api.hunt.getAllHuntingInstances.useQuery();

  const {
    data: charactersData,
    isLoading: isCharactersLoading,
    refetch: refetchCharacters,
  } = api.char.getAll.useQuery();

  const { mutate: newHunt, isPending: isCreatePending } =
    api.hunt.createHunt.useMutation();

  useEffect(() => {
    if (!!huntsData) setHunts(huntsData);
  }, [huntsData]);

  useEffect(() => {
    if (!!instancesData) setInstances(instancesData);
  }, [instancesData]);

  useEffect(() => {
    if (!!charactersData) setCharacters(charactersData);
  }, [charactersData]);

  const handleFormSubmit = () => {
    newHunt(
      { characterId: characterId!, instanceId: instanceId! },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          void refetchCharacters();
          void refetchInstances();
          void refetchHunts();
          handleClear();
        },
      },
    );
  };

  const handleClear = () => {
    setPosition(undefined);
  };

  const sortClosest = (is: HuntingInstance[], coords?: LatLng) => {
    let sortedInstances: HuntingInstance[] = [...is];
    if (!!coords) {
      sortedInstances = is.sort(
        (a, b) =>
          Math.sqrt(
            Math.abs(coords.lat - a.coordY) ** 2 +
              Math.abs(coords.lng - a.coordX) ** 2,
          ) -
          Math.sqrt(
            Math.abs(coords.lat - b.coordY) ** 2 +
              Math.abs(coords.lng - b.coordX) ** 2,
          ),
      );
    }

    return sortedInstances;
  };

  if (isInstancesLoading || isHuntsLoading || isCharactersLoading)
    return <LoadingPage />;

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
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100 z-[1001]",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
          backdrop: "z-[1000]",
        }}
      >
        <ModalContent>
          <ModalHeader>
            Поохотиться по координатам&nbsp;
            {position?.lat.toFixed(5)}, {position?.lng.toFixed(5)}
          </ModalHeader>
          <ModalBody className="flex flex-col">
            <Select
              size="sm"
              variant="underlined"
              placeholder="Выберите персонажа"
              aria-label="Персонаж"
              selectedKeys={characterId ? [characterId] : []}
              onChange={(e) => setCharacterId(Number(e.target.value))}
            >
              {characters.map((character) => (
                <SelectItem
                  key={character.id ?? ""}
                  value={character.id}
                  textValue={character.name}
                >
                  <p>{character.name}</p>
                  <p className="text-xs">
                    {character.faction?.name} - {character.clan?.name}
                  </p>
                </SelectItem>
              ))}
            </Select>
            <Select
              size="sm"
              variant="underlined"
              placeholder="Выберите цель"
              aria-label="Цель"
              selectedKeys={instanceId ? [instanceId] : []}
              onChange={(e) => setInstanceId(Number(e.target.value))}
            >
              {sortClosest(instances, position).map((instance) => (
                <SelectItem
                  key={instance.id ?? ""}
                  value={instance.id}
                  textValue={instance.target?.name}
                >
                  <p>{instance.target?.name}</p>
                  <p className="text-xs">
                    {instance.coordY.toFixed(5)}, {instance.coordX.toFixed(5)}
                  </p>
                  <p className="text-xs">
                    {instance.target?.descs![0]!.content}
                  </p>
                </SelectItem>
              ))}
            </Select>
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
              onClick={handleFormSubmit}
              isDisabled={isCreatePending || !characterId || !instanceId}
            >
              Поохотиться
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
        <InstanceMapControl />
        <DraggableInstance updatePosition={(p) => setPosition(p)} />
        {instances.map((instance) => (
          <Marker
            key={instance.id}
            position={[instance.coordY, instance.coordX]}
            icon={marker_icon}
          >
            <Popup>
              <div className="flex flex-col items-center gap-0">
                <span>{instance.target!.name}</span>
                <span>Осталость попыток: {instance.remains}</span>
                <span>
                  {instance.coordY.toFixed(5)}, {instance.coordX.toFixed(5)}
                </span>
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
      {hunts
        .filter((t) =>
          !!search
            ? t.instance!.target!.name.toLowerCase().includes(search)
            : true,
        )
        .map((hunt) => (
          <div
            key={hunt.id}
            className="flex flex-col rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
          >
            <div className="flex flex-row items-center pb-2 text-xl">
              {hunt.instance!.target!.name}
            </div>
            <div className="-mt-2 pb-1 text-xs">
              {hunt.instance!.coordY.toFixed(5)},{" "}
              {hunt.instance!.coordX.toFixed(5)}
            </div>
            <div className="-mt-2 pb-1 text-xs">
              {hunt.createdAt?.toLocaleString()}
            </div>
            <div className="-mt-2 pb-1 text-xs">
              {hunt.status === "success"
                ? "Успешно"
                : hunt.status === "req_failure"
                  ? "Цель не соответствует предпочтениям персонажа"
                  : hunt.status === "exp_failure"
                    ? "Срок цели истёк"
                    : "Нарушение маскарада"}
            </div>
            {hunt.instance!.groundId && (
              <div className="-mt-2 pb-1 text-xs">
                {hunt.instance!.ground?.name}
              </div>
            )}
            <div className="flex max-h-20 flex-row overflow-hidden text-ellipsis text-justify text-xs">
              {hunt.instance!.target!.descs![0]!.content}
            </div>
          </div>
        ))}
    </>
  );
};

export default Hunts;
