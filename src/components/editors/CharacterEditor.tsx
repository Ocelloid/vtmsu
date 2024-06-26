import {
  Input,
  Select,
  SelectItem,
  Button,
  Textarea,
  Accordion,
  AccordionItem,
  CheckboxGroup,
  Checkbox,
  User as UserIcon,
  // Link,
  cn,
} from "@nextui-org/react";
import type {
  Faction,
  Clan,
  Ability,
  Feature,
} from "~/server/api/routers/char";
import Head from "next/head";
import Image from "next/image";
import { UploadButton } from "~/utils/uploadthing";
import DefaultEditor from "~/components/editors/DefaultEditor";
import { FaRegSave, FaTrashAlt, FaImage, FaFile } from "react-icons/fa";
import default_char from "~/../public/default_char.png";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import {
  disciplines,
  clans as clan_icons,
  factions as faction_icons,
} from "~/assets";
import { useTheme } from "next-themes";
import { useCharacterStore } from "~/stores/useCharacterStore";

// type SelectContact = {
//   label: string;
//   value: string;
//   description: string;
// };

export default function CharacterEditor() {
  const router = useRouter();
  const { theme } = useTheme();

  const {
    name,
    age,
    image,
    playerName,
    playerContact,
    factionId,
    clanId,
    status,
    title,
    visible,
    publicInfo,
    sire,
    childer,
    ambition,
    content,
    abilityIds,
    additionalAbilities,
    featuresWithComments,
    isEditing,
    clear,
    update,
    storeFeatures,
    storeAbilities,
  } = useCharacterStore((state) => state);

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

  const [characterId, setCharacterId] = useState<number>();
  const [infiniteAbilities, setInfiniteAbilities] = useState<boolean>(false);
  const [infiniteFeatures, setInfiniteFeatures] = useState<boolean>(false);
  const [seeAllAbilities, setSeeAllAbilities] = useState<boolean>(false);
  const [seeAllFeatures, setSeeAllFeatures] = useState<boolean>(false);
  const [costSum, setCostSum] = useState<number>(0);
  // const [contactSelect, setContactSelect] = useState<SelectContact[]>([]);
  const [initialPublicInfo, setInitialPublicInfo] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [initialQuenta, setInitialQuenta] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPersonnel, setIsPersonnel] = useState<boolean>(false);
  const [publicHookCompleted, setPublicHookCompleted] =
    useState<boolean>(false);

  const { data: userData, isLoading: isUserLoading } =
    api.user.getCurrent.useQuery();

  const { data: characterData, isLoading: isCharacterLoading } =
    api.char.getById.useQuery({ id: characterId! }, { enabled: !!characterId });

  const { data: traitsData, isLoading: isTraitsLoading } =
    api.char.getCharTraits.useQuery();

  const { mutate: createMutation, isPending: isCharacterCreatePending } =
    api.char.create.useMutation();

  const { mutate: updateMutation, isPending: isCharacterUpdatePending } =
    api.char.update.useMutation();

  const { mutate: deleteMutation, isPending: isCharacterDeletePending } =
    api.char.delete.useMutation();

  const { data: userList, isLoading: isUserListLoading } =
    api.user.getUserList.useQuery(undefined, { enabled: isAdmin });

  useEffect(() => {
    if (!!userData) {
      // const pS = [];
      // pS.push({
      //   label: "Не пользуется техникой",
      //   value: "anachronism",
      //   description:
      //     "С этим персонажем нет возможности связаться с помощью современной техники.",
      // });
      // pS.push({
      //   label: "Не идёт на контакт",
      //   value: "antisocial",
      //   description:
      //     "Этот персонаж принципиально не желает, чтобы с ним выходили на связь.",
      // });
      // if (userData.phone)
      //   pS.push({
      //     label: "телефон: " + userData.phone,
      //     value: "phone",
      //     description: "",
      //   });
      // if (userData.email)
      //   pS.push({
      //     label: "email: " + userData.email,
      //     value: "email",
      //     description: "",
      //   });
      // if (userData.vk)
      //   pS.push({
      //     label: "ВК: " + userData.vk,
      //     value: "vk",
      //     description: "",
      //   });
      // if (userData.tg)
      //   pS.push({
      //     label: "TG: " + userData.tg,
      //     value: "tg",
      //     description: "",
      //   });
      // if (userData.discord)
      //   pS.push({
      //     label: "Discord: " + userData.discord,
      //     value: "discord",
      //     description: "",
      //   });
      // setContactSelect(pS);
      setIsAdmin(userData.isAdmin);
      setIsPersonnel(userData.isPersonnel);

      if (!!traitsData) {
        const fwc = traitsData.features.map((f) => {
          return {
            id: f.id,
            cost: f.cost,
            comment: "",
            checked: false,
          };
        });
        if (fwc.filter((fs) => fs.checked).length > 0)
          setCostSum(
            fwc
              .filter((fs) => fs.checked)
              .map((ff) => ff.cost)
              .reduce((a, b) => a + b),
          );

        if (characterData === "404") {
          void router.push(
            {
              pathname: `/characters/`,
            },
            undefined,
            { shallow: false },
          );
          return;
        }
        if (!!characterData) {
          const fwc = traitsData.features.map((f) => {
            return {
              id: f.id,
              cost: f.cost,
              comment: !!characterData.features.find(
                (fs) => fs.featureId === f.id,
              )
                ? characterData.features.find((fs) => fs.featureId === f.id)!
                    .description ?? ""
                : "",
              checked:
                !!characterData.features.find((fs) => fs.featureId === f.id) ??
                false,
            };
          });

          if (fwc.filter((fs) => fs.checked).length > 0)
            setCostSum(
              fwc
                .filter((fs) => fs.checked)
                .map((ff) => ff.cost)
                .reduce((a, b) => a + b),
            );

          setPlayerId(characterData.playerId ?? "");
          setInitialQuenta(characterData.content ?? "");
          setInitialPublicInfo(characterData.publicInfo ?? "");
          storeAbilities(characterData.abilities.map((a) => a.abilityId));
          storeFeatures(fwc);
          update({
            name: characterData.name,
            factionId: characterData.factionId,
            clanId: characterData.clanId,
            playerName: characterData.playerName ?? "",
            age: !!characterData.age ? Number(characterData.age) : 0,
            image: characterData.image ?? "",
            sire: characterData.sire ?? "",
            childer: characterData.childer ?? "",
            title: characterData.title ?? "",
            status: characterData.status ?? "",
            publicInfo: characterData.publicInfo ?? "",
            visible: characterData.visible,
            ambition: characterData.ambition ?? "",
            additionalAbilities: characterData.additionalAbilities ?? 0,
            content: characterData.content ?? "",
            // playerContact: characterData.playerContact ?? pS[0]?.label ?? "",
            playerContact: characterData.playerContact ?? "",
          });
        }
      }

      if (!playerName) update({ playerName: userData.name ?? "" });
      // if (!playerContact && !!pS.length)
      //   update({ playerContact: pS[0]?.label ?? "" });
    }
  }, [
    userData,
    traitsData,
    characterData,
    playerName,
    playerContact,
    router,
    update,
    storeAbilities,
    storeFeatures,
  ]);

  useEffect(() => {
    if (!publicHookCompleted) {
      setPublicHookCompleted(true);
      setInitialPublicInfo(publicInfo ?? "");
      setInitialQuenta(content ?? "");
    }
  }, [publicInfo, content, publicHookCompleted]);

  useEffect(() => {
    if (!!router.query.pid) {
      setCharacterId(Number(router.query.pid));
      update({ isEditing: true });
    }
    if (!router.query.pid && isEditing) {
      clear();
    }
  }, [router.query.pid, isEditing, update, clear]);

  useEffect(() => {
    if (!!featuresWithComments.length) {
      const hasChecked = featuresWithComments.filter((fwc) => fwc.checked);
      if (!!hasChecked.length) {
        setCostSum(hasChecked.map((fwc) => fwc.cost).reduce((a, b) => a + b));
      }
    }
  }, [featuresWithComments]);

  const handleSaveCharacter = () => {
    if (!!characterId)
      updateMutation(
        {
          id: characterId,
          name: name ?? "",
          clanId: clanId!,
          factionId: factionId!,
          visible: !!visible,
          image: image ?? "",
          age: age ? age.toString() : "",
          playerId: playerId,
          playerName: playerName,
          playerContact: playerContact,
          sire: sire ?? "",
          childer: childer ?? "",
          title: title,
          status: status,
          ambition: ambition,
          additionalAbilities: additionalAbilities ?? 0,
          publicInfo: publicInfo,
          content: content ?? "",
          abilities: abilityIds,
          features: featuresWithComments.filter((fwc) => fwc.checked),
        },
        {
          onSuccess: () => {
            handleClear();
            void router.push(
              {
                pathname: `/characters/${characterId}`,
              },
              undefined,
              { shallow: false },
            );
          },
        },
      );
    else
      createMutation(
        {
          name: name ?? "",
          clanId: clanId!,
          factionId: factionId!,
          visible: !!visible,
          image: image ?? "",
          age: age ? age.toString() : "",
          playerId: playerId,
          playerName: playerName,
          playerContact: playerContact,
          sire: sire ?? "",
          childer: childer ?? "",
          title: title,
          status: status,
          ambition: ambition,
          additionalAbilities: additionalAbilities ?? 0,
          publicInfo: publicInfo,
          content: content ?? "",
          abilities: abilityIds,
          features: featuresWithComments.filter((fwc) => fwc.checked),
        },
        {
          onSuccess: (data) => {
            handleClear();
            void router.push(
              {
                pathname: `/characters/${data.id}`,
              },
              undefined,
              { shallow: false },
            );
          },
        },
      );
  };

  const handleClear = () => {
    setCharacterId(undefined);
    setInitialPublicInfo("");
    setInitialQuenta("");
    setPlayerId("");
    setCostSum(0);
    clear();
  };

  const handleDeleteCharacter = () => {
    const deleteConfirm = confirm("Вы уверены, что хотите удалить персонажа?");
    if (!!characterId && deleteConfirm)
      deleteMutation(
        { id: characterId },
        {
          onSuccess: () => {
            handleClear();
            void router.push(
              {
                pathname: `/characters`,
              },
              undefined,
              { shallow: false },
            );
          },
        },
      );
  };

  if (
    isUserLoading ||
    isTraitsLoading ||
    isCharacterCreatePending ||
    isCharacterUpdatePending ||
    isCharacterDeletePending ||
    isCharacterLoading ||
    isUserListLoading
  )
    return <LoadingPage />;

  const factions: Faction[] = !!traitsData ? traitsData.factions : [];
  const clans: Clan[] = !!traitsData ? traitsData.clans : [];
  const abilities: Ability[] = !!traitsData ? traitsData.abilities : [];
  const features: Feature[] = !!traitsData ? traitsData.features : [];

  const abilitiesRemain =
    (featuresWithComments
      .filter((fwc) => fwc.checked)
      .map((fwc) => fwc.id)
      .includes(features.find((f) => f.name === "Способный ученик")!.id)
      ? (additionalAbilities ?? 0) + 4
      : (additionalAbilities ?? 0) + 3) - abilityIds.length;

  const isInvalid =
    !name ||
    !factionId ||
    !clanId ||
    !age ||
    !playerName ||
    !playerContact ||
    !ambition ||
    !publicInfo ||
    publicInfo === "<p></p>" ||
    !content ||
    content === "<p></p>" ||
    (!!costSum && !infiniteFeatures) ||
    !featuresWithComments
      .filter((fwc) => fwc.checked)
      .reduce((a, b) => a && !!b.comment, true) ||
    abilitiesRemain < 0;

  const invalidFields = [
    !name ? "имя персонажа" : undefined,
    !factionId ? "фракцию" : undefined,
    !clanId ? "клан" : undefined,
    !age ? "возраст" : undefined,
    !playerName ? "имя игрока" : undefined,
    !playerContact ? "способ связи" : undefined,
    !ambition ? "амбиции" : undefined,
    !publicInfo || publicInfo === "<p></p>"
      ? "публичную информацию"
      : undefined,
    !content || content === "<p></p>" ? "квенту" : undefined,
    !featuresWithComments
      .filter((fwc) => fwc.checked)
      .reduce((a, b) => a && !!b.comment, true)
      ? "комментарии к дополнениям"
      : undefined,
  ];

  const storeChanged =
    !!name ||
    !!age ||
    (!!playerName && playerName !== userData?.name) ||
    // (!!playerContact && playerContact !== contactSelect[0]?.label) ||
    !!playerContact ||
    !!factionId ||
    !!clanId ||
    !!status ||
    !!title ||
    !!visible ||
    !!publicInfo ||
    !!sire ||
    !!childer ||
    !!ambition ||
    !!additionalAbilities ||
    !!content ||
    !!featuresWithComments.filter((fs) => fs.checked).length ||
    !!abilityIds.length;

  return (
    <>
      <Head>
        <title>{!!name ? name : "Новый персонаж"}</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`mx-auto flex max-w-4xl flex-1 flex-col gap-2 sm:pb-2`}>
        <div
          className={`container mt-[5.4rem] flex flex-col gap-2 rounded-none bg-white/75 px-2 dark:bg-red-950/50 sm:mt-24 sm:rounded-b-lg`}
        >
          <div className="sticky top-[5.4rem] z-30 -mx-2 flex flex-col bg-black/50 px-2 sm:top-24 sm:rounded-b-lg">
            <div className="flex w-full flex-row gap-2 pb-1 pt-2">
              <UploadButton
                content={{
                  button: (
                    <>
                      <FaImage size={16} className="ml-2" />
                      <p className="hidden text-sm sm:flex">{`Фото (до 4 Мб)`}</p>
                    </>
                  ),
                  allowedContent: "Изображение (1 Мб)",
                }}
                className="h-8 w-full max-w-[160px] cursor-pointer text-white [&>div]:hidden [&>div]:text-sm [&>label>svg]:mr-1 [&>label]:w-full [&>label]:min-w-[84px] [&>label]:flex-1 [&>label]:rounded-medium [&>label]:border-2 [&>label]:border-white [&>label]:bg-transparent [&>label]:focus-within:ring-0 [&>label]:hover:bg-white/25"
                endpoint="imageUploader"
                onUploadBegin={() => {
                  setUploading(true);
                }}
                onClientUploadComplete={(res) => {
                  update({ image: res[0]?.url ?? "" });
                  setUploading(false);
                }}
              />
              <Button
                isDisabled={isInvalid}
                onClick={handleSaveCharacter}
                variant={"ghost"}
                className="h-8 w-full border-warning text-sm hover:!bg-warning/25"
              >
                <FaRegSave size={16} />
                <p className="hidden sm:flex">Сохранить</p>
              </Button>
              {!!characterId && (
                <Button
                  onClick={handleDeleteCharacter}
                  variant={"ghost"}
                  color="danger"
                  className="h-8 w-full text-white hover:!bg-danger/25"
                >
                  <FaTrashAlt size={16} />
                  <p className="hidden sm:flex">Удалить</p>
                </Button>
              )}
              {!characterId && storeChanged && (
                <Button
                  onClick={() => {
                    handleClear();
                  }}
                  variant={"ghost"}
                  color="primary"
                  className="h-8 w-full text-white hover:!bg-primary/25"
                >
                  <FaFile size={16} />
                  <p className="hidden sm:flex">Очистить</p>
                </Button>
              )}
              {!!characterId && (
                <Button
                  onClick={() => {
                    handleClear();
                    void router.push(
                      {
                        pathname: `/characters/new`,
                      },
                      undefined,
                      { shallow: false },
                    );
                  }}
                  variant={"ghost"}
                  color="primary"
                  className="h-8 w-full text-white hover:!bg-primary/25"
                >
                  <FaFile size={16} />
                  <p className="hidden sm:flex">Новый</p>
                </Button>
              )}
            </div>
            <div className="flex flex-1 flex-grow pb-1 text-center text-xs text-warning">
              {isInvalid && (
                <p className="mx-auto">
                  {!!invalidFields.filter((i) => !!i).length && "Введите "}
                  {invalidFields.filter((i) => !!i).join(", ")}
                  {!!invalidFields.filter((i) => !!i).length && ". "}
                  {!!costSum &&
                    !infiniteFeatures &&
                    "Сумма дополнений долна быть равна нулю."}
                  {abilitiesRemain < 0 &&
                    !infiniteAbilities &&
                    `Вы можете выбрать не более ${abilitiesRemain + abilityIds.length} дисциплин.`}
                </p>
              )}
            </div>
          </div>
          {isAdmin && userList && (
            <Select
              label="Игрок"
              placeholder="Выберите игрока"
              variant="underlined"
              selectedKeys={[playerId ?? ""]}
              onChange={(e) =>
                setPlayerId(!!e.target.value ? e.target.value : playerId)
              }
            >
              {userList.map((user) => (
                <SelectItem
                  key={user.id}
                  value={user.id}
                  textValue={user.name!}
                >
                  <UserIcon
                    name={user.name}
                    className="mr-auto"
                    classNames={{ description: "text-foreground-600" }}
                    description={
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <span>
                          Персонажей:&nbsp;
                          {!!user.characters ? user.characters.length : 0}
                        </span>
                      </div>
                    }
                    avatarProps={{
                      src: user.image ?? "",
                    }}
                  />
                </SelectItem>
              ))}
            </Select>
          )}
          <div className="-mx-2 -mt-2 flex flex-col gap-2 px-2 sm:mx-0 sm:px-0 md:gap-4">
            <div className="grid grid-cols-11 gap-2">
              <div className="col-span-5 flex flex-col items-center justify-center sm:col-span-3">
                {uploading ? (
                  <LoadingSpinner width={80} height={80} />
                ) : (
                  <Image
                    className="aspect-square h-[220px] w-[220px] rounded-md object-cover"
                    alt="char_photo"
                    src={!!image ? image : default_char}
                    height="440"
                    width="440"
                  />
                )}
              </div>
              <div className="col-span-6 flex flex-1 flex-col sm:col-span-4">
                <Input
                  variant="underlined"
                  label="Имя персонажа"
                  placeholder="Введите имя персонажа"
                  value={name}
                  onValueChange={(s) => {
                    update({ name: s });
                  }}
                />
                <Input
                  type="number"
                  variant="underlined"
                  label="Возраст персонажа"
                  placeholder="Введите возраст"
                  value={age ? age.toString() : ""}
                  onValueChange={(a) => {
                    update({ age: Number(a) });
                  }}
                />
                <Input
                  variant="underlined"
                  label="Имя игрока"
                  placeholder="Введите имя игрока"
                  value={playerName}
                  onValueChange={(s) => {
                    update({ playerName: s });
                  }}
                />
                <Input
                  variant="underlined"
                  label="Способ связи"
                  placeholder="Введите способ связи"
                  value={playerContact}
                  onValueChange={(s) => {
                    update({ playerContact: s });
                  }}
                />

                {/* <Select
                  label="Способ связи"
                  placeholder="Введите способ связи"
                  variant="underlined"
                  selectedKeys={[playerContact ?? ""]}
                  onChange={(e) => {
                    update({
                      playerContact: !!e.target.value
                        ? e.target.value
                        : playerContact,
                    });
                  }}
                >
                  {contactSelect.map((item) => (
                    <SelectItem
                      key={item.label}
                      value={item.label}
                      textValue={item.label}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </Select> */}
              </div>
              <div className="col-span-11 flex-1 flex-col sm:col-span-4 sm:flex">
                <Select
                  label="Фракция"
                  variant="underlined"
                  placeholder="Выберите фракцию"
                  selectedKeys={!!factionId ? [factionId.toString()] : []}
                  onChange={(e) => {
                    if (
                      !!e.target.value &&
                      e.target.value !== factionId?.toString()
                    ) {
                      update({
                        factionId: Number(e.target.value),
                        clanId: undefined,
                      });
                      storeAbilities([]);
                      storeFeatures(
                        featuresWithComments.map((fwc) => {
                          return { ...fwc, comment: "", checked: false };
                        }),
                      );
                    }
                  }}
                >
                  {factions
                    .filter((f) => f.visibleToPlayer || isAdmin || isPersonnel)
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
                                  ? icons.find((di) => di!.key === faction.icon)
                                      ?.value ?? ""
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
                  label="Клан"
                  variant="underlined"
                  disabled={!factionId}
                  placeholder={
                    !!factionId ? "Выберите клан" : "Сначала выберите фракцию"
                  }
                  selectedKeys={!!clanId ? [clanId.toString()] : []}
                  onChange={(e) => {
                    if (!!e.target.value) {
                      update({ clanId: Number(e.target.value) });
                      storeAbilities([]);
                      storeFeatures(
                        featuresWithComments.map((fwc) => {
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
                            .includes(factionId!)) ||
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
                  variant="underlined"
                  label="Статусы"
                  placeholder="Введите статусы через запятую"
                  value={status}
                  onValueChange={(a) => {
                    update({ status: a });
                  }}
                />
                <Input
                  variant="underlined"
                  label="Титулы"
                  placeholder="Введите титулы через запятую"
                  value={title}
                  onValueChange={(a) => {
                    update({ title: a });
                  }}
                />
              </div>
            </div>
            <Checkbox
              color="warning"
              size="sm"
              isSelected={visible}
              onValueChange={(e) => update({ visible: e })}
            >
              Виден другим игрокам
            </Checkbox>
            <div className="flex flex-col gap-2">
              <DefaultEditor
                label="Публичная информация"
                className="min-h-44 sm:min-h-20"
                onUpdate={(a) => {
                  update({ publicInfo: a });
                }}
                initialContent={initialPublicInfo}
                placeholder="Введите информацию о вашем персонаже, известную другим персонажам в городе"
              />
            </div>
            <div className={"grid grid-cols-1 gap-4 sm:grid-cols-2"}>
              <Input
                variant="underlined"
                label="Сир"
                placeholder="Введите имя сира"
                value={sire}
                onValueChange={(a) => {
                  update({ sire: a });
                }}
              />
              <Input
                variant="underlined"
                label="Чайлды"
                placeholder="Введите имена чайлдов через запятую"
                value={childer}
                onValueChange={(a) => {
                  update({ childer: a });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Textarea
                variant="underlined"
                label="Амбиции и желания"
                placeholder="Введите амбиции и желания вашего персонажа"
                value={ambition}
                onValueChange={(a) => {
                  update({ ambition: a });
                }}
              />
              <DefaultEditor
                label="Квента"
                className="min-h-44 sm:min-h-20"
                initialContent={initialQuenta}
                onUpdate={(a) => {
                  update({ content: a });
                }}
                placeholder="Введите предысторию персонажа и прочую информацию для мастерской группы"
              />
            </div>
            <Accordion isCompact>
              <AccordionItem
                className="-mx-2"
                aria-label={"Дисциплины"}
                title={
                  "Дисциплины" +
                  (!!abilityIds.length
                    ? abilitiesRemain >= 0
                      ? ` (осталось ${abilitiesRemain})`
                      : ` (уберите ${abilitiesRemain * -1})`
                    : "")
                }
              >
                <div className="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    variant="underlined"
                    type="number"
                    isDisabled={
                      abilityIds.length > 3 + (additionalAbilities ?? 0)
                    }
                    label="Для старейшин: дополнительные дисциплины"
                    placeholder="1 по-умолчанию или 2 по договорённости с МГ"
                    value={
                      additionalAbilities ? additionalAbilities.toString() : ""
                    }
                    onValueChange={(a) => {
                      if (Number(a) > -1 && Number(a) < 3)
                        update({ additionalAbilities: Math.floor(Number(a)) });
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
                    !!clanId
                      ? `Выберите дисциплины - не больше ${abilitiesRemain + abilityIds.length}`
                      : "Сначала выберите клан"
                  }
                  color="warning"
                  value={abilityIds ? abilityIds.map((a) => a.toString()) : []}
                  onValueChange={(aids) => {
                    const maxDisc = abilitiesRemain + abilityIds.length;
                    console.log(maxDisc);
                    if (aids.length <= maxDisc || infiniteAbilities) {
                      storeAbilities(aids.map((aid) => Number(aid)));
                    }
                  }}
                >
                  {abilities
                    .filter(
                      (a) =>
                        (a
                          .AbilityAvailable!.map((aa) => aa.clanId)
                          .includes(clanId!) &&
                          (a.requirementId
                            ? abilityIds.includes(a.requirementId)
                            : true) &&
                          a.visibleToPlayer) ||
                        seeAllAbilities,
                    )
                    .map((ability) => (
                      <Checkbox
                        isDisabled={
                          (abilities
                            .filter((a) => abilityIds.includes(a.id))
                            .map((a) => a.requirementId)
                            .includes(Number(ability.id)) ||
                            (abilities
                              .filter((a) => !abilityIds.includes(a.id))
                              .map((a) => a.id)
                              .includes(Number(ability.id)) &&
                              abilityIds.length >
                                abilitiesRemain + abilityIds.length - 1)) &&
                          !infiniteAbilities
                        }
                        key={ability.id}
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
                        <div className="flex flex-col">
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
                        </div>
                      </Checkbox>
                    ))}
                </CheckboxGroup>
              </AccordionItem>
              <AccordionItem
                className="-mx-2"
                aria-label={"Дополнения"}
                title={
                  "Дополнения" + (!!costSum ? ` (в сумме ${costSum})` : "")
                }
              >
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
                    !!clanId ? "Выберите дополнения" : "Сначала выберите клан"
                  }
                  color="warning"
                  value={featuresWithComments
                    .filter((fwc) => fwc.checked)
                    .map((fwc) => fwc.id.toString())}
                  onValueChange={(fids) => {
                    setCostSum(
                      features
                        .filter((f) => fids.includes(f.id.toString()))
                        .reduce((a, b) => a + b.cost, 0),
                    );
                    storeFeatures(
                      features.map((fwc) => {
                        const fWC = featuresWithComments.find(
                          (fWC) => fWC.id === fwc.id,
                        );
                        return {
                          id: fwc.id,
                          cost: fwc.cost,
                          comment: !!fWC ? fWC.comment : "",
                          checked: fids.includes(fwc.id.toString()),
                        };
                      }),
                    );
                  }}
                >
                  {features
                    .filter(
                      (f) =>
                        (f
                          .FeatureAvailable!.map((fa) => fa.clanId)
                          .includes(clanId!) &&
                          f.visibleToPlayer) ||
                        seeAllFeatures,
                    )
                    .map((feature) => (
                      <>
                        <Checkbox
                          key={feature.id}
                          value={feature.id.toString()}
                          isDisabled={
                            feature.name === "Способный ученик" &&
                            abilityIds.length > 3 + (additionalAbilities ?? 0)
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
                        {featuresWithComments.find(
                          (fwc) => fwc.id === feature.id,
                        )?.checked && (
                          <Input
                            variant="underlined"
                            color="warning"
                            label="Комментарий"
                            placeholder={`Введите комментарий к дополнению "${feature.name}"`}
                            onValueChange={(v) => {
                              storeFeatures(
                                featuresWithComments.map((fwc) => {
                                  return {
                                    ...fwc,
                                    comment:
                                      fwc.id === feature.id ? v : fwc.comment,
                                  };
                                }),
                              );
                            }}
                            value={
                              featuresWithComments.find(
                                (fwc) => fwc.id === feature.id,
                              )?.comment
                            }
                          />
                        )}
                      </>
                    ))}
                </CheckboxGroup>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </>
  );
}
