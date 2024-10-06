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
// import { useState, useEffect, useRef } from "react";
import { useState } from "react";
import { PiMapPinFill } from "react-icons/pi";
import {
  GiFactory,
  GiHumanTarget,
  GiChalkOutlineMurder,
  GiCardboardBoxClosed,
} from "react-icons/gi";
import { FcFactoryBreakdown } from "react-icons/fc";
import type { Item } from "~/server/api/routers/item";
import type { Company } from "~/server/api/routers/econ";
import type {
  GeoPoint,
  GeoPointEffects,
  GeoPointContainers,
} from "~/server/api/routers/city";
import type { Character } from "~/server/api/routers/char";
import type { HuntingInstance } from "~/server/api/routers/hunt";
import { LoadingSpinner } from "~/components/Loading";
import Image from "next/image";
import Link from "next/link";

export default function City({
  char,
  refetch,
}: {
  char: Character;
  refetch: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: geoOpen,
    onOpen: geoOnOpen,
    onClose: geoOnClose,
  } = useDisclosure();
  const { mutate: lookAround, isPending: lookAroundPending } =
    api.city.getLookAround.useMutation();
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
  const { mutate: lookUpGeoPoint, isPending: isLookUpGeoPointPending } =
    api.city.lookUpGeoPoint.useMutation();
  const { mutate: applyGeoPoint, isPending: isUseGeoPointPending } =
    api.city.applyGeoPoint.useMutation();
  // const { mutate: updateLocation } = api.util.updateLocation.useMutation();

  const [items, setItems] = useState<Item[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [huntingInstances, setHuntingInstances] = useState<HuntingInstance[]>(
    [],
  );
  const [violations, setViolations] = useState<HuntingInstance[]>([]);
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);

  const [auspexData, setAuspexData] = useState("");
  const [animalismData, setAnimalismData] = useState("");
  const [hackerData, setHackerData] = useState("");
  const [hackerImage, setHackerImage] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [violationId, setViolationId] = useState<number>(0);
  const [geoPoint, setGeoPoint] = useState<GeoPoint>();
  const [geoContent, setGeoContent] = useState("");
  const [geoEffects, setGeoEffects] = useState<GeoPointEffects[]>([]);
  const [geoContainers, setGeoContainers] = useState<GeoPointContainers[]>([]);

  const isExperienced = char?.features?.some((f) => f.featureId === 9) ?? false;

  // const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   // Initial location update
  //   const sendLocationUpdate = () => {
  //     try {
  //       navigator.geolocation.getCurrentPosition((pos) => {
  //         console.log(pos.coords);
  //         // updateLocation(
  //         //   {
  //         //     x: pos.coords.longitude,
  //         //     y: pos.coords.latitude,
  //         //     charId: char.id,
  //         //   },
  //         //   {
  //         //     onSuccess: (e) => {
  //         //       if (e?.message) alert(e.message);
  //         //     },
  //         //   },
  //         // );
  //       });
  //     } catch (error) {
  //       console.error("Error sending location update:", error);
  //     }
  //   };

  //   navigator.geolocation.getCurrentPosition((pos) => {
  //     console.log(pos.coords);
  //     // updateLocation({
  //     //   x: pos.coords.longitude,
  //     //   y: pos.coords.latitude,
  //     //   charId: char.id,
  //     // }, {
  //     //   onSuccess: (e) => {
  //     //     if (e?.message) alert(e.message);
  //     //   },
  //     // });
  //   });

  //   // Send location updates every minute
  //   intervalIdRef.current = setInterval(sendLocationUpdate, 60000);

  //   // Cleanup function to clear the interval when the component unmounts
  //   return () => {
  //     if (intervalIdRef.current !== null) clearInterval(intervalIdRef.current);
  //   };
  // }, [char.id]);

  const handleLookAround = () => {
    if (!!window && !!window.navigator && !!window.navigator.geolocation)
      window.navigator.geolocation.getCurrentPosition((pos) => {
        lookAround(
          {
            x: pos.coords.longitude,
            y: pos.coords.latitude,
            charId: char.id,
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
              if (!!e.availableGeoPoints) setGeoPoints(e.availableGeoPoints);
            },
          },
        );
      });
    else alert("Геолокация не активна в вашем браузере");
  };

  const handleAttack = (instance: HuntingInstance) => {
    const confirmed = confirm(
      `Вы хотите атаковать ${instance.target?.name ?? "Цель для охоты"}?`,
    );
    if (!confirmed) return;
    newHunt(
      { characterId: char.id, instanceId: instance.id! },
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
        charId: char.id,
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
        charId: char.id,
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
        charId: char.id,
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
        charId: char.id,
      },
      {
        onSuccess: (e) => {
          setViolationId(violation.id!);
          if (e?.message) alert(e.message);
          if (e?.dateTime) setDateTime(e.dateTime);
          if (e?.auspexData) setAuspexData(e.auspexData);
          if (e?.hackerData) setHackerData(e.hackerData);
          if (e?.hackerImage) setHackerImage(e.hackerImage);
          if (e?.animalismData) setAnimalismData(e.animalismData);
          geoOnOpen();
        },
      },
    );
  };

  const handleLookUpGeoPoint = (geoPoint: GeoPoint) => {
    lookUpGeoPoint(
      {
        id: geoPoint.id,
        charId: char.id,
      },
      {
        onSuccess(e) {
          setGeoPoint(geoPoint);
          if (e?.message) alert(e.message);
          if (e?.content) setGeoContent(e.content);
          if (e?.effects) setGeoEffects(e.effects);
          if (e?.containers) setGeoContainers(e.containers);
          if (e?.auspexData) setAuspexData(e.auspexData);
          if (e?.hackerData) setHackerData(e.hackerData);
          if (e?.animalismData) setAnimalismData(e.animalismData);
          geoOnOpen();
        },
      },
    );
  };

  const handleUseGeoPoint = () => {
    if (!geoPoint) return;
    applyGeoPoint(
      {
        id: geoPoint.id,
        charId: char.id,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          geoOnClose();
          refetch();
        },
      },
    );
  };

  const handleGeoClear = () => {
    geoOnClose();
    setGeoPoint(undefined);
    setDateTime("");
    setAuspexData("");
    setHackerData("");
    setHackerImage("");
    setViolationId(0);
    setAnimalismData("");
    handleLookAround();
  };

  const handleCoverUp = (violation: HuntingInstance) => {
    const confirmed = confirm(
      `Вы хотите прикрыть ${violation.target?.name}? Это будет стоить вам ${
        (violation.target?.descs?.length ?? 0) * 50
      } ОВ.`,
    );
    if (!confirmed) return;
    if (!violation.id) return;
    coverUp(
      {
        id: violation.id,
        charId: char.id,
      },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          handleLookAround();
        },
      },
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-1 pb-1">
      <Modal
        isOpen={geoOpen}
        onClose={handleGeoClear}
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
          <ModalHeader>Результаты осмотра</ModalHeader>
          <ModalBody className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto">
            {!!geoContent ? (
              <div
                className="text-justify text-sm"
                dangerouslySetInnerHTML={{ __html: geoContent }}
              />
            ) : (
              <p>Вам удалось узнать следующее:</p>
            )}
            {!!auspexData && (
              <p className="text-justify text-sm">{`Прорицание: "${auspexData}"`}</p>
            )}
            {!!animalismData && (
              <p className="text-justify text-sm">
                {`Анимализм: "${animalismData}"`}
              </p>
            )}
            {!!hackerData && (
              <p className="text-justify text-sm">{`Хакерство: "${hackerData}"`}</p>
            )}
            {!!hackerImage && (
              <Image
                src={hackerImage}
                className="ml-auto aspect-square h-full w-full border-2 border-success object-cover sm:max-w-96"
                height={8}
                width={8}
                quality={(violationId % 25) + 25}
                priority
                alt="hacker-image"
              />
            )}
            {!!dateTime && (
              <div className="-ml-3 -mt-8 w-full text-right text-success">
                CAM1: {dateTime}
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-col">
            <div className="flex w-full flex-row justify-between gap-1">
              <Button
                onClick={geoOnClose}
                variant="faded"
                size="sm"
                className="w-full"
              >
                Закрыть
              </Button>
              {!!geoEffects.length && (
                <Button
                  onClick={handleUseGeoPoint}
                  variant="faded"
                  color="success"
                  size="sm"
                  className="w-full"
                  isDisabled={isUseGeoPointPending}
                >
                  Использовать
                </Button>
              )}
            </div>
            {geoContainers?.map((gc) => (
              <Link
                key={gc.id}
                href={`/container/${gc.container?.id}`}
                target="_blank"
              >
                Открыть {gc.container?.name}
              </Link>
            ))}
          </ModalFooter>
        </ModalContent>
      </Modal>
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
            {!!violations &&
              violations.map((violation) => (
                <div
                  key={(violation?.id ?? "") + "_violation"}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-row items-center gap-1 text-lg">
                    <GiChalkOutlineMurder size={32} className="min-w-8" />
                    <div className="flex flex-col gap-0">
                      {violation?.target?.name ?? "Нарушение маскарада"}
                      <div className="text-justify text-sm">
                        {violation?.target?.descs?.[
                          (violation.target?.descs?.length ?? 0) -
                            (violation?.remains ?? 0)
                        ]?.content ?? ""}
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
            {!!violations?.length && <Divider />}
            {!!geoPoints &&
              geoPoints.map((geoPoint) => (
                <div
                  key={(geoPoint?.id ?? "") + "_geoPoint"}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-row items-center gap-1 text-lg">
                    <PiMapPinFill size={32} className="min-w-8" />
                    <div className="flex flex-col gap-0">
                      {geoPoint?.name}
                      <div
                        className="text-justify text-sm"
                        dangerouslySetInnerHTML={{
                          __html: geoPoint?.content ?? "",
                        }}
                      />
                    </div>
                  </div>
                  <div className={"flex flex-row justify-between gap-1"}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      isDisabled={isLookUpGeoPointPending}
                      onClick={() => handleLookUpGeoPoint(geoPoint)}
                    >
                      Посмотреть
                    </Button>
                  </div>
                </div>
              ))}
            {!!geoPoints?.length && <Divider />}
            {!!huntingInstances &&
              huntingInstances?.map((instance) => (
                <div
                  key={(instance?.id ?? "") + "_instance"}
                  className="flex flex-col gap-1"
                >
                  {!!instance?.target?.image && (
                    <Image
                      src={instance?.target?.image}
                      className={`mx-auto aspect-square h-full w-full rounded-t-xl object-cover sm:max-w-96`}
                      height={256}
                      width={256}
                      alt="hunting-image"
                    />
                  )}
                  <div className="flex flex-row items-center gap-1 text-lg">
                    <GiHumanTarget
                      size={32}
                      className="min-w-8"
                      color={isExperienced ? "warning" : undefined}
                    />
                    <div className="flex flex-col gap-0">
                      {instance?.target?.name ?? "Цель для охоты"}
                      <div className="text-justify text-sm">
                        {
                          instance?.target?.descs?.[
                            (instance.target?.descs?.length ?? 0) -
                              (instance?.remains ?? 0)
                          ]?.content
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
            {!!huntingInstances?.length && <Divider />}
            {!!items &&
              items.map((item) => (
                <div
                  key={(item?.id ?? "") + "_item"}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-row items-center gap-1 text-lg">
                    <GiCardboardBoxClosed size={32} className="min-w-8" />
                    <div className="flex flex-col gap-0">
                      {item?.name}
                      <div
                        className="text-justify text-sm"
                        dangerouslySetInnerHTML={{
                          __html: item?.content ?? "",
                        }}
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
            {!!items?.length && <Divider />}
            {!!companies &&
              companies.map((company) => (
                <div
                  key={(company?.id ?? "") + "_company"}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-row items-center gap-1 text-lg">
                    {company?.isActive ? (
                      <GiFactory size={32} className="min-w-8" />
                    ) : (
                      <FcFactoryBreakdown size={32} className="min-w-8" />
                    )}
                    <div className="flex flex-col gap-0">
                      {company?.name}
                      <div className="text-justify text-sm">
                        Владелец: {company?.character?.name}
                      </div>
                    </div>
                  </div>
                  {company?.character?.id !== char.id && (
                    <div className={"flex flex-row justify-between gap-1"}>
                      {company?.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          isDisabled={
                            isToggleActivePending || lookAroundPending
                          }
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
                  {company?.character?.id === char?.id &&
                    !company?.isActive && (
                      <div className={"flex flex-col"}>
                        <Button
                          size="sm"
                          color="primary"
                          variant="ghost"
                          isDisabled={
                            isToggleActivePending || lookAroundPending
                          }
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
