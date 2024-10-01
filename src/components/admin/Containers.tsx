import { api } from "~/utils/api";
import { useState } from "react";
import { LoadingPage } from "~/components/Loading";
import { FaPencilAlt, FaTrashAlt, FaDownload } from "react-icons/fa";
import {
  Button,
  Modal,
  ModalContent,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import QRCode from "qrcode";

export default function Containers() {
  const {
    data: containers,
    isLoading: containersLoading,
    refetch: refetchContainers,
  } = api.item.getAllContainers.useQuery();
  const { mutate: deleteContainer } = api.item.deleteContainer.useMutation();

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Вы уверены, что хотите удалить этот контейнер?",
    );
    if (!confirm) return;
    deleteContainer({ id });
    void refetchContainers();
  };

  const generateQRCode = (url: string) => {
    QRCode.toDataURL(url, { width: 1024, margin: 2 }, (err, url) => {
      if (err) throw err;
      const aEl = document.createElement("a");
      aEl.href = url;
      aEl.download = "QR_Code.png";
      document.body.appendChild(aEl);
      aEl.click();
      document.body.removeChild(aEl);
    });
  };

  if (containersLoading) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-2 pt-2">
      <ContainerForm onRefetch={refetchContainers} />
      {containers?.map((container) => (
        <div
          key={container.id}
          className="flex w-auto flex-row items-center justify-between rounded-lg bg-white/75 p-2 dark:bg-red-950/50"
        >
          <div className="flex flex-col gap-1">
            <p>{container.name}</p>
            <p className="text-sm text-gray-500">{container.content}</p>
          </div>
          <div className="flex flex-row gap-1">
            <Button
              size="sm"
              variant="light"
              className="w-10 min-w-10"
              onClick={() =>
                generateQRCode(`https://vtm.su/container/${container.id}`)
              }
            >
              <FaDownload />
            </Button>
            <Button
              variant="light"
              size="sm"
              className="flex min-w-10 flex-row gap-0 bg-transparent text-black dark:text-red-100"
              onClick={() => handleDelete(container.id)}
            >
              <FaTrashAlt size={12} />
            </Button>
            <ContainerForm editId={container.id} onRefetch={refetchContainers}>
              <FaPencilAlt />
            </ContainerForm>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContainerForm({
  editId,
  onRefetch,
  children,
}: {
  editId?: string;
  onRefetch?: () => void;
  children?: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const { mutate: updateContainer, isPending: isUpdateContainerPending } =
    api.item.updateContainer.useMutation();
  const { mutate: createContainer, isPending: isCreateContainerPending } =
    api.item.createContainer.useMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = () => {
    if (!editId) {
      void createContainer(
        { name, content },
        {
          onSuccess() {
            onRefetch?.();
            onClose();
          },
        },
      );
    } else {
      void updateContainer(
        { id: editId, name, content },
        {
          onSuccess() {
            onRefetch?.();
            onClose();
          },
        },
      );
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {!!editId ? "Редактирование" : "Создание"} контейнера
          </ModalHeader>
          <ModalBody>
            <Input
              size="sm"
              variant="underlined"
              label="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              size="sm"
              variant="underlined"
              label="Описание"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between">
            <Button onClick={onClose}>Закрыть</Button>
            <Button
              onClick={handleSubmit}
              disabled={!name || !content}
              isDisabled={isUpdateContainerPending || isCreateContainerPending}
            >
              {!!editId ? "Сохранить" : "Создать"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button variant="light" size="sm" onClick={onOpen} className="min-w-10">
        {children ?? "Создать"}
      </Button>
    </>
  );
}