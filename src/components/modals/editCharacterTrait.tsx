import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Checkbox,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/Loading";
import type {
  Faction,
  Clan,
  Ability,
  Feature,
} from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { FaTrashAlt, FaCheckDouble, FaTimes } from "react-icons/fa";

const EditCharacterTrait = ({
  onClose,
  trait,
  traitType,
  className,
  children,
}: {
  onClose: () => void;
  trait?: Faction | Clan | Ability | Feature;
  traitType?: string;
  className?: string;
  children?: string | JSX.Element | JSX.Element[] | (string | JSX.Element)[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpert, setIsExpert] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [requirement, setRequirement] = useState<number>();
  const [factionIds, setfactionIds] = useState<number[]>([]);
  const [clanIds, setclanIds] = useState<number[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [isVisibleToPlayer, setIsVisibleToPlayer] = useState(false);
  const [isClanSelectOpen, setIsClanSelectOpen] = useState(false);
  const [isFactionSelectOpen, setIsFactionSelectOpen] = useState(false);
  const editing = !!trait;

  const {
    data: factionData,
    isLoading: isFactionsLoading,
    refetch: refetchFactions,
  } = api.char.getFactions.useQuery();

  useEffect(() => {
    setFactions(factionData ?? []);
  }, [factionData]);

  const {
    data: clanData,
    isLoading: isClansLoading,
    refetch: refetchClans,
  } = api.char.getClans.useQuery();

  useEffect(() => {
    setClans(clanData ?? []);
  }, [clanData]);

  const {
    data: abilityData,
    isLoading: isAbilitiesLoading,
    refetch: refetchAbilities,
  } = api.char.getAbilities.useQuery();

  useEffect(() => {
    setAbilities(
      !!abilityData
        ? abilityData.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          )
        : [],
    );
  }, [abilityData]);

  useEffect(() => {
    if (!!trait) {
      setTitle(trait.name ?? "");
      setContent(trait.content ?? "");
      setIsVisibleToPlayer(trait.visibleToPlayer ?? false);
      if (traitType === "Feature") {
        setCost((trait as Feature).cost ?? 0);
        setclanIds(
          (trait as Feature).FeatureAvailable!.map((v) => v.clanId) ?? [],
        );
      }
      if (traitType === "Ability") {
        setIsExpert((trait as Ability).expertise ?? false);
        setRequirement((trait as Ability).requirementId ?? undefined);
        setclanIds(
          (trait as Ability).AbilityAvailable!.map((v) => v.clanId) ?? [],
        );
      }
      if (traitType === "Clan")
        setfactionIds(
          (trait as Clan).ClanInFaction!.map((v) => v.factionId) ?? [],
        );
    }
  }, [trait, traitType]);

  const handleCostChange = (n: number) => {
    if (n < -4) setCost(-4);
    else if (n > 4) setCost(4);
    else setCost(Math.floor(n));
  };

  const handleSuccess = () => {
    onClose();
    setIsExpert(false);
    setfactionIds([]);
    setclanIds([]);
    setContent("");
    setTitle("");
    setCost(0);
    setIsModalOpen(false);
    setIsClanSelectOpen(false);
    setIsFactionSelectOpen(false);
    if (traitType === "Clan") void refetchFactions();
    if (traitType === "Ability") void refetchAbilities();
    if (traitType === "Ability" || traitType === "Feature") void refetchClans();
  };

  const { mutate: createFaction, isPending: isFactionPending } =
    api.char.createFaction.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: createClan, isPending: isClanPending } =
    api.char.createClan.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: createAbility, isPending: isAbilityPending } =
    api.char.createAbility.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: createFeature, isPending: isFeaturePending } =
    api.char.createFeature.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: updateFaction, isPending: isFactionUpdatePending } =
    api.char.updateFaction.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: updateClan, isPending: isClanUpdatePending } =
    api.char.updateClan.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: updateAbility, isPending: isAbilityUpdatePending } =
    api.char.updateAbility.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: updateFeature, isPending: isFeatureUpdatePending } =
    api.char.updateFeature.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: deleteFaction, isPending: isFactionDeletePending } =
    api.char.deleteFaction.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: deleteClan, isPending: isClanDeletePending } =
    api.char.deleteClan.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: deleteAbility, isPending: isAbilityDeletePending } =
    api.char.deleteAbility.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: deleteFeature, isPending: isFeatureDeletePending } =
    api.char.deleteFeature.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const handleDelete = () => {
    const confirmDeletion = confirm(
      "Удалить " +
        (traitType === "Faction"
          ? "фракцию"
          : traitType === "Clan"
            ? "клан"
            : traitType === "Ability"
              ? "способность"
              : "дополнение") +
        "?",
    );
    if (confirmDeletion)
      switch (traitType) {
        case "Faction":
          deleteFaction({ id: trait!.id });
          return;
        case "Clan":
          deleteClan({ id: trait!.id });
          return;
        case "Ability":
          deleteAbility({ id: trait!.id });
          return;
        case "Feature":
          deleteFeature({ id: trait!.id });
          return;
      }
  };

  const handleFormSubmit = () => {
    switch (traitType) {
      case "Faction":
        if (!editing) {
          createFaction({
            name: title,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
          });
        } else {
          updateFaction({
            id: trait.id ?? "",
            name: title,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
          });
        }
        return;
      case "Clan":
        if (!editing) {
          createClan({
            name: title,
            content: content,
            factionIds: factionIds ?? [1],
            visibleToPlayer: isVisibleToPlayer,
          });
        } else {
          updateClan({
            id: trait.id ?? "",
            name: title,
            content: content,
            factionIds: factionIds ?? [1],
            visibleToPlayer: isVisibleToPlayer,
          });
        }
        return;
      case "Ability":
        if (!editing) {
          createAbility({
            name: title,
            content: content,
            expertise: isExpert,
            requirementId: requirement,
            visibleToPlayer: isVisibleToPlayer,
            clanIds: clanIds ?? [1],
          });
        } else {
          updateAbility({
            id: trait.id ?? "",
            name: title,
            content: content,
            expertise: isExpert,
            requirementId: requirement,
            visibleToPlayer: isVisibleToPlayer,
            clanIds: clanIds ?? [1],
          });
        }
        return;
      case "Feature":
        if (!editing) {
          createFeature({
            name: title,
            content: content,
            cost: cost,
            visibleToPlayer: isVisibleToPlayer,
            clanIds: clanIds ?? [1],
          });
        } else {
          updateFeature({
            id: trait.id ?? "",
            name: title,
            content: content,
            cost: cost,
            visibleToPlayer: isVisibleToPlayer,
            clanIds: clanIds ?? [1],
          });
        }
        return;
    }
  };

  if (isFactionsLoading || isClansLoading || isAbilitiesLoading)
    return <LoadingPage />;

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsClanSelectOpen(false);
          setIsFactionSelectOpen(false);
          onClose();
        }}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
        size="2xl"
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6",
          base: "bg-red-950 bg-opacity-95 text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {editing ? "Редактировать" : "Добавить"}{" "}
            {traitType === "Faction"
              ? "фракцию"
              : traitType === "Clan"
                ? "клан"
                : traitType === "Ability"
                  ? "способность"
                  : "дополнение"}
          </ModalHeader>
          <ModalBody>
            <div className={"flex flex-row"}>
              <Input
                variant="underlined"
                label="Название"
                placeholder={`Введите название ${
                  traitType === "Faction"
                    ? "фракции"
                    : traitType === "Clan"
                      ? "клана"
                      : traitType === "Ability"
                        ? "способности"
                        : "дополнения"
                }`}
                value={title}
                onValueChange={setTitle}
              />
              {editing && (
                <Button
                  onClick={() => handleDelete()}
                  variant="light"
                  color="danger"
                  className={className + " m-2"}
                  isDisabled={
                    isFactionDeletePending ||
                    isClanDeletePending ||
                    isAbilityDeletePending ||
                    isFeatureDeletePending
                  }
                >
                  <FaTrashAlt size={16} />
                </Button>
              )}
            </div>
            {traitType === "Feature" && (
              <Input
                type="number"
                variant="underlined"
                label="Стоимость"
                placeholder={"Введите стоимость дополнения"}
                value={cost.toString()}
                onValueChange={(e) => handleCostChange(Number(e))}
              />
            )}
            <Textarea
              variant="underlined"
              label="Описание"
              placeholder={`Введите описание ${
                traitType === "Faction"
                  ? "фракции"
                  : traitType === "Clan"
                    ? "клана"
                    : traitType === "Ability"
                      ? "способности"
                      : "дополнения"
              }`}
              value={content}
              onValueChange={setContent}
            />
            {traitType === "Clan" && (
              <Select
                label="Фракция"
                variant="underlined"
                placeholder="Выберите фракции"
                selectionMode="multiple"
                isOpen={isFactionSelectOpen}
                onOpenChange={(open) =>
                  open !== isFactionSelectOpen && setIsFactionSelectOpen(open)
                }
                selectedKeys={factionIds.map((f) => f.toString())}
                onChange={(e) => {
                  if (!!e.target.value) {
                    setfactionIds(
                      e.target.value.split(",").map((s) => Number(s)),
                    );
                  }
                }}
              >
                {factions.map((faction) => (
                  <SelectItem key={faction.id} value={faction.id}>
                    {faction.name}
                  </SelectItem>
                ))}
              </Select>
            )}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {traitType === "Ability" && (
                <Select
                  label="Требует наличие"
                  variant="underlined"
                  placeholder="Выберите предыдущую способность"
                  selectedKeys={requirement ? [requirement.toString()] : []}
                  onChange={(e) => setRequirement(Number(e.target.value))}
                >
                  {abilities.map((ability) => (
                    <SelectItem key={ability.id} value={ability.id}>
                      {ability.name}
                    </SelectItem>
                  ))}
                </Select>
              )}
              <div className="flex flex-row">
                {(traitType === "Ability" || traitType === "Feature") && (
                  <Select
                    label="Клан"
                    variant="underlined"
                    placeholder="Выберите клан"
                    selectionMode="multiple"
                    isOpen={isClanSelectOpen}
                    onOpenChange={(open) =>
                      open !== isClanSelectOpen && setIsClanSelectOpen(open)
                    }
                    selectedKeys={clanIds.map((f) => f.toString())}
                    onChange={(e) => {
                      if (!!e.target.value) {
                        setclanIds(
                          e.target.value.split(",").map((s) => Number(s)),
                        );
                      }
                    }}
                  >
                    {clans.map((clan) => (
                      <SelectItem key={clan.id} value={clan.id}>
                        {clan.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                {(traitType === "Ability" || traitType === "Feature") && (
                  <Button
                    variant="light"
                    color="warning"
                    onClick={() => {
                      if (clans.length === clanIds.length) setclanIds([]);
                      else setclanIds(clans.map((c) => c.id));
                    }}
                    className={className + " m-2"}
                  >
                    {clans.length === clanIds.length ? (
                      <FaTimes size={16} />
                    ) : (
                      <FaCheckDouble size={16} />
                    )}
                  </Button>
                )}
              </div>
            </div>
            {traitType === "Ability" && (
              <Checkbox isSelected={isExpert} onValueChange={setIsExpert}>
                Экспертная
              </Checkbox>
            )}
            <Checkbox
              isSelected={isVisibleToPlayer}
              onValueChange={setIsVisibleToPlayer}
            >
              Игрок может видеть
            </Checkbox>
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
              color="success"
              isDisabled={
                !title ||
                (traitType === "Clan" && !factionIds.length) ||
                isFactionPending ||
                isClanPending ||
                isAbilityPending ||
                isFeaturePending ||
                isFactionUpdatePending ||
                isClanUpdatePending ||
                isAbilityUpdatePending ||
                isFeatureUpdatePending ||
                isFactionDeletePending ||
                isClanDeletePending ||
                isAbilityDeletePending ||
                isFeatureDeletePending
              }
              onClick={handleFormSubmit}
            >
              {isFactionPending ||
              isClanPending ||
              isAbilityPending ||
              isFeaturePending ||
              isFactionUpdatePending ||
              isClanUpdatePending ||
              isAbilityUpdatePending ||
              isFeatureUpdatePending ||
              isFactionDeletePending ||
              isClanDeletePending ||
              isAbilityDeletePending ||
              isFeatureDeletePending ? (
                <LoadingSpinner />
              ) : (
                `${editing ? "Обновить" : "Добавить"}`
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        onClick={() => setIsModalOpen(true)}
        size="sm"
        variant="light"
        color="warning"
        className={className}
      >
        {children}
      </Button>
    </>
  );
};

export default EditCharacterTrait;
