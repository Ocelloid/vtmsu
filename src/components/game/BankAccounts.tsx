import { api } from "~/utils/api";
import { useState } from "react";
import { useSession } from "next-auth/react";
import QRScanner from "~/components/QRScanner";
import { LoadingPage } from "~/components/Loading";
import { FaPlus, FaArrowRight, FaQrcode, FaCopy } from "react-icons/fa";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";

export default function BankAccounts({ characterId }: { characterId: number }) {
  const [receiverId, setReceiverId] = useState<string>();
  const [accountId, setAccountId] = useState<number>();
  const [address, setAddress] = useState<string>();
  const [amount, setAmount] = useState<number>(0);
  const { data: sessionData } = useSession();
  const {
    isOpen: isTransferOpen,
    onOpen: onTransferOpen,
    onClose: onTransferClose,
  } = useDisclosure();
  const {
    isOpen: isTransferByCharOpen,
    onOpen: onTransferByCharOpen,
    onClose: onTransferByCharClose,
  } = useDisclosure();
  const {
    data: bankAccounts,
    isLoading: bankAccountsLoading,
    refetch: refetchBankAccounts,
  } = api.econ.getAcconutsByCharId.useQuery(
    { characterId },
    { enabled: !!sessionData },
  );
  const { mutate: transfer, isPending: isTransferPending } =
    api.econ.transferByAddress.useMutation();
  const { mutate: transferByCharId, isPending: isTransferByCharIdPending } =
    api.econ.transferByCharId.useMutation();
  const { mutate: createBankAccount, isPending: isCreateBankAccountPending } =
    api.econ.createBankAccount.useMutation();

  const handleNewAccount = () => {
    const confirmed = confirm("Вы уверены, что хотите создать новый счёт?");
    if (!confirmed) return;
    createBankAccount(
      { characterId },
      {
        onSuccess() {
          void refetchBankAccounts();
        },
      },
    );
  };
  const handleTransfer = () => {
    if (!accountId) return;
    if (!address) return;
    const fromAccount = bankAccounts?.find((a) => a.id === accountId);
    if (!fromAccount) return;
    transfer(
      {
        fromAddress: fromAccount.address,
        toAddress: address,
        amount,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          void refetchBankAccounts();
          onTransferClose();
        },
      },
    );
  };
  const handleScanSuccess = (decodedText: string) => {
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
    setReceiverId(charId);
  };
  const handleTransferByChar = () => {
    if (!receiverId) return;
    const fromAccount = bankAccounts?.find((a) => a.id === accountId);
    if (!fromAccount) return;
    transferByCharId(
      {
        fromAddress: fromAccount.address,
        toId: Number(receiverId),
        amount,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          void refetchBankAccounts();
          onTransferByCharClose();
        },
      },
    );
  };

  if (bankAccountsLoading || isCreateBankAccountPending) return <LoadingPage />;
  return (
    <>
      <Modal
        isOpen={isTransferOpen}
        onClose={onTransferClose}
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
          <ModalHeader>Перевод средств</ModalHeader>
          <ModalBody>
            <p>
              Вы можете перевести средства с одного счёта на другой. Вы можете
              перевести средства из предприятия в счёт персонажа или наоборот.
            </p>
            {!!bankAccounts && (
              <Select
                size="sm"
                variant="bordered"
                placeholder="Выберите счёт"
                aria-label="accounts"
                className="w-full"
                selectedKeys={accountId ? [accountId.toString()] : []}
                onChange={(e) => {
                  setAccountId(
                    !!e.target.value ? Number(e.target.value) : accountId,
                  );
                }}
              >
                {bankAccounts.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id.toString()}
                    textValue={
                      !!account.company
                        ? `Счёт предприятия ${account.company.name}`
                        : `Счёт персонажа ${account.character?.name}`
                    }
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-bold">
                        {!!account.company
                          ? `Счёт предприятия ${account.company.name}`
                          : `Счёт персонажа ${account.character?.name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Адрес: {account.address}
                      </div>
                      <div className="text-sm text-gray-500">
                        Баланс: {account.balance} ОВ
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            )}
            {!!accountId && (
              <Input
                size="sm"
                variant="underlined"
                label="Адрес"
                placeholder="Введите адрес"
                value={address}
                onValueChange={setAddress}
              />
            )}
            {!!accountId && (
              <Input
                size="sm"
                variant="underlined"
                label="Сумма"
                placeholder="Введите сумму"
                value={amount.toString()}
                onValueChange={(e) => setAmount(Number(e) > 0 ? Number(e) : 0)}
              />
            )}
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onTransferClose}>
              Отменить
            </Button>
            <Button
              color="success"
              onClick={handleTransfer}
              isDisabled={isTransferPending}
            >
              Перевести
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isTransferByCharOpen}
        onClose={onTransferByCharClose}
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
          <ModalHeader>Перевод средств</ModalHeader>
          <ModalBody>
            {!!bankAccounts && (
              <Select
                size="sm"
                variant="bordered"
                placeholder="Выберите счёт"
                aria-label="accounts"
                className="w-full"
                selectedKeys={accountId ? [accountId.toString()] : []}
                onChange={(e) => {
                  setAccountId(
                    !!e.target.value ? Number(e.target.value) : accountId,
                  );
                }}
              >
                {bankAccounts.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id.toString()}
                    textValue={
                      !!account.company
                        ? `Счёт предприятия ${account.company.name}`
                        : `Счёт персонажа ${account.character?.name}`
                    }
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-bold">
                        {!!account.company
                          ? `Счёт предприятия ${account.company.name}`
                          : `Счёт персонажа ${account.character?.name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Адрес: {account.address}
                      </div>
                      <div className="text-sm text-gray-500">
                        Баланс: {account.balance} ОВ
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            )}
            {!!accountId && (
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onScanError={(e) => console.error(e)}
              />
            )}
            {!!accountId && (
              <Input
                size="sm"
                variant="underlined"
                label="Сумма"
                placeholder="Введите сумму"
                value={amount.toString()}
                onValueChange={(e) => setAmount(Number(e) > 0 ? Number(e) : 0)}
              />
            )}
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onTransferByCharClose}>
              Отменить
            </Button>
            <Button
              color="success"
              onClick={handleTransferByChar}
              isDisabled={isTransferByCharIdPending}
            >
              Перевести
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="flex h-full flex-col gap-2 pb-2">
        <Button
          onClick={handleNewAccount}
          variant="light"
          color="warning"
          size="sm"
        >
          <FaPlus size={16} /> Создать счёт
        </Button>
        {bankAccounts?.map((account) => (
          <div
            key={account.id}
            className="flex flex-col gap-2 rounded-md border-1 border-warning p-2"
          >
            <div className="font-bold">
              {!!account.company
                ? `Счёт предприятия ${account.company.name}`
                : `Счёт персонажа ${account.character?.name}`}
            </div>
            <Button
              size="sm"
              variant="light"
              className="flex w-min flex-row items-center gap-1 text-sm text-gray-500"
              onClick={() => navigator.clipboard.writeText(account.address)}
            >
              Адрес cчёта: {account.address} <FaCopy size={12} />
            </Button>
            <div className="px-3 text-sm text-gray-500">
              Баланс: {account.balance} ОВ
            </div>
          </div>
        ))}
        <div className="mt-auto flex flex-row justify-between gap-2">
          <Button
            onClick={onTransferByCharOpen}
            variant="light"
            color="warning"
          >
            <FaQrcode size={24} /> Перевод по QR
          </Button>
          <Button onClick={onTransferOpen} variant="light" color="warning">
            Перевод на счёт <FaArrowRight size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
