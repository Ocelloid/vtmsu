import DefaultMap from "~/components/DefaultMap";
import {
  Divider,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { useState } from "react";
import {
  GiFactory,
  GiHumanTarget,
  GiChalkOutlineMurder,
  GiCardboardBoxClosed,
} from "react-icons/gi";
import { FcFactoryBreakdown } from "react-icons/fc";
import type { Item } from "~/server/api/routers/item";
import type { Company } from "~/server/api/routers/econ";
import type { HuntingInstance } from "~/server/api/routers/hunt";
import { LoadingSpinner } from "~/components/Loading";

export default function City({
  characterId,
  refetch,
}: {
  characterId: number;
  refetch: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: geoOpen,
    onOpen: geoOnOpen,
    onClose: geoOnClose,
  } = useDisclosure();
  const { mutate: lookAround, isPending: lookAroundPending } =
    api.util.getLookAround.useMutation();
  const { mutate: collectItem, isPending: collectItemPending } =
    api.item.collectItem.useMutation();
  const { mutate: newHunt, isPending: isHuntPending } =
    api.hunt.createHunt.useMutation();
  const { mutate: toggleActive, isPending: isToggleActivePending } =
    api.econ.toggleActive.useMutation();
  const { mutate: racket, isPending: isRacketPending } =
    api.econ.racket.useMutation();
  const { mutate: investigate, isPending: isInvestigatePending } =
    api.hunt.investigate.useMutation();
  const { mutate: coverUp, isPending: isCoverUpPending } =
    api.hunt.coverUp.useMutation();

  const [items, setItems] = useState<Item[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [huntingInstances, setHuntingInstances] = useState<HuntingInstance[]>(
    [],
  );
  const [violations, setViolations] = useState<HuntingInstance[]>([]);

  const handleLookAround = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      lookAround(
        {
          x: pos.coords.longitude,
          y: pos.coords.latitude,
          charId: characterId,
        },
        {
          onSuccess: (e) => {
            onOpen();
            if (!!e.message) alert(e.message);
            if (!!e.availableItems) setItems(e.availableItems);
            if (!!e.availableCompanies) setCompanies(e.availableCompanies);
            if (!!e.availableHuntingInstances)
              setHuntingInstances(e.availableHuntingInstances);
            if (!!e.availableViolations) setViolations(e.availableViolations);
          },
        },
      );
    });
  };

  const handleAttack = (instance: HuntingInstance) => {
    const confirmed = confirm(
      `Вы хотите атаковать ${instance.target?.name ?? "Цель для охоты"}?`,
    );
    if (!confirmed) return;
    newHunt(
      { characterId, instanceId: instance.id! },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          if (e?.hunt?.status === "exp_failure") alert("Цель сбежала");
          if (e?.hunt?.status === "masq_failure") alert("Нарушение маскарада");
          if (e?.hunt?.status === "req_failure")
            alert("Цель не соответствует предпочтениям персонажа");
          if (e?.hunt?.status === "success") alert("Успешная охота");
          handleLookAround();
          void refetch();
        },
      },
    );
  };

  const handleCollectItem = (item: Item) => {
    const confirmed = confirm(`Вы хотите подобрать ${item.name}?`);
    if (!confirmed) return;
    collectItem(
      {
        id: item.id!,
        charId: characterId,
      },
      {
        onSuccess(e) {
          if (!!e?.message) alert(e.message);
          else handleLookAround();
        },
      },
    );
  };

  const handleSabotage = (company: Company) => {
    const confirmed = confirm(
      `Вы хотите ${
        company.isActive ? "атаковать" : "восстановить"
      } ${company.name}? Это будет стоить вам ${
        company.level * 1000 - 500
      } ОВ. ${
        company.isActive
          ? "Владелец узнает о случившемся, но не будет знать, кто это сделал."
          : ""
      }`,
    );
    if (!confirmed) return;
    toggleActive(
      {
        id: company.id,
        charId: characterId,
      },
      {
        onSuccess(e) {
          if (!!e?.message) alert(e.message);
          handleLookAround();
        },
      },
    );
  };

  const handleRacket = (company: Company) => {
    const confirmed = confirm(
      `Вы хотите захватить ${company.name}? Это будет стоить вам ${
        (company.level - 1) * 4000 + 2000
      } ОВ. Владелец узнает, что это сделали вы.`,
    );
    if (!confirmed) return;
    racket(
      {
        id: company.id,
        charId: characterId,
      },
      {
        onSuccess(e) {
          if (!!e?.message) alert(e.message);
          handleLookAround();
        },
      },
    );
  };

  const handleInvestigate = (violation: HuntingInstance) => {
    const confirmed = confirm(
      `Вы хотите расследовать ${violation.target?.name}? Это будет стоить вам ${
        (violation.target?.descs?.length ?? 0) * 10
      } ОВ.`,
    );
    if (!confirmed) return;
    if (!violation.id) return;
    investigate(
      {
        id: violation.id,
        charId: characterId,
      },
      {
        onSuccess: (e) => {
          if (e?.message) alert(e.message);
        },
      },
    );
  };

  const handleCoverUp = (violation: HuntingInstance) => {
    const confirmed = confirm(
      `Вы хотите прикрыть ${violation.target?.name}? Это будет стоить вам ${
        (violation.target?.descs?.length ?? 0) * 50
      } ОВ.`,
    );
    if (!confirmed) return;
    if (!violation.id) return;
  };

  return (
    <div className="flex h-full w-full flex-col gap-1 pb-1">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
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
          <ModalHeader>Осмотреться</ModalHeader>
          <ModalBody className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto">
            Вы видите рядом с собой...
            {violations.map((violation) => (
              <div
                key={violation.id + "_violation"}
                className="flex flex-col gap-1"
              >
                <div className="flex flex-row items-center gap-1 text-lg">
                  <GiChalkOutlineMurder size={32} className="min-w-8" />
                  <div className="flex flex-col gap-0">
                    {violation.target?.name ?? "Нарушение маскарада"}
                    <div className="text-justify text-sm">
                      {
                        violation.target?.descs![
                          violation.target?.descs!.length - violation.remains!
                        ]!.content
                      }
                    </div>
                  </div>
                </div>
                <div className={"flex flex-row justify-between gap-1"}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    isDisabled={isInvestigatePending || lookAroundPending}
                    onClick={() => handleInvestigate(violation)}
                  >
                    Расследовать
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    isDisabled={isCoverUpPending || lookAroundPending}
                    onClick={() => handleCoverUp(violation)}
                  >
                    Прикрыть
                  </Button>
                </div>
              </div>
            ))}
            {!!violations.length && <Divider />}
            {huntingInstances.map((instance) => (
              <div
                key={instance.id + "_instance"}
                className="flex flex-col gap-1"
              >
                <div className="flex flex-row items-center gap-1 text-lg">
                  <GiHumanTarget size={32} className="min-w-8" />
                  <div className="flex flex-col gap-0">
                    {instance.target?.name ?? "Цель для охоты"}
                    <div className="text-justify text-sm">
                      {
                        instance.target?.descs![
                          instance.target?.descs!.length - instance.remains!
                        ]!.content
                      }
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={isHuntPending || lookAroundPending}
                  onClick={() => handleAttack(instance)}
                >
                  Охота
                </Button>
              </div>
            ))}
            {!!huntingInstances.length && <Divider />}
            {items.map((item) => (
              <div key={item.id + "_item"} className="flex flex-col gap-1">
                <div className="flex flex-row items-center gap-1 text-lg">
                  <GiCardboardBoxClosed size={32} className="min-w-8" />
                  <div className="flex flex-col gap-0">
                    {item.name}
                    <div
                      className="text-justify text-sm"
                      dangerouslySetInnerHTML={{ __html: item.content ?? "" }}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={collectItemPending || lookAroundPending}
                  onClick={() => handleCollectItem(item)}
                >
                  Подобрать
                </Button>
              </div>
            ))}
            {!!items.length && <Divider />}
            {companies.map((company) => (
              <div
                key={company.id + "_company"}
                className="flex flex-col gap-1"
              >
                <div className="flex flex-row items-center gap-1 text-lg">
                  {company.isActive ? (
                    <GiFactory size={32} className="min-w-8" />
                  ) : (
                    <FcFactoryBreakdown size={32} className="min-w-8" />
                  )}
                  <div className="flex flex-col gap-0">
                    {company.name}
                    <div className="text-justify text-sm">
                      Владелец: {company.character?.name}
                    </div>
                  </div>
                </div>
                {company.character?.id !== characterId && (
                  <div className={"flex flex-row justify-between gap-1"}>
                    {company.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full"
                        isDisabled={isToggleActivePending || lookAroundPending}
                        onClick={() => handleSabotage(company)}
                      >
                        Саботаж
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      isDisabled={isRacketPending || lookAroundPending}
                      onClick={() => handleRacket(company)}
                    >
                      Рэкет
                    </Button>
                  </div>
                )}
                {company.character?.id === characterId && !company.isActive && (
                  <div className={"flex flex-col"}>
                    <Button
                      size="sm"
                      color="primary"
                      variant="ghost"
                      isDisabled={isToggleActivePending || lookAroundPending}
                      onClick={() => handleSabotage(company)}
                    >
                      Восстановить
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </ModalBody>
          <ModalFooter className="flex flex-col justify-between">
            <Button onClick={onClose} variant="faded" size="sm">
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <DefaultMap center={{ lat: 58.0075, lng: 56.23 }} />
      <Button
        size="sm"
        color="warning"
        variant="faded"
        onClick={handleLookAround}
        isDisabled={lookAroundPending}
      >
        {lookAroundPending ? <LoadingSpinner height={24} /> : "Осмотреться"}
      </Button>
    </div>
  );
}
