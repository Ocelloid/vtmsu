"use client";
import "leaflet/dist/leaflet.css";
import { MapControl, Draggable } from "~/components/map";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L, { LatLng } from "leaflet";
import type { HuntingInstance } from "~/server/api/routers/hunt";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import {
  Divider,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { api } from "~/utils/api";
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
import { LoadingSpinner } from "~/components/Loading";
import CharacterCard from "~/components/CharacterCard";
import Image from "next/image";
import Link from "next/link";

const company_icon = L.icon({ iconUrl: "/factory.png" });
const sewer_icon = L.icon({ iconUrl: "/sewer.png" });
const marker_icon = L.icon({ iconUrl: "/map-marker.png" });
const skull_icon = L.icon({ iconUrl: "/skull.png" });

const LookAround = () => {
  const [position, setPosition] = useState<LatLng>(new LatLng(58.0075, 56.23));
  const [instances, setInstances] = useState<HuntingInstance[]>([]);
  const [characterId, setCharacterId] = useState<number>();
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

  const [items, setItems] = useState<Item[]>([]);
  const [itemsMap, setItemsMap] = useState<Item[]>([]);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Company[]>([]);
  const [huntingInstances, setHuntingInstances] = useState<HuntingInstance[]>(
    [],
  );
  const [violations, setViolations] = useState<HuntingInstance[]>([]);
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [geoPointsMap, setGeoPointsMap] = useState<GeoPoint[]>([]);
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
  const [characters, setCharacters] = useState<Character[]>([]);
  const [char, setChar] = useState<Character>();

  const { data: instancesData, isLoading: isInstancesLoading } =
    api.hunt.getAllHuntingInstances.useQuery();

  const { data: charactersData, isLoading: isCharactersLoading } =
    api.char.getAll.useQuery();

  const { data: geoPointsData } = api.city.getAllGeoPoints.useQuery();

  const { data: characterData, refetch } = api.char.getById.useQuery(
    {
      id: characterId!,
    },
    { enabled: !!characterId },
  );

  const { data: itemsData } = api.item.getAll.useQuery();

  const { data: companiesData } = api.econ.getAll.useQuery();

  useEffect(() => {
    if (itemsData) setItemsMap(itemsData);
  }, [itemsData]);

  useEffect(() => {
    if (companiesData) setCompaniesMap(companiesData);
  }, [companiesData]);

  useEffect(() => {
    if (geoPointsData) setGeoPointsMap(geoPointsData);
  }, [geoPointsData]);

  useEffect(() => {
    if (!!characterData) setChar(characterData);
  }, [characterData]);

  useEffect(() => {
    if (!!charactersData) setCharacters(charactersData);
  }, [charactersData]);

  const isExperienced = char?.features?.some((f) => f.featureId === 9) ?? false;

  const handleLookAround = () => {
    if (!char?.id) return;
    lookAround(
      {
        x: position.lng,
        y: position.lat,
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
  };

  const handleAttack = (instance: HuntingInstance) => {
    const confirmed = confirm(
      `Вы хотите атаковать ${instance.target?.name ?? "Цель для охоты"}?`,
    );
    if (!confirmed) return;
    if (!char) return;
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
    if (!char) return;
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
    if (!char) return;
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
    if (!char) return;
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
    if (!char) return;
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
    if (!char) return;
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
    if (!char) return;
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
          void refetch();
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
    if (!char) return;
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

  useEffect(() => {
    if (!!instancesData) setInstances(instancesData);
  }, [instancesData]);

  useEffect(() => {
    setTimeout(() => {
      const red = document.getElementsByClassName("red-pulse");
      for (const item of red) {
        if (!!item)
          (item as HTMLElement).style.animationDuration =
            Math.random() * 5 + 5 + "s";
      }
    }, 2500);
  }, []);

  if (isInstancesLoading || isCharactersLoading) return <LoadingPage />;

  return (
    <>
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
              !!char &&
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
      {!!characters && (
        <Autocomplete
          size="md"
          variant="bordered"
          placeholder="Выберите персонажа"
          aria-label="characters"
          className="w-full rounded-sm"
          selectedKey={characterId ? characterId.toString() : undefined}
          onSelectionChange={(e) => {
            const charId = Number(e);
            setChar(characters.find((c) => c.id === charId));
            setCharacterId(charId);
          }}
        >
          {characters.map((c) => (
            <AutocompleteItem
              key={c.id.toString()}
              value={c.id.toString()}
              textValue={c.name}
            >
              <CharacterCard character={c} isSelect={true} />
            </AutocompleteItem>
          ))}
        </Autocomplete>
      )}
      {char?.name}
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
        <MapControl />
        <Draggable
          updatePosition={(p) => {
            setPosition(p);
            void navigator.clipboard.writeText(p.lat + "," + p.lng);
          }}
        />
        {instances
          .filter(
            (i) => (!!i.expires ? i.expires < new Date() : true) && i.isVisible,
          )
          .map((instance) => (
            <>
              {instance.remains! > 1 ? (
                <Circle
                  key={instance.id}
                  center={[instance.coordY, instance.coordX]}
                  pathOptions={{
                    color: "transparent",
                    fillColor: "red",
                    className: "red-pulse",
                  }}
                  radius={100 * instance.remains!}
                />
              ) : (
                <Marker
                  key={instance.id}
                  position={[instance.coordY, instance.coordX]}
                  icon={instance.remains! > 1 ? marker_icon : skull_icon}
                >
                  <Popup>
                    <div className="flex flex-col items-center gap-0">
                      <span>{instance.target?.name}</span>
                      <span className="pb-1 text-xs">Нарушение маскарада</span>
                      <span>
                        {
                          instance.target?.descs![
                            (instance.target?.descs?.length ?? 0) - 1
                          ]?.content
                        }
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          ))}
        {geoPointsMap.map((geoPoint) => (
          <Marker
            key={geoPoint.id}
            position={[geoPoint.lat ?? 0, geoPoint.lng ?? 0]}
            icon={geoPoint.icon === "sewer" ? sewer_icon : marker_icon}
          >
            <Popup>
              <div className="flex flex-col items-center gap-0">
                <span>{geoPoint.name}</span>
                <div
                  dangerouslySetInnerHTML={{ __html: geoPoint.content ?? "" }}
                />
              </div>
            </Popup>
          </Marker>
        ))}
        {companiesMap.map((company) => (
          <Marker
            key={company.id}
            position={[company.coordY, company.coordX]}
            icon={company_icon}
          >
            <Popup>
              <div className="flex flex-col items-center gap-0">
                <span>{company.name}</span>
                <div dangerouslySetInnerHTML={{ __html: company.content }} />
              </div>
            </Popup>
          </Marker>
        ))}
        {itemsMap.map((item) => (
          <Marker
            key={item.id}
            position={[item.coordY ?? 0, item.coordX ?? 0]}
            icon={marker_icon}
          >
            <Popup>
              <div className="flex flex-col items-center gap-0">
                <span>
                  {item.id}: {item.name}
                </span>
                <div dangerouslySetInnerHTML={{ __html: item.content ?? "" }} />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <Button
        size="sm"
        color="warning"
        variant="faded"
        onClick={handleLookAround}
        isDisabled={lookAroundPending}
      >
        {lookAroundPending ? <LoadingSpinner height={24} /> : "Осмотреться"}
      </Button>
    </>
  );
};

export default LookAround;
