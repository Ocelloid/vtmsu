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
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { FaCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/Loading";
import type {
  Faction,
  Clan,
  Ability,
  Feature,
  Ritual,
  Knowledge,
  Effect,
} from "~/server/api/routers/char";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading";
import { FaTrashAlt, FaCheckDouble, FaTimes } from "react-icons/fa";
import {
  disciplines,
  clans as clan_icons,
  factions as faction_icons,
} from "~/assets";
import { useTheme } from "next-themes";

const EditCharacterTrait = ({
  onClose,
  trait,
  traitType,
  className,
  children,
}: {
  onClose: () => void;
  trait?: Faction | Clan | Ability | Feature | Ritual | Knowledge | Effect;
  traitType?: string;
  className?: string;
  children?: string | JSX.Element | JSX.Element[] | (string | JSX.Element)[];
}) => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpert, setIsExpert] = useState(false);
  const [recipe, setRecipe] = useState("");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [auspexData, setAuspexData] = useState("");
  const [cost, setCost] = useState<number>(1);
  const [requirement, setRequirement] = useState<number>();
  const [knowledgeIds, setKnowledgeIds] = useState<number[]>([]);
  const [factionIds, setfactionIds] = useState<number[]>([]);
  const [clanIds, setclanIds] = useState<number[]>([]);
  const [effectIds, setEffectIds] = useState<number[]>([]);
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [isVisibleToPlayer, setIsVisibleToPlayer] = useState(false);
  const [isClanSelectOpen, setIsClanSelectOpen] = useState(false);
  const [isFactionSelectOpen, setIsFactionSelectOpen] = useState(false);
  const [isEffectSelectOpen, setIsEffectSelectOpen] = useState(false);
  const [icon, setIcon] = useState<string>("");
  const [expiration, setExpiration] = useState<number>(1);
  const [color, setColor] = useState<
    | "default"
    | "success"
    | "warning"
    | "primary"
    | "secondary"
    | "danger"
    | undefined
  >("default");
  const colors = [
    "default",
    "success",
    "warning",
    "primary",
    "secondary",
    "danger",
  ];
  const editing = !!trait;

  const abilityKeys = Object.keys(disciplines);

  const iconsAbilitySelection = Object.values(disciplines)
    .map((disc, i) => {
      return { value: abilityKeys[i] ?? "", image: disc };
    })
    .filter((x) => x !== undefined);

  const clanKeys = Object.keys(clan_icons);

  const iconsClanSelection = Object.values(clan_icons)
    .map((clan, i) => {
      if (theme === "light" && !clanKeys[i]?.includes("_white"))
        return { value: clanKeys[i] ?? "", image: clan };
      if (theme === "dark" && clanKeys[i]?.includes("_white"))
        return { value: clanKeys[i]?.replace("_white", "") ?? "", image: clan };
      else return undefined;
    })
    .filter((x) => x !== undefined);

  const factionKeys = Object.keys(faction_icons);

  const iconsFactionSelection = Object.values(faction_icons)
    .map((clan, i) => {
      if (theme === "light" && !factionKeys[i]?.includes("_white"))
        return { value: factionKeys[i] ?? "", image: clan };
      if (theme === "dark" && factionKeys[i]?.includes("_white"))
        return {
          value: factionKeys[i]?.replace("_white", "") ?? "",
          image: clan,
        };
      else return undefined;
    })
    .filter((x) => x !== undefined);

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

  const { data: knowledgeData } = api.char.getKnowledges.useQuery();

  useEffect(() => {
    setKnowledges(
      !!knowledgeData
        ? knowledgeData.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          )
        : [],
    );
  }, [knowledgeData]);

  const { data: effectsData } = api.char.getEffects.useQuery();

  useEffect(() => {
    setEffects(
      !!effectsData
        ? effectsData.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          )
        : [],
    );
  }, [effectsData]);

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
        setEffectIds(
          (trait as Feature).FeatureEffects?.map((v) => v.effectId) ?? [],
        );
      }
      if (traitType === "Ability") {
        setIcon((trait as Ability).icon ?? "");
        setCost((trait as Ability).cost ?? 0);
        setIsExpert((trait as Ability).expertise ?? false);
        setRequirement((trait as Ability).requirementId ?? undefined);
        setclanIds(
          (trait as Ability).AbilityAvailable!.map((v) => v.clanId) ?? [],
        );
        setEffectIds(
          (trait as Ability).AbilityEffects?.map((v) => v.effectId) ?? [],
        );
      }
      if (traitType === "Faction") setIcon((trait as Faction).icon ?? "");
      if (traitType === "Clan") {
        setIcon((trait as Clan).icon ?? "");
        setfactionIds(
          (trait as Clan).ClanInFaction!.map((v) => v.factionId) ?? [],
        );
      }
      if (traitType === "Ritual") {
        setKnowledgeIds(
          (trait as Ritual).ritualKnowledges!.map((v) => v.knowledgeId) ?? [],
        );
        setRecipe((trait as Ritual).recipe ?? "");
        setEffectIds(
          (trait as Ritual).RitualEffects?.map((v) => v.effectId) ?? [],
        );
      }
      if (traitType === "Effect") {
        setColor(
          ((trait as Effect).color ?? "default") as
            | "default"
            | "success"
            | "warning"
            | "primary"
            | "secondary"
            | "danger",
        );
        setExpiration((trait as Effect).expiration ?? 1);
        setAuspexData((trait as Effect).auspexData ?? "");
      }
    }
  }, [trait, traitType]);

  const handleCostChange = (n: number) => {
    if (n < -4) setCost(-4);
    else if (n > 4) setCost(4);
    else setCost(Math.floor(n));
  };

  const handleSuccess = () => {
    onClose();
    setRecipe("");
    setExpiration(1);
    setColor("default");
    setIsExpert(false);
    setKnowledgeIds([]);
    setfactionIds([]);
    setclanIds([]);
    setContent("");
    setTitle("");
    setIcon("");
    setCost(0);
    setIsModalOpen(false);
    setIsClanSelectOpen(false);
    setIsEffectSelectOpen(false);
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

  const { mutate: createRitual, isPending: isRitualPending } =
    api.char.createRitual.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: createKnowledge, isPending: isKnowledgePending } =
    api.char.createKnowledge.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: createEffect, isPending: isEffectPending } =
    api.char.createEffect.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: updateEffect, isPending: isEffectUpdatePending } =
    api.char.updateEffect.useMutation({
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

  const { mutate: updateRitual, isPending: isRitualUpdatePending } =
    api.char.updateRitual.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: updateKnowledge, isPending: isKnowledgeUpdatePending } =
    api.char.updateKnowledge.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: deleteEffect, isPending: isEffectDeletePending } =
    api.char.deleteEffect.useMutation({
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

  const { mutate: deleteRitual, isPending: isRitualDeletePending } =
    api.char.deleteRitual.useMutation({
      onSuccess() {
        handleSuccess();
      },
    });

  const { mutate: deleteKnowledge, isPending: isKnowledgeDeletePending } =
    api.char.deleteKnowledge.useMutation({
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
              : traitType === "Ritual"
                ? "ритуал"
                : traitType === "Knowledge"
                  ? "знание"
                  : traitType === "Effect"
                    ? "эффект"
                    : "дополнение") +
        "?",
    );
    if (confirmDeletion)
      switch (traitType) {
        case "Effect":
          deleteEffect({ id: trait!.id });
          return;
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
        case "Ritual":
          deleteRitual({ id: trait!.id });
          return;
        case "Knowledge":
          deleteKnowledge({ id: trait!.id });
          return;
      }
  };

  const handleFormSubmit = () => {
    switch (traitType) {
      case "Effect":
        if (!editing) {
          createEffect({
            name: title,
            content: content,
            color: color,
            visibleToPlayer: isVisibleToPlayer,
            expiration: expiration,
            auspexData: auspexData,
          });
        } else {
          updateEffect({
            id: trait.id ?? "",
            name: title,
            content: content,
            color: color,
            visibleToPlayer: isVisibleToPlayer,
            expiration: expiration,
            auspexData: auspexData,
          });
        }
        return;
      case "Faction":
        if (!editing) {
          createFaction({
            icon: icon.replace("_white", ""),
            name: title,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
          });
        } else {
          updateFaction({
            id: trait.id ?? "",
            icon: icon.replace("_white", ""),
            name: title,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
          });
        }
        return;
      case "Clan":
        if (!editing) {
          createClan({
            icon: icon.replace("_white", ""),
            name: title,
            content: content,
            factionIds: factionIds ?? [1],
            visibleToPlayer: isVisibleToPlayer,
          });
        } else {
          updateClan({
            id: trait.id ?? "",
            icon: icon.replace("_white", ""),
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
            icon: icon.replace("_white", ""),
            name: title,
            cost: cost,
            content: content,
            expertise: isExpert,
            requirementId: requirement,
            visibleToPlayer: isVisibleToPlayer,
            clanIds: clanIds ?? [1],
            effectIds: effectIds ?? [],
          });
        } else {
          updateAbility({
            id: trait.id ?? "",
            icon: icon.replace("_white", ""),
            name: title,
            cost: cost,
            content: content,
            expertise: isExpert,
            requirementId: requirement,
            visibleToPlayer: isVisibleToPlayer,
            clanIds: clanIds ?? [1],
            effectIds: effectIds ?? [],
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
            effectIds: effectIds ?? [],
          });
        } else {
          updateFeature({
            id: trait.id ?? "",
            name: title,
            content: content,
            cost: cost,
            visibleToPlayer: isVisibleToPlayer,
            clanIds: clanIds ?? [1],
            effectIds: effectIds ?? [],
          });
        }
        return;
      case "Ritual":
        if (!editing) {
          createRitual({
            name: title,
            image: "",
            recipe: recipe,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
            ritualKnowledges: knowledgeIds,
            effectIds: effectIds ?? [],
          });
        } else {
          updateRitual({
            id: trait.id ?? "",
            name: title,
            image: "",
            recipe: recipe,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
            ritualKnowledges: knowledgeIds,
            effectIds: effectIds ?? [],
          });
        }
        return;
      case "Knowledge":
        if (!editing) {
          createKnowledge({
            name: title,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
          });
        } else {
          updateKnowledge({
            id: trait.id ?? "",
            name: title,
            content: content,
            visibleToPlayer: isVisibleToPlayer,
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
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
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
                  : traitType === "Ritual"
                    ? "ритуал"
                    : traitType === "Knowledge"
                      ? "знание"
                      : traitType === "Effect"
                        ? "эффект"
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
                        : traitType === "Ritual"
                          ? "ритуала"
                          : traitType === "Knowledge"
                            ? "знания"
                            : traitType === "Effect"
                              ? "эффекта"
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
            {(traitType === "Feature" || traitType === "Ability") && (
              <Input
                type="number"
                variant="underlined"
                label="Стоимость"
                placeholder={"Введите стоимость"}
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
                      : traitType === "Ritual"
                        ? "ритуала"
                        : traitType === "Knowledge"
                          ? "знания"
                          : traitType === "Effect"
                            ? "эффекта"
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
            {(traitType === "Ability" ||
              traitType === "Feature" ||
              traitType === "Ritual") && (
              <Select
                label="Эффекты"
                variant="underlined"
                placeholder="Выберите эффекты"
                selectionMode="multiple"
                isOpen={isEffectSelectOpen}
                onOpenChange={(open) =>
                  open !== isEffectSelectOpen && setIsEffectSelectOpen(open)
                }
                selectedKeys={effectIds.map((f) => f.toString())}
                onChange={(e) => {
                  if (!!e.target.value) {
                    setEffectIds(
                      e.target.value.split(",").map((s) => Number(s)),
                    );
                  }
                }}
              >
                {effects.map((effect) => (
                  <SelectItem key={effect.id} value={effect.id}>
                    {effect.name}
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
              <RadioGroup
                label="Иконка"
                orientation="horizontal"
                color="danger"
                value={icon}
                onValueChange={setIcon}
              >
                {iconsAbilitySelection.map((is) => (
                  <Radio
                    value={is.value}
                    key={is.value}
                    className={
                      "flex min-w-16 [&>div]:flex-1 [&>div]:justify-center [&>span]:border-black [&>span]:dark:border-white"
                    }
                  >
                    <Image
                      alt="clan"
                      src={is.image}
                      height="32"
                      className="mx-auto"
                    />
                  </Radio>
                ))}
              </RadioGroup>
            )}
            {traitType === "Clan" && (
              <RadioGroup
                label="Иконка"
                orientation="horizontal"
                color="danger"
                value={icon}
                onValueChange={setIcon}
              >
                {iconsClanSelection.map((is) => (
                  <Radio
                    value={is!.value}
                    key={is!.value}
                    className={
                      "flex min-w-16 [&>div]:flex-1 [&>div]:justify-center [&>span]:border-black [&>span]:dark:border-white"
                    }
                  >
                    <Image
                      alt="clan"
                      src={is!.image}
                      height="32"
                      className="mx-auto"
                    />
                  </Radio>
                ))}
              </RadioGroup>
            )}
            {traitType === "Faction" && (
              <RadioGroup
                label="Иконка"
                orientation="horizontal"
                color="danger"
                value={icon}
                onValueChange={setIcon}
              >
                {iconsFactionSelection.map((is) => (
                  <Radio
                    value={is!.value}
                    key={is!.value}
                    className={
                      "flex min-w-16 [&>div]:flex-1 [&>div]:justify-center [&>span]:border-black [&>span]:dark:border-white"
                    }
                  >
                    <Image
                      alt="clan"
                      src={is!.image}
                      height="32"
                      className="mx-auto"
                    />
                  </Radio>
                ))}
              </RadioGroup>
            )}
            {traitType === "Ability" && (
              <Checkbox isSelected={isExpert} onValueChange={setIsExpert}>
                Экспертная
              </Checkbox>
            )}
            {traitType === "Ritual" && (
              <Textarea
                variant="underlined"
                label="Рецепт"
                placeholder={`Введите рецепт ритуала`}
                value={recipe}
                onValueChange={setRecipe}
              />
            )}
            {traitType === "Ritual" && (
              <Select
                label="Требует наличие"
                variant="underlined"
                placeholder="Выберите оккультное знание"
                selectedKeys={knowledgeIds.map((f) => f.toString())}
                onChange={(e) => {
                  if (!!e.target.value) {
                    setKnowledgeIds(
                      e.target.value.split(",").map((s) => Number(s)),
                    );
                  }
                }}
              >
                {knowledges.map((knowledge) => (
                  <SelectItem key={knowledge.id} value={knowledge.id}>
                    {knowledge.name}
                  </SelectItem>
                ))}
              </Select>
            )}
            {traitType === "Effect" && (
              <>
                <Select
                  label="Цвет"
                  color={color}
                  placeholder="Выберите цвет"
                  variant="underlined"
                  className={`text-${color}`}
                  selectionMode="single"
                  startContent={<FaCircle size={24} />}
                  selectedKeys={color ? [color] : [colors[0]!]}
                  onChange={(e) => {
                    if (!!e.target.value) {
                      setColor(
                        e.target.value as
                          | "default"
                          | "success"
                          | "warning"
                          | "primary"
                          | "secondary"
                          | "danger"
                          | undefined,
                      );
                    }
                  }}
                >
                  {colors.map((color) => (
                    <SelectItem
                      key={color}
                      value={color}
                      className={`bg-${color}`}
                    />
                  ))}
                </Select>
                <Input
                  type="number"
                  variant="underlined"
                  label="Время действия в минутах"
                  placeholder="Введите время действия в минутах"
                  value={expiration.toString()}
                  onValueChange={(e) => setExpiration(Number(e))}
                />
                <Textarea
                  variant="underlined"
                  label="Эффект в ауре"
                  placeholder="Введите описание эффекта в ауре"
                  value={auspexData}
                  onValueChange={setAuspexData}
                />
              </>
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
                isFeatureDeletePending ||
                isRitualPending ||
                isRitualUpdatePending ||
                isRitualDeletePending ||
                isKnowledgePending ||
                isKnowledgeUpdatePending ||
                isKnowledgeDeletePending ||
                isEffectPending ||
                isEffectUpdatePending ||
                isEffectDeletePending
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
              isRitualPending ||
              isRitualUpdatePending ||
              isRitualDeletePending ||
              isFeatureDeletePending ||
              isKnowledgePending ||
              isKnowledgeUpdatePending ||
              isKnowledgeDeletePending ||
              isEffectPending ||
              isEffectUpdatePending ||
              isEffectDeletePending ? (
                <LoadingSpinner height={24} />
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
