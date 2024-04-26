import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import Image from "next/image";
import type { HuntingData } from "~/server/api/routers/hunt";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaPlusCircle,
  FaTrashAlt,
  FaImage,
  FaPencilAlt,
} from "react-icons/fa";
import default_char from "~/../public/default_char.png";
import { UploadButton } from "~/utils/uploadthing";
import { api } from "~/utils/api";

const Targets = () => {
  const [targets, setTargets] = useState<HuntingData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [id, setId] = useState<number>();
  const [name, setName] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [req, setReq] = useState<string>("");
  const [descs, setDescs] = useState<string[]>([""]);
  const [uploading, setUploading] = useState<boolean>(false);

  const {
    data: targetsData,
    isLoading: isTargetsLoading,
    refetch: refetchTargets,
  } = api.hunt.getAllHuntingTargets.useQuery();

  const { mutate: newTarget, isPending: isCreatePending } =
    api.hunt.createHuntingTarget.useMutation();

  const { mutate: updateTarget, isPending: isUpdatePending } =
    api.hunt.updateHuntingTarget.useMutation();

  const { mutate: deleteTarget, isPending: isDeletePending } =
    api.hunt.deleteHuntingTarget.useMutation();

  useEffect(() => {
    if (!!targetsData) setTargets(targetsData);
  }, [targetsData]);

  const handleTargetEdit = (t: HuntingData) => {
    setId(t.id);
    setImage(t.image ?? "");
    setName(t.name ?? "");
    setReq(t.hunt_req ?? "");
    setDescs(!!t.descs ? t.descs.map((d) => d.content ?? "") : [""]);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    const confirmDelete = confirm("Удалить добычу?");
    if (confirmDelete && !!id)
      deleteTarget(
        { id: id },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            void refetchTargets();
            handleClear();
          },
        },
      );
  };

  const handleFormSubmit = () => {
    if (!!name && !!descs.length && !!descs[0])
      if (!!id) {
        updateTarget(
          { id: id, name: name, descs: descs, req: req, image: image },
          {
            onSuccess: () => {
              setIsModalOpen(false);
              void refetchTargets();
              handleClear();
            },
          },
        );
      } else
        newTarget(
          { name: name, descs: descs, req: req, image: image },
          {
            onSuccess: () => {
              setIsModalOpen(false);
              void refetchTargets();
              handleClear();
            },
          },
        );
  };

  const handleClear = () => {
    setImage("");
    setName("");
    setReq("");
    setDescs([""]);
  };

  const addDesc = () => {
    const newDescs = [...descs];
    newDescs.push("");
    setDescs(newDescs);
  };

  const removeDesc = (i: number) => {
    const newDescs = [...descs];
    newDescs.splice(i, 1);
    setDescs(newDescs);
  };

  if (isTargetsLoading) return <LoadingPage />;

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
            {!!id ? "Редактировать" : "Добавить"} добычу
          </ModalHeader>
          <ModalBody className="-my-8 flex flex-col">
            <div className="relative mx-auto flex w-full flex-col">
              {uploading ? (
                <LoadingSpinner width={80} height={80} />
              ) : (
                <Image
                  className="aspect-square h-[196px] w-full rounded-md object-cover"
                  alt="char_photo"
                  src={!!image ? image : default_char}
                  height="440"
                  width="440"
                />
              )}
              <UploadButton
                content={{
                  button: (
                    <>
                      <FaImage size={16} className="ml-2" />
                      <p className="hidden text-sm sm:flex">{`Фото (до 4 Мб)`}</p>
                    </>
                  ),
                  allowedContent: "Изображение (1 Мб)",
                }}
                className="absolute bottom-2 left-1/2 z-20 mx-auto mt-2 h-8 w-full max-w-[160px] -translate-x-1/2 cursor-pointer text-white [&>div]:hidden [&>div]:text-sm [&>label>svg]:mr-1 [&>label]:w-full [&>label]:min-w-[84px] [&>label]:flex-1 [&>label]:rounded-medium [&>label]:border-2 [&>label]:border-white [&>label]:bg-transparent [&>label]:focus-within:ring-0 [&>label]:hover:bg-white/25"
                endpoint="imageUploader"
                onUploadBegin={() => {
                  setUploading(true);
                }}
                onClientUploadComplete={(res) => {
                  setImage(res[0]?.url ?? "");
                  setUploading(false);
                }}
              />
            </div>
            <Input
              variant="underlined"
              label="Название"
              placeholder="Введите название"
              value={name}
              onValueChange={setName}
            />
            <Input
              variant="underlined"
              label="Предпочтение в питании"
              placeholder="Введите предпочтение в питании"
              value={req}
              onValueChange={setReq}
            />
            {descs.map((desc, i) => (
              <div key={"ta_" + i} className="flex flex-row">
                <Textarea
                  variant="bordered"
                  label={`Описание - ${i + 1}`}
                  placeholder={`Введите описание ${i + 1}-й охоты`}
                  value={desc}
                  onValueChange={(v) => {
                    const newDescs = [...descs];
                    newDescs[i] = v;
                    setDescs(newDescs);
                  }}
                />
                <Button
                  variant="bordered"
                  className="mx-2 my-auto min-w-0"
                  color={i === descs.length - 1 ? "warning" : "danger"}
                  onClick={() => {
                    if (i === descs.length - 1) addDesc();
                    else removeDesc(i);
                  }}
                >
                  {i === descs.length - 1 ? (
                    <FaPlusCircle size={24} />
                  ) : (
                    <FaTrashAlt size={24} />
                  )}
                </Button>
              </div>
            ))}
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
              isDisabled={
                isCreatePending ||
                isUpdatePending ||
                isDeletePending ||
                !name ||
                !descs[0]
              }
            >
              {!!id ? "Обновить" : "Добавить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="-mb-4 grid w-full grid-cols-1 gap-2 md:-mb-0 md:-mt-2 md:grid-cols-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="bordered"
          className="my-auto flex min-w-44 flex-row gap-0 border-black bg-transparent text-black dark:border-white dark:text-white"
        >
          <FaPlus size={16} />
          &nbsp;Добавить добычу
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
      {targets
        .filter((t) =>
          !!search ? t.name.toLowerCase().includes(search) : true,
        )
        .map((target) => (
          <div
            key={target.id}
            className="flex flex-col rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
          >
            <div className="flex flex-row items-center pb-2 text-xl">
              {`${target.name} - ${target.descs?.length} охот${!!target.descs?.length && (target.descs?.length === 1 ? "а" : target.descs?.length < 5 ? "ы" : "")}`}
              <Button
                variant="light"
                color="warning"
                className="ml-auto h-8 w-8 min-w-0 rounded-full p-0"
                onClick={() => handleTargetEdit(target)}
              >
                <FaPencilAlt size={16} />
              </Button>
            </div>
            <div className="flex max-h-20 flex-row overflow-hidden text-ellipsis text-justify text-xs">
              {target.descs![0]!.content}
            </div>
          </div>
        ))}
    </>
  );
};

export default Targets;
