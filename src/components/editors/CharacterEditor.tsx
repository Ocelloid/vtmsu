import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LoadingSpinner, LoadingPage } from "~/components/Loading";
import default_char from "~/../public/default_char.png";
import {
  Button,
  Input,
  Checkbox,
  CheckboxGroup,
  Textarea,
  Select,
  SelectItem,
  cn,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { UploadButton } from "~/utils/uploadthing";
import { FaRegSave, FaImage, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { z } from "zod";
import DefaultEditor from "~/components/editors/DefaultEditor";
import { api } from "~/utils/api";
import type {
  Faction,
  Feature,
  Clan,
  Ability,
  Knowledge,
  Ritual,
} from "~/server/api/routers/char";
import {
  disciplines,
  clans as clan_icons,
  factions as faction_icons,
} from "~/assets";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const schema = z.object({
  name: z.string().min(1),
  age: z.number().min(18).max(1000).optional(),
  image: z.string(),
  playerName: z.string().min(1),
  playerContact: z.string().min(1),
  visible: z.boolean(),
  title: z.string(),
  status: z.string(),
  sire: z.string(),
  childer: z.string(),
  ambition: z.string(),
  publicInfo: z.string(),
  content: z.string(),
  clanId: z.number(),
  factionId: z.number(),
  abilityIds: z.array(z.number()),
  additionalAbilities: z.number().min(0).max(2).optional(),
  featuresWithComments: z.array(
    z.object({
      id: z.number(),
      cost: z.number(),
      comment: z.string(),
      checked: z.boolean(),
    }),
  ),
  knowledges: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      checked: z.boolean(),
    }),
  ),
  rituals: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      checked: z.boolean(),
      knowledgeRequired: z.number().optional(),
    }),
  ),
});

type CharacterFormFields = z.infer<typeof schema>;

