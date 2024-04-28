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
import { MapControl, Draggable } from "~/components/map";
import { FaCheck, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { LatLng } from "leaflet";
import type { Hunt, HuntingInstance } from "~/server/api/routers/hunt";
import type { Character } from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { api } from "~/utils/api";

const marker_icon = L.icon({ iconUrl: "/map-marker.png" });
const skull_icon = L.icon({ iconUrl: "/skull.png" });

const Hunts = () => {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [instances, setInstances] = useState<HuntingInstance[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [characterId, setCharacterId] = useState<number>();
  const [instanceId, setInstanceId] = useState<number>();
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  const [search, setSearch] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

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
    setDesc("");
    setInstanceId(undefined);
    setCharacterId(undefined);
    setPosition(new LatLng(58.0075, 56.23));
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
            {!!desc && (
              <div className="flex flex-col text-xs">
                <p className="text-default-600">Описание:</p>
                <p>{desc}</p>
              </div>
            )}
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
              onChange={(e) => {
                console.log(e);
                setInstanceId(Number(e.target.value));
                if (!!e.target.value)
                  setDesc(
                    instances.find((i) => i.id === Number(e.target.value))
                      ?.target!.descs![
                      instances.find((i) => i.id === Number(e.target.value))!
                        .target!.descs!.length -
                        instances.find((i) => i.id === Number(e.target.value))!
                          .remains!
                    ]?.content ?? "",
                  );
              }}
            >
              {sortClosest(
                instances.filter(
                  (i) =>
                    i.remains! > 1 &&
                    (!!i.expires ? i.expires < new Date() : true),
                ),
                position,
              ).map((instance) => (
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
                    {
                      instance.target?.descs![
                        instance.target?.descs!.length - instance.remains!
                      ]!.content
                    }
                  </p>
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
        <MapControl />
        <Draggable updatePosition={(p) => setPosition(p)} />
        {instances
          .filter((i) => (!!i.expires ? i.expires < new Date() : true))
          .map((instance) => (
            <Marker
              key={instance.id}
              position={[instance.coordY, instance.coordX]}
              icon={instance.remains! > 1 ? marker_icon : skull_icon}
            >
              <Popup>
                <div className="flex flex-col items-center gap-0">
                  <span>{instance.target!.name}</span>
                  {instance.remains! < 1 ? (
                    <span className="pb-1 text-xs">Истощена</span>
                  ) : (
                    <span className="pb-1 text-xs">
                      Осталось попыток: {instance.remains! - 1}
                    </span>
                  )}
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
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
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
                {hunt.status === "success" ? (
                  <FaCheck />
                ) : hunt.status === "exp_failure" ? (
                  <FaClock />
                ) : (
                  <FaExclamationTriangle />
                )}
                &nbsp;
                {hunt.instance!.target!.name}
              </div>
              <div className="-mt-1 pb-1 text-xs">
                Игрок:&nbsp;{hunt.createdBy?.name}
              </div>
              <div className="-mt-1 pb-1 text-xs">
                Персонаж:&nbsp;{hunt.character?.name}
              </div>
              <div className="-mt-1 pb-1 text-xs">
                Координаты:&nbsp;
                {hunt.instance!.coordY.toFixed(5)},&nbsp;
                {hunt.instance!.coordX.toFixed(5)}
              </div>
              <div className="-mt-1 pb-1 text-xs">
                Дата:&nbsp;
                {hunt.createdAt?.toLocaleString()}
              </div>
              <div className="-mt-1 pb-1 text-xs">
                Статус:&nbsp;
                {hunt.status === "success"
                  ? "Успешно"
                  : hunt.status === "req_failure"
                    ? "Цель не соответствует предпочтениям персонажа"
                    : hunt.status === "exp_failure"
                      ? "Срок цели истёк"
                      : "Нарушение маскарада"}
              </div>
              {hunt.instance!.groundId && (
                <div className="-mt-1 pb-1 text-xs">
                  {hunt.instance!.ground?.name}
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default Hunts;
