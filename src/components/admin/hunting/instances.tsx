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
import type { HuntingInstance } from "~/server/api/routers/hunt";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { api } from "~/utils/api";

const Instances = () => {
  const [instances, setInstances] = useState<HuntingInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

  const { mutate: newInstance, isPending: isCreatePending } =
    api.hunt.createHuntingInstance.useMutation();

  const { mutate: updateInstance, isPending: isUpdatePending } =
    api.hunt.updateHuntingInstance.useMutation();

  useEffect(() => {
    if (!!instancesData) setInstances(instancesData);
  }, [instancesData]);

  const handleInstanceEdit = (t: HuntingInstance) => {
    setId(t.id);
    setIsModalOpen(true);
  };

  const handleFormSubmit = () => {
    if (!!id) {
      updateInstance(
        { id: id, coordX: coordX, coordY: coordY },
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
        { coordX: coordX, coordY: coordY, targetId: targetId },
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

  if (isInstancesLoading || isCreatePending || isUpdatePending)
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
          body: "py-6",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Добавить добычу</ModalHeader>
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
              color="success"
              onClick={handleFormSubmit}
              isDisabled={isCreatePending || isUpdatePending}
            >
              Добавить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="-mb-4 grid w-full grid-cols-1 gap-2 md:-mb-0 md:-mt-2 md:grid-cols-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="bordered"
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