export default function CharacterEditor() {
  const { data: sessionData } = useSession();
  const { theme } = useTheme();
  const router = useRouter();

  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });

  const clanKeys = Object.keys(clan_icons);
  const clanSelection = Object.values(clan_icons).map((clan, i) => {
    if (theme === "light" && !clanKeys[i]?.includes("_white"))
      return { key: clanKeys[i] ?? "", value: clan };
    if (theme === "dark" && clanKeys[i]?.includes("_white"))
      return { key: clanKeys[i]?.replace("_white", "") ?? "", value: clan };
    else return undefined;
  });

  const factionKeys = Object.keys(faction_icons);
  const factionSelection = Object.values(faction_icons).map((faction, i) => {
    if (theme === "light" && !factionKeys[i]?.includes("_white"))
      return { key: factionKeys[i] ?? "", value: faction };
    if (theme === "dark" && factionKeys[i]?.includes("_white"))
      return {
        key: factionKeys[i]?.replace("_white", "") ?? "",
        value: faction,
      };
    else return undefined;
  });

  const icons = [...discIcons, ...clanSelection, ...factionSelection].filter(
    (i) => !!i,
  );
  const defaultIcon =
    theme === "light" ? faction_icons._ankh : faction_icons._ankh_white;

  const [uploading, setUploading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPersonnel, setIsPersonnel] = useState<boolean>(false);
  const [infiniteAbilities, setInfiniteAbilities] = useState<boolean>(false);
  const [seeAllAbilities, setSeeAllAbilities] = useState<boolean>(false);
  const [infiniteFeatures, setInfiniteFeatures] = useState<boolean>(false);
  const [seeAllFeatures, setSeeAllFeatures] = useState<boolean>(false);
  const [costSum, setCostSum] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [characterId, setCharacterId] = useState<number>();

  const {
    register,
    formState: { errors },
    getValues,
    setValue,
    setError,
    watch,
  } = useForm<CharacterFormFields>({
    defaultValues: {
      visible: true,
      abilityIds: [],
      featuresWithComments: [],
    },
  });

  const watchedVisible = watch("visible");
  const watchedImage = watch("image");
  const watchedPlayerName = watch("playerName");
  const watchedPlayerContact = watch("playerContact");
  const watchedName = watch("name");
  const watchedAge = watch("age");
  const watchedFactionId = watch("factionId");
  const watchedClanId = watch("clanId");
  const watchedPublicInfo = watch("publicInfo");
  const watchedContent = watch("content");
  const watchedAbilityIds = watch("abilityIds");
  const watchedFWC = watch("featuresWithComments");
  const watchedAdditionalAbilities = watch("additionalAbilities");
  const watchedKnowledges = watch("knowledges");
  const watchedRituals = watch("rituals");

  const { data: userData, isLoading: isUserLoading } =
    api.user.getCurrent.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: characterData, isLoading: isCharacterLoading } =
    api.char.getById.useQuery(
      { id: characterId! },
      { enabled: !!characterId, refetchOnWindowFocus: false },
    );
  const { data: traitsData, isLoading: isTraitsLoading } =
    api.char.getCharTraits.useQuery(undefined, { refetchOnWindowFocus: false });
  const { mutate: createMutation, isPending: isCharacterCreatePending } =
    api.char.create.useMutation();
  const { mutate: updateMutation, isPending: isCharacterUpdatePending } =
    api.char.update.useMutation();

  const handleStepChange = (step: number) => {
    void router.replace(
      { pathname: router.pathname, query: { ...router.query, step } },
      undefined,
      { shallow: false },
    );
  };

  useEffect(() => {
    if (!!router.query.step && step !== Number(router.query.step)) {
      setStep(Number(router.query.step));
    }
  }, [router, step]);

  useEffect(() => {
    if (!!router.query.pid) {
      setCharacterId(Number(router.query.pid));
    }
  }, [router.query.pid]);

  useEffect(() => {
    if (!!userData) {
      setIsAdmin(userData.isAdmin);
      setIsPersonnel(userData.isPersonnel);
    }
  }, [userData]);

  useEffect(() => {
    const playerName = userData?.name ?? "";
    const playerContact =
      (!!userData?.vk ? `ВКонтакте: ${userData?.vk}` : null) ??
      (!!userData?.tg ? `telegram: @${userData?.tg}` : null) ??
      (!!userData?.discord ? `discord: ${userData?.discord}` : null) ??
      (!!userData?.phone ? `телефон: ${userData?.phone}` : null) ??
      (!!userData?.email ? `электронная почта: ${userData?.email}` : null) ??
      "";
    if (!!characterData && !!traitsData) {
      setValue("visible", characterData.visible);
      setValue("image", characterData.image ?? "");
      setValue("playerName", characterData.playerName ?? playerName);
      setValue("playerContact", characterData.playerContact ?? playerContact);
      setValue("name", characterData.name);
      setValue("age", Number(characterData.age));
      setValue("factionId", characterData.factionId);
      setValue("clanId", characterData.clanId);
      setValue("status", characterData.status ?? "");
      setValue("title", characterData.title ?? "");
      setValue("publicInfo", characterData.publicInfo ?? "");
      setValue("sire", characterData.sire ?? "");
      setValue("childer", characterData.childer ?? "");
      setValue("ambition", characterData.ambition ?? "");
      setValue("content", characterData.content ?? "");
      setValue("additionalAbilities", characterData.additionalAbilities);
      setValue(
        "abilityIds",
        characterData.abilities.map((a) => a.abilityId),
      );
      setValue(
        "featuresWithComments",
        traitsData.features.map((f) => {
          const characterFeature = characterData.features.find(
            (cf) => cf.featureId === f.id,
          );
          return {
            id: f.id,
            cost: f.cost,
            comment: !!characterFeature
              ? characterFeature.description ?? ""
              : "",
            checked: !!characterFeature,
          };
        }),
      );
      setValue(
        "knowledges",
        traitsData.knowledges.map((k) => {
          return {
            id: k.id,
            name: k.name,
            checked: characterData.knowledges
              .map((ck) => ck.knowledgeId)
              .includes(k.id),
          };
        }),
      );
      setValue(
        "rituals",
        traitsData.rituals.map((r) => {
          return {
            id: r.id,
            name: r.name,
            checked: characterData.rituals
              .map((cr) => cr.ritualId)
              .includes(r.id),
            knowledgeRequired: r.ritualKnowledges[0]?.knowledgeId,
          };
        }),
      );
    } else if (!!traitsData) {
      setValue("playerName", playerName);
      setValue("playerContact", playerContact);
      setValue(
        "featuresWithComments",
        traitsData.features.map((f) => {
          return {
            id: f.id,
            cost: f.cost,
            comment: "",
            checked: false,
          };
        }),
      );
      setValue(
        "knowledges",
        traitsData.knowledges.map((k) => {
          return {
            id: k.id,
            name: k.name,
            checked: false,
          };
        }),
      );
      setValue(
        "rituals",
        traitsData.rituals.map((r) => {
          return {
            id: r.id,
            name: r.name,
            checked: false,
            knowledgeRequired: r.ritualKnowledges[0]?.knowledgeId,
          };
        }),
      );
    }
  }, [setValue, traitsData, characterData, userData]);

  const handleSaveCharacter = (callback?: () => void) => {
    if (!!characterId) {
      updateMutation(
        {
          id: characterId,
          name: getValues("name") ?? "",
          clanId: getValues("clanId"),
          factionId: getValues("factionId"),
          visible: !!getValues("visible"),
          image: getValues("image") ?? "",
          age: !!getValues("age") ? getValues("age")!.toString() : "",
          playerName: getValues("playerName"),
          playerContact: getValues("playerContact"),
          sire: getValues("sire") ?? "",
          childer: getValues("childer") ?? "",
          title: getValues("title"),
          status: getValues("status"),
          ambition: getValues("ambition"),
          additionalAbilities: Number(getValues("additionalAbilities") ?? 0),
          publicInfo: getValues("publicInfo"),
          content: getValues("content") ?? "",
          abilities: getValues("abilityIds"),
          features: getValues("featuresWithComments").filter(
            (fwc) => fwc.checked,
          ),
          knowledges: getValues("knowledges")
            .filter((k) => k.checked)
            .map((k) => k.id),
          rituals: getValues("rituals")
            .filter((r) => r.checked)
            .map((r) => r.id),
        },
        {
          onSuccess: (data) => {
            if (!!callback) callback();
            else
              void router.push(
                {
                  pathname: `/characters/${data.id}`,
                },
                undefined,
                { shallow: false },
              );
          },
          onError: () => {
            setError("root", {
              message: "Ошибка сохранения: подробности в консоли",
            });
          },
        },
      );
    } else
      createMutation(
        {
          name: getValues("name") ?? "",
          clanId: getValues("clanId"),
          factionId: getValues("factionId"),
          visible: !!getValues("visible"),
          image: getValues("image") ?? "",
          age: !!getValues("age") ? getValues("age")!.toString() : "",
          playerId: sessionData?.user.id,
          playerName: getValues("playerName"),
          playerContact: getValues("playerContact"),
          sire: getValues("sire") ?? "",
          childer: getValues("childer") ?? "",
          title: getValues("title"),
          status: getValues("status"),
          ambition: getValues("ambition"),
          additionalAbilities: Number(getValues("additionalAbilities") ?? 0),
          publicInfo: getValues("publicInfo"),
          content: getValues("content") ?? "",
          abilities: getValues("abilityIds"),
          features: getValues("featuresWithComments").filter(
            (fwc) => fwc.checked,
          ),
          knowledges: getValues("knowledges")
            .filter((k) => k.checked)
            .map((k) => k.id),
          rituals: getValues("rituals")
            .filter((r) => r.checked)
            .map((r) => r.id),
        },
        {
          onSuccess: (data) => {
            if (!!callback) {
              callback();
              setCharacterId(data.id);
            } else
              void router.push(
                {
                  pathname: `/characters/${data.id}`,
                },
                undefined,
                { shallow: false },
              );
          },
          onError: () => {
            setError("root", {
              message: "Ошибка сохранения: подробности в консоли",
            });
          },
        },
      );
  };

  const handleVisibilityChagne = () => {
    setValue("visible", !watchedVisible);
    if (!!characterId || step > 2)
      handleSaveCharacter(() => {
        return null;
      });
  };

  if (isUserLoading || isTraitsLoading || isCharacterLoading)
    return <LoadingPage />;

  const factions: Faction[] = !!traitsData ? traitsData.factions : [];
  const clans: Clan[] = !!traitsData ? traitsData.clans : [];
  const abilities: Ability[] = !!traitsData ? traitsData.abilities : [];
  const features: Feature[] = !!traitsData ? traitsData.features : [];
  const knowledges: Knowledge[] = !!traitsData ? traitsData.knowledges : [];
  const rituals: Ritual[] = !!traitsData ? traitsData.rituals : [];

  const abilitiesRemain: number = watchedFWC
    .filter((fwc) => fwc.checked)
    .map((fwc) => fwc.id)
    .includes(features.find((f) => f.name === "Способный ученик")!.id)
    ? Number(watchedAdditionalAbilities ?? 0) + 4
    : Number(watchedAdditionalAbilities ?? 0) + 3;

  const isContinueDisabled: boolean =
    (step === 1 && (!watchedPlayerName || !watchedPlayerContact)) ||
    (step === 2 &&
      (!watchedName ||
        !watchedAge ||
        !watchedFactionId ||
        !watchedClanId ||
        !watchedPublicInfo ||
        watchedPublicInfo === "<p></p>")) ||
    (step === 3 && (!watchedContent || watchedContent === "<p></p>")) ||
    (step === 4 &&
      watchedAbilityIds.length > abilitiesRemain &&
      !infiniteAbilities) ||
    (step === 5 &&
      (!!costSum ||
        watchedFWC.reduce((a, b) => a || (!b.comment && b.checked), false)) &&
      !infiniteFeatures);

  return (
    <>
      <Head>
        <title>Новый персонаж</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`mx-auto flex max-w-4xl flex-1 flex-col gap-2 sm:pb-2`}>
        <div
          className={`container mt-[5.4rem] flex flex-col gap-2 rounded-none bg-white/75 px-2 pb-2 dark:bg-red-950/50 sm:mt-24 sm:rounded-b-lg`}
        >
          <h1 className="text-3xl font-semibold">
            {characterId ? (
              <a href={`/characters/${characterId}`}>{watchedName ?? " "}</a>
            ) : (
              "Новый персонаж"
            )}
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-col gap-2">
              <Checkbox
                isSelected={watchedVisible}
                onChange={() => handleVisibilityChagne()}
              >
                Виден другим игрокам
              </Checkbox>
              {uploading ? (
                <LoadingSpinner width={220} height={220} />
              ) : (
                <Image
                  className="mx-auto aspect-square h-[220px] w-[220px] rounded-md object-cover"
                  alt="char_photo"
                  src={!!watchedImage ? watchedImage : default_char}
                  height="440"
                  width="440"
                />
              )}
              <UploadButton
                disabled={uploading}
                content={{
                  button: (
                    <div className="flex flex-row items-center gap-2">
                      <FaImage size={16} className="ml-2" />
                      <p className="text-sm">Загрузить</p>
                    </div>
                  ),
                  allowedContent: "до 4 Мб",
                }}
                appearance={{ button: { height: 30, width: 120 } }}
                className="h-14"
                endpoint="imageUploader"
                onBeforeUploadBegin={(files) => {
                  setUploading(true);
                  return files;
                }}
                onClientUploadComplete={(res) => {
                  setValue("image", res[0]?.url ?? "");
                  setUploading(false);
                }}
              />
            </div>
            <div className="-mt-16 flex flex-1 flex-col sm:mt-0">
              <div className="mb-4 flex flex-row items-center justify-between sm:mb-1">
                <Button
                  size="sm"
                  variant="bordered"
                  className="w-24 gap-1 px-0"
                  isDisabled={step === 1}
                  onClick={() => handleStepChange(step - 1)}
                >
                  <FaAngleLeft size={16} /> Назад
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  className="w-24 gap-1 px-0"
                  isDisabled={
                    isContinueDisabled ||
                    isCharacterCreatePending ||
                    isCharacterUpdatePending
                  }
                  onClick={() =>
                    step > 1 || !!characterId
                      ? handleSaveCharacter(
                          step === 6
                            ? undefined
                            : () => handleStepChange(step + 1),
                        )
                      : handleStepChange(step + 1)
                  }
                >
                  {step === 6 ? "Сохранить" : "Вперёд"}
                  {isCharacterCreatePending || isCharacterUpdatePending ? (
                    <LoadingSpinner width={16} height={16} />
                  ) : step === 6 ? (
                    <FaRegSave size={16} />
                  ) : (
                    <FaAngleRight size={16} />
                  )}
                </Button>
              </div>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                  className="flex flex-1 flex-col"
                >
                  <p className="text-lg font-semibold">Информация об игроке</p>
                  <Input
                    isRequired
                    isInvalid={!!errors.playerName}
                    errorMessage={errors.playerName?.message}
                    autoComplete="off"
                    variant="underlined"
                    label="Имя игрока"
                    placeholder="Введите имя игрока"
                    description="Ваше реальное имя или предпочитаемое обращение как к игроку"
                    {...register("playerName", {
                      required:
                        "Введите ваше реальное имя или предпочитаемое обращение как к игроку",
                    })}
                  />
                  <Input
                    isRequired
                    isInvalid={!!errors.playerContact}
                    errorMessage={errors.playerContact?.message}
                    autoComplete="off"
                    variant="underlined"
                    label="Способ связи"
                    placeholder="Введите предпочитаемый способ связи"
                    description="Например, ссылка на ваш профиль в соцсетях, номер телефона или хэндл в телеграмме или дискорде"
                    {...register("playerContact", {
                      required:
                        "Введите ссылку на ваш профиль в соцсетях, номер телефона или хэндл в телеграмме или дискорде",
                    })}
                  />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                  className="flex flex-1 flex-col"
                >
                  <p className="text-lg font-semibold">
                    Публичная информация о персонаже
                  </p>
                  <Input
                    isRequired
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    autoComplete="off"
                    variant="underlined"
                    label="Имя персонажа"
                    placeholder="Введите имя персонажа"
                    description="Имя, известное другим персонажам в городе"
                    {...register("name", {
                      required:
                        "Введите имя вашего персонажа, известное другим персонажам в городе",
                    })}
                  />
                  <Input
                    isRequired
                    autoComplete="off"
                    isInvalid={!!errors.age}
                    errorMessage={errors.age?.message}
                    type="number"
                    variant="underlined"
                    label="Возраст персонажа"
                    placeholder="Введите возраст"
                    description="Возраст, известный другим персонажам в городе"
                    {...register("age", {
                      validate: (value) => {
                        if (Number(value) < 18)
                          return "Ваш персонаж не может быть младше 18 лет";
                      },
                    })}
                    onChange={(e) => {
                      setValue(
                        "age",
                        Number(e.target.value) > 0
                          ? Number(e.target.value)
                          : undefined,
                      );
                    }}
                  />
                  <Select
                    isRequired
                    label="Фракция"
                    variant="underlined"
                    placeholder="Выберите фракцию"
                    {...register("factionId")}
                    onChange={(e) => {
                      if (
                        !!e.target.value &&
                        e.target.value !== watchedFactionId?.toString()
                      ) {
                        setValue("factionId", Number(e.target.value));
                        setValue(
                          "featuresWithComments",
                          watchedFWC.map((fwc) => {
                            return { ...fwc, comment: "", checked: false };
                          }),
                        );
                      }
                    }}
                  >
                    {factions
                      .filter(
                        (f) => f.visibleToPlayer || isAdmin || isPersonnel,
                      )
                      .map((faction) => (
                        <SelectItem
                          key={faction.id}
                          value={faction.id}
                          textValue={faction.name}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="text-small dark:text-red-100">
                              {faction.name}
                            </div>
                            <div className="flex flex-row gap-1">
                              <Image
                                alt="icon"
                                className="mr-2 max-h-12 min-w-12 max-w-12 object-contain"
                                src={
                                  !!faction.icon
                                    ? icons.find(
                                        (di) => di!.key === faction.icon,
                                      )?.value ?? ""
                                    : defaultIcon
                                }
                                height={128}
                                width={128}
                              />
                              <span className="whitespace-normal text-tiny dark:text-red-100">
                                {faction.content}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </Select>
                  <Select
                    isRequired
                    label="Клан"
                    variant="underlined"
                    disabled={!watchedFactionId}
                    placeholder={
                      !!watchedFactionId
                        ? "Выберите клан"
                        : "Сначала выберите фракцию"
                    }
                    {...register("clanId")}
                    onChange={(e) => {
                      if (
                        !!e.target.value &&
                        Number(e.target.value) !== watchedClanId
                      ) {
                        setValue("clanId", Number(e.target.value));
                        setValue("abilityIds", []);
                        setValue(
                          "featuresWithComments",
                          watchedFWC.map((fwc) => {
                            return { ...fwc, comment: "", checked: false };
                          }),
                        );
                        setCostSum(0);
                      }
                    }}
                  >
                    {clans
                      .filter(
                        (c) =>
                          (c.visibleToPlayer &&
                            c
                              .ClanInFaction!.map((fa) => fa.factionId)
                              .includes(watchedFactionId)) ||
                          isAdmin ||
                          isPersonnel,
                      )
                      .map((clan) => (
                        <SelectItem
                          key={clan.id}
                          value={clan.id}
                          textValue={clan.name}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-small dark:text-red-100">
                              {clan.name}
                            </span>
                            <div className="flex flex-row gap-1">
                              <Image
                                alt="icon"
                                className="mr-2 max-h-12 min-w-12 max-w-12 object-contain"
                                src={
                                  !!clan.icon
                                    ? icons.find((di) => di!.key === clan.icon)
                                        ?.value ?? ""
                                    : defaultIcon
                                }
                                height={128}
                                width={128}
                              />
                              <span className="whitespace-normal text-tiny dark:text-red-100">
                                {clan.content}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </Select>
                  <Input
                    autoComplete="off"
                    variant="underlined"
                    label="Статусы"
                    placeholder="Введите статусы через запятую"
                    description="Статусы - это социальная валюта сородичей, определяющая вес вашего персонажа в обществе"
                    {...register("status")}
                  />
                  <Input
                    autoComplete="off"
                    variant="underlined"
                    label="Титулы"
                    placeholder="Введите титулы через запятую"
                    description="Титулы - это должностные обращения персонажа"
                    {...register("title")}
                  />
                  <DefaultEditor
                    isRequired
                    label="Публичная информация"
                    initialContent={getValues("publicInfo")}
                    className="min-h-44"
                    onUpdate={(a) => setValue("publicInfo", a)}
                    placeholder="Введите информацию, известную другим персонажам в городе"
                  />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                  className="flex flex-1 flex-col"
                >
                  <p className="text-lg font-semibold">
                    Приватная информация о персонаже
                  </p>
                  <Input
                    autoComplete="off"
                    variant="underlined"
                    label="Сир"
                    placeholder="Введите имя сира"
                    {...register("sire")}
                  />
                  <Input
                    autoComplete="off"
                    variant="underlined"
                    label="Чайлды"
                    placeholder="Введите имена чайлдов через запятую"
                    {...register("childer")}
                  />
                  <Textarea
                    variant="underlined"
                    label="Амбиции и желания"
                    placeholder="Введите амбиции и желания вашего персонажа"
                    {...register("ambition")}
                  />
                  <DefaultEditor
                    isRequired
                    tabIndex={10}
                    label="Квента"
                    className="min-h-44"
                    initialContent={watchedContent}
                    onUpdate={(a) => setValue("content", a)}
                    placeholder="Введите предысторию и прочую информацию для мастерской группы"
                  />
                </motion.div>
              )}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                  className="flex flex-1 flex-col"
                >
                  <div className="mb-2 flex flex-col gap-2">
                    <p className="text-lg font-semibold">Дисциплины</p>
                    <Input
                      variant="underlined"
                      type="number"
                      label="Для старейшин: дополнительные дисциплины"
                      placeholder="1 по-умолчанию или 2 по сюжетным причинам"
                      {...register("additionalAbilities")}
                      onChange={(e) => {
                        setValue(
                          "additionalAbilities",
                          Number(e.target.value) > 0 &&
                            Number(e.target.value) < 3
                            ? Number(e.target.value)
                            : undefined,
                        );
                      }}
                    />
                    <div className="flex flex-col-reverse">
                      {(isAdmin || isPersonnel) && (
                        <Checkbox
                          isSelected={infiniteAbilities}
                          onValueChange={setInfiniteAbilities}
                        >
                          Бесконечные дисциплины
                        </Checkbox>
                      )}
                      {(isAdmin || isPersonnel) && (
                        <Checkbox
                          isSelected={seeAllAbilities}
                          onValueChange={setSeeAllAbilities}
                        >
                          Показать все дисциплины
                        </Checkbox>
                      )}
                    </div>
                  </div>
                  <CheckboxGroup
                    label={
                      !!watchedClanId
                        ? `Выберите дисциплины - не больше ${abilitiesRemain}`
                        : "Сначала выберите клан"
                    }
                    color="warning"
                    value={
                      watchedAbilityIds
                        ? watchedAbilityIds.map((a) => a.toString())
                        : []
                    }
                    onValueChange={(aids) =>
                      setValue(
                        "abilityIds",
                        aids.map((aid) => Number(aid)),
                      )
                    }
                  >
                    {abilities
                      .filter(
                        (a) =>
                          (a
                            .AbilityAvailable!.map((aa) => aa.clanId)
                            .includes(watchedClanId) &&
                            (a.requirementId
                              ? watchedAbilityIds.includes(a.requirementId)
                              : true) &&
                            a.visibleToPlayer) ||
                          seeAllAbilities,
                      )
                      .map((ability) => (
                        <Checkbox
                          isDisabled={
                            (abilities
                              .filter((a) => watchedAbilityIds.includes(a.id))
                              .map((a) => a.requirementId)
                              .includes(Number(ability.id)) ||
                              (abilities
                                .filter(
                                  (a) => !watchedAbilityIds.includes(a.id),
                                )
                                .map((a) => a.id)
                                .includes(Number(ability.id)) &&
                                watchedAbilityIds.length >
                                  abilitiesRemain - 1)) &&
                            !infiniteAbilities
                          }
                          key={ability.id + "_ability"}
                          value={ability.id.toString()}
                          classNames={{
                            base: cn(
                              "flex-row flex flex-1 max-w-full w-full m-0",
                              "hover:bg-success/25 dark:hover:bg-danger/25 items-center justify-start",
                              "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                              "data-[selected=true]:border-success dark:data-[selected=true]:border-warning",
                            ),
                            label: "w-full",
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ ease: "easeInOut", duration: 0.5 }}
                            className="flex flex-col"
                          >
                            <div className="flex flex-row items-center gap-2 text-xl">
                              <Image
                                alt="disc"
                                className="max-h-12 max-w-12"
                                src={
                                  !!ability.icon
                                    ? discIcons.find(
                                        (di) => di.key === ability.icon,
                                      )?.value ?? ""
                                    : ""
                                }
                                height={128}
                                width={128}
                              />{" "}
                              {ability.name}
                            </div>
                            <p className="whitespace-break-spaces pt-2 text-justify text-xs">
                              {ability.content}
                            </p>
                          </motion.div>
                        </Checkbox>
                      ))}
                  </CheckboxGroup>
                </motion.div>
              )}
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                  className="flex flex-1 flex-col"
                >
                  <p className="text-lg font-semibold">
                    {"Дополнения" + (!!costSum ? ` (в сумме ${costSum})` : "")}
                  </p>
                  <div className="mb-1 flex flex-col-reverse">
                    {(isAdmin || isPersonnel) && (
                      <Checkbox
                        isSelected={seeAllFeatures}
                        onValueChange={setSeeAllFeatures}
                      >
                        Показать все дополнения
                      </Checkbox>
                    )}
                    {(isAdmin || isPersonnel) && (
                      <Checkbox
                        isSelected={infiniteFeatures}
                        onValueChange={setInfiniteFeatures}
                      >
                        Бесконечные дополнения
                      </Checkbox>
                    )}
                  </div>
                  <CheckboxGroup
                    label={
                      !!watchedClanId
                        ? "Выберите дополнения"
                        : "Сначала выберите клан"
                    }
                    color="warning"
                    value={watchedFWC
                      .filter((fwc) => fwc.checked)
                      .map((fwc) => fwc.id.toString())}
                    onValueChange={(fids) => {
                      setCostSum(
                        features
                          .filter((f) => fids.includes(f.id.toString()))
                          .reduce((a, b) => a + b.cost, 0),
                      );
                      const newFWC = watchedFWC.map((fwc) => {
                        const fWC = watchedFWC.find((fWC) => fWC.id === fwc.id);
                        return {
                          id: fwc.id,
                          cost: fwc.cost,
                          comment: !!fWC ? fWC.comment : "",
                          checked: fids.includes(fwc.id.toString()),
                        };
                      });
                      setValue("featuresWithComments", newFWC);
                    }}
                  >
                    {features
                      .filter(
                        (f) =>
                          (f
                            .FeatureAvailable!.map((fa) => fa.clanId)
                            .includes(watchedClanId) &&
                            f.visibleToPlayer) ||
                          seeAllFeatures,
                      )
                      .map((feature) => (
                        <div key={feature.id + "_feature"}>
                          <Checkbox
                            value={feature.id.toString()}
                            isDisabled={
                              feature.name === "Способный ученик" &&
                              watchedAbilityIds.length >
                                3 + Number(watchedAdditionalAbilities ?? 0)
                            }
                            classNames={{
                              base: cn(
                                "flex-row flex flex-1 max-w-full w-full m-0",
                                "hover:bg-warning/25 items-center justify-start",
                                "cursor-pointer rounded-lg gap-1 p-2 border-2 border-transparent",
                                "data-[selected=true]:border-warning",
                              ),
                              label: "w-full",
                            }}
                          >
                            <div className="flex flex-col">
                              {feature.cost > 0
                                ? `+${feature.cost}`
                                : feature.cost}
                              &nbsp;{feature.name}
                              <p className="whitespace-break-spaces pt-1 text-justify text-xs">
                                {feature.content}
                              </p>
                            </div>
                          </Checkbox>
                          {watchedFWC.find((fwc) => fwc.id === feature.id)
                            ?.checked && (
                            <Textarea
                              variant="underlined"
                              color="warning"
                              label="Комментарий"
                              placeholder={`Введите комментарий к дополнению "${feature.name}"`}
                              onValueChange={(v) => {
                                setValue(
                                  "featuresWithComments",
                                  watchedFWC.map((fwc) => {
                                    return {
                                      ...fwc,
                                      comment:
                                        fwc.id === feature.id ? v : fwc.comment,
                                    };
                                  }),
                                );
                              }}
                              value={
                                watchedFWC.find((fwc) => fwc.id === feature.id)
                                  ?.comment
                              }
                            />
                          )}
                        </div>
                      ))}
                  </CheckboxGroup>
                </motion.div>
              )}
              {step === 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                  className="flex flex-1 flex-col"
                >
                  <p className="text-lg font-semibold">Знания</p>
                  <CheckboxGroup
                    label="Выберите знания"
                    color="warning"
                    value={watchedKnowledges
                      .filter((k) => k.checked)
                      .map((k) => k.id.toString())}
                    onValueChange={(kids) => {
                      const newKnowledges = watchedKnowledges.map((k) => {
                        return {
                          id: k.id,
                          name: k.name,
                          checked: !!kids.includes(k.id.toString()),
                        };
                      });
                      setValue("knowledges", newKnowledges);
                    }}
                  >
                    {knowledges.map((knowledge) => (
                      <Checkbox
                        key={knowledge.id + "_knowledge"}
                        value={knowledge.id.toString()}
                        classNames={{
                          base: cn(
                            "flex-row flex flex-1 max-w-full w-full m-0",
                            "hover:bg-warning/25 items-center justify-start",
                            "cursor-pointer rounded-lg gap-1 p-2 border-2 border-transparent",
                            "data-[selected=true]:border-warning",
                          ),
                          label: "w-full",
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ ease: "easeInOut", duration: 0.5 }}
                          className="flex flex-col"
                        >
                          <div className="flex flex-row items-center gap-2 text-xl">
                            {knowledge.name}
                          </div>
                          <p className="whitespace-break-spaces pt-2 text-justify text-xs">
                            {knowledge.content}
                          </p>
                        </motion.div>
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                  <p className="text-lg font-semibold">Ритуалы</p>
                  <p className="text-justify text-sm italic">
                    Игроки с продвинутыми версиями Тауматургии или Чародейства
                    могут взять до 4 ритуалов, все остальные - не больше 2.
                  </p>
                  <CheckboxGroup
                    label="Выберите ритуалы"
                    color="warning"
                    value={watchedRituals
                      .filter((r) => r.checked)
                      .map((r) => r.id.toString())}
                    onValueChange={(rids) => {
                      const newRituals = watchedRituals.map((r) => {
                        return {
                          id: r.id,
                          name: r.name,
                          checked: !!rids.includes(r.id.toString()),
                          knowledgeRequired: r.knowledgeRequired,
                        };
                      });
                      setValue("rituals", newRituals);
                    }}
                  >
                    {rituals
                      .filter(
                        (r) =>
                          r.visibleToPlayer &&
                          watchedKnowledges
                            .filter((wK) => wK.checked)
                            .some(
                              (k) =>
                                k.id === r.ritualKnowledges![0]?.knowledgeId,
                            ),
                      )
                      .map((ritual) => (
                        <Checkbox
                          key={ritual.id + "_ritual"}
                          value={ritual.id.toString()}
                          classNames={{
                            base: cn(
                              "flex-row flex flex-1 max-w-full w-full m-0",
                              "hover:bg-warning/25 items-center justify-start",
                              "cursor-pointer rounded-lg gap-1 p-2 border-2 border-transparent",
                              "data-[selected=true]:border-warning",
                            ),
                            label: "w-full",
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ ease: "easeInOut", duration: 0.5 }}
                            className="flex flex-col"
                          >
                            <div className="flex flex-row items-center gap-2 text-xl">
                              {ritual.name}
                            </div>
                            <p className="whitespace-break-spaces pt-2 text-justify text-xs">
                              {ritual.content}
                            </p>
                          </motion.div>
                        </Checkbox>
                      ))}
                  </CheckboxGroup>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
