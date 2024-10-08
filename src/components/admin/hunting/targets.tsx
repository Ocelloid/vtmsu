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
  const [flag, setFlag] = useState<string>("");
  const [descs, setDescs] = useState<string[]>(["", ""]);
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
    setDescs(!!t.descs ? t.descs.map((d) => d.content ?? "") : ["", ""]);
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
    setId(undefined);
    setDescs(["", ""]);
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

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

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
            {!!id ? "Редактировать" : "Добавить"} добычу
          </ModalHeader>
          <ModalBody className="flex flex-col">
            <div className="relative mx-auto flex w-full flex-col">
              {uploading ? (
                <LoadingSpinner width={80} height={80} />
              ) : (
                <Image
                  className="aspect-square h-[196px] w-full rounded-md object-scale-down"
                  alt="char_photo"
                  src={!!image ? image : default_char}
                  height="440"
                  width="440"
                />
              )}
              {!isLocalhost ? (
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
              ) : (
                <Input
                  value={image}
                  onValueChange={setImage}
                  label="Фото добычи"
                  placeholder="Введите ссылку на фото - воспользуйтесь imgBB например"
                />
              )}
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
                  label={
                    i + 1 === descs.length
                      ? "Описание нарушения маскарада"
                      : `Описание ${i + 1}-й охоты`
                  }
                  placeholder={
                    i + 1 === descs.length
                      ? "Введите описание нарушения маскарада"
                      : `Введите описание ${i + 1}-й охоты`
                  }
                  value={desc}
                  onValueChange={(v) => {
                    const newDescs = [...descs];
                    newDescs[i] = v;
                    setDescs(newDescs);
                  }}
                />
                <div className="flex flex-col">
                  {descs.length > 2 && i !== descs.length - 1 && (
                    <Button
                      variant="bordered"
                      className="mx-2 my-auto min-w-0"
                      color="danger"
                      onClick={() => removeDesc(i)}
                    >
                      <FaTrashAlt size={24} />
                    </Button>
                  )}
                  {i === descs.length - 2 && (
                    <Button
                      variant="bordered"
                      className="mx-2 my-auto min-w-0"
                      color="warning"
                      onClick={addDesc}
                    >
                      <FaPlusCircle size={24} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
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
          onClick={() => {
            setIsModalOpen(true);
            if (!!flag) setReq(flag);
          }}
          variant="bordered"
          className="my-auto flex min-w-44 flex-row gap-0 border-black bg-transparent text-black dark:border-white dark:text-white"
        >
          <FaPlus size={16} />
          &nbsp;Добавить
        </Button>
        <Input
          variant="underlined"
          label="Поиск"
          placeholder="Введите название"
          className="md:col-span-2"
          value={search}
          onValueChange={setSearch}
        />
        <Input
          variant="underlined"
          label="Поиск"
          placeholder="Введите предпочтение"
          className="md:col-span-1"
          value={flag}
          onValueChange={setFlag}
        />
      </div>
      {targets
        .filter((t) =>
          !!search ? t.name.toLowerCase().includes(search.toLowerCase()) : true,
        )
        .filter((t) =>
          !!flag
            ? t.hunt_req?.toLowerCase().includes(flag.toLowerCase())
            : true,
        )
        .map((target) => (
          <div
            key={target.id}
            className="flex flex-col rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
          >
            <div className="flex flex-row items-center pb-2 text-xl">
              {target.name}
              <Button
                variant="light"
                color="warning"
                className="ml-auto h-8 w-8 min-w-0 rounded-full p-0"
                onClick={() => handleTargetEdit(target)}
              >
                <FaPencilAlt size={16} />
              </Button>
            </div>
            {!!target.descs?.length && (
              <div className="-mt-2 pb-1 text-xs">
                {target.descs?.length - 1}&nbsp;
                {target.descs?.length === 2
                  ? "охота"
                  : target.descs?.length < 6
                    ? "охоты"
                    : "охот"}
              </div>
            )}
            <div className="flex max-h-20 flex-row overflow-hidden text-ellipsis text-justify text-xs">
              {target.descs![0]!.content}
            </div>
          </div>
        ))}
    </>
  );
};

export default Targets;
