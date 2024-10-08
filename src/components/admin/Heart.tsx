/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";

export default function Heart() {
  const { data: heartData, isLoading } = api.util.getHeartUsage.useQuery(
    undefined,
    {
      refetchInterval: 5000,
    },
  );
  if (isLoading) return <LoadingPage />;
  if (!!heartData)
    return (
      <div className="flex flex-col gap-2 py-2">
        <HeartForm />
        {heartData.map((hd) => (
          <div key={hd.char.id} className="grid grid-cols-3">
            <p>{hd.createdAt.toLocaleString()}</p>
            <p>{hd.ashes?.createdBy.name ?? "-"}</p>
            <p>{hd.focus?.createdBy.name ?? "-"}</p>
            <p>{hd.char.name}</p>
            <p>{hd.ashesName}</p>
            <p>{hd.focusName}</p>
            <p className="col-span-3">{hd.content}</p>
          </div>
        ))}
      </div>
    );
  return null;
}

function HeartForm() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClans, setSelectedClans] = useState<number[]>([]);
  const { mutate: mutateRemoveExpertAbilities } =
    api.util.removeExpertAbilities.useMutation();
  const { mutate: mutateGiveExpertAbilities } =
    api.util.giveExpertAbilities.useMutation();
  const { mutate: mutateRemoveClanCurse } =
    api.util.removeClanCurse.useMutation();
  const { mutate: mutateGiveClanCurse } = api.util.giveClanCurse.useMutation();
  const { data: clans } = api.char.getClans.useQuery();

  const handleRemoveExpertAbilities = () => {
    const confirmed = confirm(
      "Вы уверены, что хотите убрать экспертные дисциплины?",
    );
    if (!confirmed) return;
    if (!selectedClans.length) return;
    mutateRemoveExpertAbilities(
      {
        selectedClans,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          onClose();
        },
      },
    );
  };

  const handleGiveExpertAbilities = () => {
    const confirmed = confirm(
      "Вы уверены, что хотите выдать экспертные дисциплины?",
    );
    if (!confirmed) return;
    if (!selectedClans.length) return;
    mutateGiveExpertAbilities(
      {
        selectedClans,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          onClose();
        },
      },
    );
  };

  const handleRemoveClanCurse = () => {
    const confirmed = confirm(
      "Вы уверены, что хотите убрать клановое проклятье?",
    );
    if (!confirmed) return;
    if (!selectedClans.length) return;
    mutateRemoveClanCurse(
      {
        selectedClans,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          onClose();
        },
      },
    );
  };

  const handleGiveClanCurse = () => {
    const confirmed = confirm(
      "Вы уверены, что хотите выдать клановое проклятье?",
    );
    if (!confirmed) return;
    if (!selectedClans.length) return;
    mutateGiveClanCurse(
      {
        selectedClans,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          onClose();
        },
      },
    );
  };

  return (
    <>
      <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Сердце города</ModalHeader>
          <ModalBody>
            {!!clans && (
              <Select
                size="lg"
                variant="bordered"
                placeholder="Клан"
                aria-label="Клан"
                selectionMode="multiple"
                selectedKeys={selectedClans.map((f) => f.toString())}
                onChange={(e) => {
                  setSelectedClans(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {clans.map((clan) => (
                  <SelectItem
                    key={clan.id}
                    value={clan.id}
                    textValue={clan.name}
                  >
                    {clan.name}
                  </SelectItem>
                ))}
              </Select>
            )}
            <Button size="lg" onClick={handleRemoveClanCurse}>
              Убрать проклятье
            </Button>
            <Button size="lg" onClick={handleGiveClanCurse}>
              Выдать проклятье
            </Button>
            <Button size="lg" onClick={handleRemoveExpertAbilities}>
              Убрать экспертные дисциплины
            </Button>
            <Button size="lg" onClick={handleGiveExpertAbilities}>
              Выдать экспертные дисциплины
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Button onClick={onOpen} variant="light" color="warning">
        Сердце города
      </Button>
    </>
  );
}
