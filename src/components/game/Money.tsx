import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useState, useEffect, type ReactNode } from "react";
import DefaultEditor from "~/components/editors/DefaultEditor";
import { UploadButton } from "~/utils/uploadthing";
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
  Button,
} from "@nextui-org/react";
import { FaPencilAlt, FaPlus, FaGift } from "react-icons/fa";
import { useGeolocation } from "~/utils/hooks";
import { degreesToCoordinate } from "~/utils/text";
import { type Company } from "~/server/api/routers/econ";
import { type Character } from "~/server/api/routers/char";
import QRScanner from "~/components/QRScanner";

export default function Money({ characterId }: { characterId: number }) {
  const { data: sessionData } = useSession();
  const {
    data: companies,
    isLoading: companiesLoading,
    refetch: refetchCompanies,
  } = api.econ.getByCharacterId.useQuery(
    { characterId },
    { enabled: !!sessionData },
  );

  if (companiesLoading) return <LoadingPage />;

  return (
    <div className="flex flex-col gap-2">
      <CompanyForm characterId={characterId} onRefetch={refetchCompanies} />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        {companies?.map((company) => (
          <div
            className="flex w-full flex-col rounded border border-warning p-2"
            key={company.id}
          >
            <div className="text-lg font-bold">Название: {company.name}</div>
            <div className="text-lg font-bold">
              Координаты: {degreesToCoordinate(company.coordX)},{" "}
              {degreesToCoordinate(company.coordY)}
            </div>
            <div className="text-muted text-sm">
              Счета:
              <div className="flex flex-col gap-2 pl-4">
                {company.BankAccount?.map((bankAccount) => (
                  <div key={bankAccount.id} className="flex flex-col gap-0">
                    <div className="font-bold">
                      Адрес: {bankAccount.address}
                    </div>
                    <div className="text-muted text-sm">
                      Счёт: {bankAccount.balance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
              <CompanyForm
                characterId={characterId}
                onRefetch={refetchCompanies}
                editId={company.id}
              >
                <FaPencilAlt size={12} /> Редактировать
              </CompanyForm>
              <CompanySend company={company} onRefetch={refetchCompanies}>
                <FaGift size={12} /> Передать
              </CompanySend>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanySend({
  company,
  onRefetch,
  children,
}: {
  company: Company;
  onRefetch?: () => void;
  children: ReactNode;
}) {
  const {
    isOpen: isTradeOpen,
    onOpen: onTradeOpen,
    onClose: onTradeClose,
  } = useDisclosure();
  const [char, setChar] = useState<Character>();
  const { mutate: setOwner, isPending: isTradePending } =
    api.econ.setOwner.useMutation();
  const { data: chars, isLoading: charsLoading } = api.char.getAll.useQuery();

  const handleTrade = () => {
    if (!char) return;
    setOwner(
      {
        id: company.id,
        characterId: char.id,
      },
      {
        onSuccess() {
          void onRefetch?.();
          onTradeClose();
        },
      },
    );
  };

  const handleScanSuccess = (decodedText: string) => {
    if (!chars) {
      alert("Отсутствует список персонажей");
      return;
    }
    if (!decodedText) {
      alert("QR-код пуст");
      return;
    }
    const charId = decodedText.split("-")[0];
    const timecode = decodedText.split("-")[1];
    if (!charId) {
      alert("Отсутствует ID персонажа");
      return;
    }
    if (!timecode) {
      alert("Отсутствует таймкод");
      return;
    }
    const diffMs = Date.now() - Number(timecode);
    if (diffMs > 1000 * 60 * 60) {
      alert("QR-код устарел");
      return;
    }
    const char = chars.find((c) => c.id === Number(charId));
    if (!char) {
      alert("Персонаж не найден");
      return;
    }
    setChar(char);
  };

  if (isTradePending || charsLoading)
    return <LoadingSpinner height={24} className="m-auto" />;

  return (
    <>
      <Modal isOpen={isTradeOpen} onClose={onTradeClose}>
        <ModalContent>
          <ModalHeader>Передача компании</ModalHeader>
          <ModalBody>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(e) => console.error(e)}
            />
            <p>
              Вы отправите персонажу {char?.name} компанию: {company.name}
            </p>
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onTradeClose}>
              Отменить
            </Button>
            <Button color="success" onClick={handleTrade} isDisabled={!char}>
              Отправить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button onClick={onTradeOpen} variant="light" size="sm" color="warning">
        {children}
      </Button>
    </>
  );
}

function CompanyForm({
  characterId,
  onRefetch,
  children,
  editId,
}: {
  characterId: number;
  onRefetch?: () => void;
  children?: ReactNode;
  editId?: string;
}) {
  const { location, error, isLoading } = useGeolocation();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isWarrens, setIsWarrens] = useState(false);
  const { data: balance, isLoading: isBalanceLoading } =
    api.econ.getBalance.useQuery({ characterId });
  const { mutate: createMutation, isPending } = api.econ.create.useMutation();
  const { mutate: updateMutation, isPending: isPendingUpdate } =
    api.econ.update.useMutation();
  const { data: companyData, isLoading: isCompanyLoading } =
    api.econ.getById.useQuery(
      {
        id: editId!,
      },
      { enabled: !!editId },
    );

  const resetForm = () => {
    setName("");
    setContent("");
    setImage("");
    setIsVisible(false);
    setIsWarrens(false);
  };

  useEffect(() => {
    if (!!companyData) {
      setName(companyData?.name ?? "");
      setContent(companyData?.content ?? "");
      setImage(companyData?.image ?? "");
      setIsVisible(companyData?.isVisible ?? false);
      setIsWarrens(companyData?.isWarrens ?? false);
    }
  }, [companyData]);

  const handleFormSubmit = () => {
    if (!editId) {
      if (!location) return;
      createMutation(
        {
          name: name,
          content: content,
          image,
          isVisible,
          isWarrens,
          characterId,
          coordX: location.latitude,
          coordY: location.longitude,
        },
        {
          onSuccess() {
            resetForm();
            if (onRefetch) onRefetch();
            onModalClose();
          },
        },
      );
    } else
      updateMutation(
        {
          id: editId,
          name: name,
          content: content,
          image,
          isVisible,
          isWarrens,
        },
        {
          onSuccess() {
            resetForm();
            if (onRefetch) onRefetch();
            onModalClose();
          },
        },
      );
  };

  if (isCompanyLoading || isBalanceLoading || isLoading)
    return <LoadingSpinner height={24} className="m-auto" />;

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onOpenChange={onModalOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        size="2xl"
        placement="top-center"
        backdrop="blur"
        classNames={{
          wrapper: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100 mt-24",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {!!editId ? "Редактирование компании" : "Добавить компанию"}
          </ModalHeader>
          <ModalBody>
            <p>
              по координатам:{" "}
              {location
                ? `(${degreesToCoordinate(location.latitude)}, ${degreesToCoordinate(location.longitude)})`
                : error}
            </p>
            {!editId && (
              <>
                <p>Ваш баланс: {balance ?? 0} ОВ</p>
                <p>Стоимость компании: 500 ОВ</p>
              </>
            )}
            <Input
              size="sm"
              variant="underlined"
              label="Название"
              placeholder="Введите название"
              value={name}
              onValueChange={setName}
            />
            <DefaultEditor
              label="Контент"
              className="min-h-44 sm:min-h-20"
              initialContent={content}
              onUpdate={setContent}
              placeholder="Введите описание"
            />
            <UploadButton
              content={{
                button: "Загрузить",
                allowedContent: "Изображение (до 4 Мб)",
              }}
              className="cursor-pointer"
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setImage(res[0]?.url ?? "");
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onModalClose} className="mr-auto">
              Отменить
            </Button>
            <Button
              variant="solid"
              color="success"
              isDisabled={
                isPending ||
                isPendingUpdate ||
                !name ||
                !content ||
                (!editId && (balance ?? 0) < 500)
              }
              onClick={handleFormSubmit}
            >
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button onClick={onModalOpen} variant="light" size="sm" color="warning">
        {children ? (
          children
        ) : (
          <div className="m-auto flex flex-row items-center gap-2 text-lg">
            <FaPlus size={24} />
            Добавить компанию
          </div>
        )}
      </Button>
    </>
  );
}
