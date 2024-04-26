"use client";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import Image from "next/image";
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
import type { HuntingInstance, HuntingData } from "~/server/api/routers/hunt";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect, useMemo, useRef } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { api } from "~/utils/api";

const icon = L.icon({ iconUrl: "/crosshair.png" });

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
  updatePosition: (p: LatLngExpression) => void;
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
      icon={icon}
    >
      <Popup>Новая цель</Popup>
    </Marker>
  );
};

const Instances = () => {
  const [targets, setTargets] = useState<HuntingData[]>([]);
  const [instances, setInstances] = useState<HuntingInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<LatLng>();
  const [expires, setExpires] = useState<Date>();
  const [targetId, setTargetId] = useState<number>(0);
  const [coordX, setCoordX] = useState<number>(0);
  const [coordY, setCoordY] = useState<number>(0);
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
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    const confirmDelete = confirm("Удалить добычу?");
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
          coordX: coordX,
          coordY: coordY,
          targetId: targetId,
          expires: expires,
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
          coordX: coordX,
          coordY: coordY,
          targetId: targetId,
          expires: expires,
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
    return;
  };

  if (isInstancesLoading || isTargetsLoading) return <LoadingPage />;
  console.log(position);

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
          body: "py-6",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {!!id ? "Редактировать" : "Добавить"} цель по координатам{" "}
            {position?.lat.toFixed(5)}, {position?.lng.toFixed(5)}
          </ModalHeader>
          <ModalBody className="-my-8 flex flex-col"></ModalBody>
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
              color="danger"
              onClick={handleDelete}
              isDisabled={isCreatePending || isUpdatePending || isDeletePending}
              className="mr-auto"
            >
              Удалить
            </Button>
            <Button
              variant="solid"
              color="success"
              onClick={handleFormSubmit}
              isDisabled={isCreatePending || isUpdatePending || isDeletePending}
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
        <InstanceMapControl />
        <DraggableInstance updatePosition={(p) => setPosition(p)} />
        {instances.map((instance) => (
          <Marker key={instance.id} position={[coordY, coordX]}>
            <Popup>{instance.target!.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="-mb-4 grid w-full grid-cols-1 gap-2 md:-mb-0 md:-mt-2 md:grid-cols-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="bordered"
          isDisabled={!position}
          className="my-auto flex min-w-44 flex-row border-black bg-transparent text-black dark:border-white dark:text-white"
        >
          <FaPlus size={16} />
          &nbsp;Добавить цель
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
              {`${instance.target!.name} - ${instance.target!.descs?.length} охот${!!instance.target!.descs?.length && (instance.target!.descs?.length === 1 ? "а" : instance.target!.descs?.length < 5 ? "ы" : "")}`}
              <Button
                variant="light"
                color="warning"
                className="ml-auto h-8 w-8 min-w-0 rounded-full p-0"
                onClick={() => handleInstanceEdit(instance)}
              >
                <FaPencilAlt size={16} />
              </Button>
            </div>
            <div className="flex max-h-20 flex-row overflow-hidden text-ellipsis text-justify text-xs">
              {instance.target!.descs![0]!.content}
            </div>
          </div>
        ))}
    </>
  );
};

export default Instances;
