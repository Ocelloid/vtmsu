import {
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  // Divider,
  Button,
  Textarea,
  Accordion,
  AccordionItem,
  CheckboxGroup,
  Checkbox,
  cn,
} from "@nextui-org/react";
import type {
  Faction,
  Clan,
  Ability,
  Feature,
} from "~/server/api/routers/char";
import Image from "next/image";
import { UploadButton } from "~/utils/uploadthing";
import DefaultEditor from "~/components/editors/DefaultEditor";
import { FaRegSave, FaTrashAlt, FaImage, FaFile } from "react-icons/fa";
import default_char from "~/../public/default_char.png";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { disciplines } from "~/assets";

type FeatureWithComment = {
  id: number;
  comment: string;
  checked: boolean;
};

type SelectContact = {
  label: string;
  value: string;
  description: string;
};

export default function CharacterEditor({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [characterId, setCharacterId] = useState<number>();
  const [factionId, setFactionId] = useState<number>();
  const [clanId, setClanId] = useState<number>();
  const [abilityIds, setAbilityIds] = useState<number[]>([]);
  const [featureWithComments, setFeatureWithComments] = useState<
    FeatureWithComment[]
  >([]);
  const [age, setAge] = useState<number>();
  const [costSum, setCostSum] = useState<number>(0);
  const [image, setImage] = useState<string>("");
  const [sire, setSire] = useState<string>("");
  const [childer, setChilder] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [playerContact, setPlayerContact] = useState<string>("");
  const [playerContactKey, setPlayerContactKey] = useState<string>("");
  const [contactSelect, setContactSelect] = useState<SelectContact[]>([]);
  const [publicInfo, setPublicInfo] = useState<string>("");
  const [initialPublicInfo, setInitialPublicInfo] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [ambition, setAmbition] = useState<string>("");
  // const [initialAmbition, setInitialAmbition] = useState<string>("");
  const [quenta, setQuenta] = useState<string>("");
  const [initialQuenta, setInitialQuenta] = useState<string>("");
  const [factions, setFactions] = useState<Faction[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

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

  useEffect(() => {
    if (!!traitsData && !!userData) {
      setFactions(traitsData.factions);
      setClans(traitsData.clans);
      setAbilities(traitsData.abilities);
      setFeatures(traitsData.features);
      setFeatureWithComments(
        traitsData.features.map((f) => {
          return { id: f.id, comment: "", checked: false };
        }),
      );
      setPlayerName(userData.name ?? "");
      const pS = [];
      if (userData.phone)
        pS.push({
          label: "телефон: " + userData.phone,
          value: "phone",
          description: "",
        });
      if (userData.email)
        pS.push({
          label: "email: " + userData.email,
          value: "email",
          description: "",
        });
      if (userData.vk)
        pS.push({ label: "ВК: " + userData.vk, value: "vk", description: "" });
      if (userData.tg)
        pS.push({ label: "TG: " + userData.tg, value: "tg", description: "" });
      if (userData.discord)
        pS.push({
          label: "Discord: " + userData.discord,
          value: "discord",
          description: "",
        });
      setContactSelect(pS);
    }
  }, [traitsData, userData]);

  useEffect(() => {
    if (!!characterData && !!traitsData && !!userData) {
      setName(characterData.name);
      setFactionId(characterData.factionId);
      setClanId(characterData.clanId);
      setAbilityIds(characterData.abilities.map((a) => a.id));
      const cdfs = characterData.features.map((cdf) => {
        return { id: cdf.featureId, comment: cdf.description!, checked: true };
      });
      setFeatureWithComments(
        traitsData.features.map((f) => {
          return cdfs.map((cdf) => cdf.id).includes(f.id)
            ? cdfs.find((cdf) => cdf.id === f.id)!
            : { id: f.id, comment: "", checked: false };
        }),
      );
      setPlayerName(userData.name ?? "");
      setPlayerContact(userData.phone ? userData.phone : userData.email ?? "");
      setAge(Number(characterData.age));
      setImage(characterData.image ?? "");
      setSire(characterData.sire ?? "");
      setChilder(characterData.childer ?? "");
      setTitle(characterData.title ?? "");
      setStatus(characterData.status ?? "");
      setInitialPublicInfo(characterData.publicInfo ?? "");
      setPublicInfo(characterData.publicInfo ?? "");
      setVisible(characterData.visible);
      // setInitialAmbition(characterData.ambition ?? "");
      setAmbition(characterData.ambition ?? "");
      setInitialQuenta(characterData.content ?? "");
      setQuenta(characterData.content ?? "");
      const pS = [];
      if (userData.phone)
        pS.push({
          label: "телефон: " + userData.phone,
          value: "phone",
          description: "",
        });
      if (userData.email)
        pS.push({
          label: "email: " + userData.email,
          value: "email",
          description: "",
        });
      if (userData.vk)
        pS.push({ label: "ВК: " + userData.vk, value: "vk", description: "" });
      if (userData.tg)
        pS.push({ label: "TG: " + userData.tg, value: "tg", description: "" });
      if (userData.discord)
        pS.push({
          label: "Discord: " + userData.discord,
          value: "discord",
          description: "",
        });
      setContactSelect(pS);
    }
  }, [characterData, traitsData, userData]);

  useEffect(() => {
    const id = Array.isArray(router.query.character)
      ? router.query.character[0] ?? ""
      : router.query.character ?? "";
    setCharacterId(Number(id));
  }, [router.query.character]);

  const handleSaveCharacter = () => {
    if (!!characterId)
      updateMutation(
        {
          id: characterId,
          name: name,
          clanId: clanId!,
          factionId: factionId!,
          visible: visible,
          image: image,
          age: age ? age.toString() : "",
          sire: sire,
          childer: childer,
          title: title,
          status: status,
          ambition: ambition,
          publicInfo: publicInfo,
          content: quenta,
          abilities: [...abilityIds].map((a) => Number(a)),
          features: featureWithComments.filter((fwc) => fwc.checked),
        },
        {
          onSuccess: () => {
            handleClear();
            onSuccess();
            return;
          },
        },
      );
    else
      createMutation(
        {
          name: name,
          clanId: clanId!,
          factionId: factionId!,
          visible: visible,
          image: image,
          age: age ? age.toString() : "",
          sire: sire,
          childer: childer,
          title: title,
          status: status,
          ambition: ambition,
          publicInfo: publicInfo,
          content: quenta,
          abilities: [...abilityIds].map((a) => Number(a)),
          features: featureWithComments.filter((fwc) => fwc.checked),
        },
        {
          onSuccess: () => {
            handleClear();
            onSuccess();
            return;
          },
        },
      );
    return;
  };

  const handleClear = () => {
    setName("");
    setFactionId(undefined);
    setClanId(undefined);
    setAbilityIds([]);
    setFeatureWithComments(
      featureWithComments.map((fwc) => {
        return { id: fwc.id, comment: "", checked: false };
      }),
    );
    setAge(0);
    setImage("");
    setTitle("");
    setStatus("");
    setSire("");
    setChilder("");
    setInitialPublicInfo("");
    setPublicInfo("");
    setVisible(false);
    // setInitialAmbition("");
    setAmbition("");
    setInitialQuenta("");
    setQuenta("");
  };

  const handleDeleteCharacter = () => {
    const deleteConfirm = confirm("Вы уверены, что хотите удалить персонажа?");
    if (!!characterId && deleteConfirm)
      deleteMutation(
        { id: characterId },
        {
          onSuccess: () => {
            handleClear();
            onSuccess();
            return;
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
    isCharacterLoading
  )
    return <LoadingPage />;

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
    !quenta ||
    quenta === "<p></p>" ||
    !!costSum ||
    !featureWithComments
      .filter((fwc) => fwc.checked)
      .reduce((a, b) => a && !!b.comment, true);

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
    !quenta || quenta === "<p></p>" ? "квенту" : undefined,
    !featureWithComments
      .filter((fwc) => fwc.checked)
      .reduce((a, b) => a && !!b.comment, true)
      ? "комментарии к дополнениям"
      : undefined,
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col">
      <div className="sticky top-[5.3rem] z-30 -mx-5 -mt-2 flex flex-col bg-black/50 px-5 sm:top-24 sm:rounded-xl">
        <div className="flex w-full flex-row gap-2 pb-1 pt-2">
          <UploadButton
            content={{
              button: (
                <>
                  <FaImage size={16} className="ml-2" />
                  <p className="hidden sm:flex">Изображение</p>
                </>
              ),
              allowedContent: "Изображение (1 Мб)",
            }}
            className="h-8 w-full max-w-[160px] cursor-pointer text-white [&>div]:hidden [&>div]:text-sm [&>label>svg]:mr-1 [&>label]:w-full [&>label]:min-w-[84px] [&>label]:flex-1 [&>label]:rounded-medium [&>label]:border-2 [&>label]:border-white [&>label]:bg-transparent [&>label]:focus-within:ring-0 [&>label]:hover:bg-white/25"
            endpoint="imageUploader"
            onUploadBegin={() => setUploading(true)}
            onClientUploadComplete={(res) => {
              setImage(res[0]?.url ?? "");
              setUploading(false);
            }}
          />
          <Button
            isDisabled={isInvalid}
            onClick={handleSaveCharacter}
            variant={"ghost"}
            className="h-8 w-full border-warning hover:!bg-warning/25"
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
          {!!characterId && (
            <Button
              onClick={() => {
                handleClear();
                void router.push(
                  {
                    pathname: "/characters",
                  },
                  undefined,
                  { shallow: true },
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

        <div className="-mx-5 flex flex-1 flex-grow px-1 pb-1 text-center text-xs text-warning">
          {isInvalid && (
            <p className="mx-auto">
              {invalidFields.filter((i) => !!i) && "Введите "}
              {invalidFields.filter((i) => !!i).join(", ")}
              {invalidFields.filter((i) => !!i) && ". "}
              {!!costSum && "Сумма долнений долна быть равна нулю."}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
          <div className="flex flex-col items-center justify-center">
            {uploading ? (
              <LoadingSpinner width={80} height={80} />
            ) : (
              <Image
                className="mt-2 aspect-square h-[160px] w-[160px] rounded-md object-cover"
                alt="char_photo"
                src={!!image ? image : default_char}
                height="320"
                width="320"
              />
            )}
          </div>
          <div className="col-span-1 flex flex-1 flex-col sm:col-span-2">
            <Input
              variant="underlined"
              label="Имя персонажа"
              placeholder="Введите имя персонажа"
              value={name}
              onValueChange={setName}
            />
            <Select
              label="Фракция"
              variant="underlined"
              placeholder="Выберите фракцию"
              selectedKeys={!!factionId ? [factionId.toString()] : []}
              onChange={(e) => {
                if (!!e.target.value) {
                  setFactionId(Number(e.target.value));
                  setClanId(undefined);
                  setAbilityIds([]);
                  setFeatureWithComments(
                    featureWithComments.map((fwc) => {
                      return { id: fwc.id, comment: "", checked: false };
                    }),
                  );
                }
              }}
            >
              {factions
                .filter((f) => f.visibleToPlayer)
                .map((faction) => (
                  <SelectItem
                    key={faction.id}
                    value={faction.id}
                    textValue={faction.name}
                  >
                    <div className="flex flex-col">
                      <div className="text-small dark:text-red-100">
                        {faction.name}
                      </div>
                      <div className="whitespace-normal text-tiny dark:text-red-100">
                        {faction.content}
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
                  setClanId(Number(e.target.value));
                  setCostSum(0);
                  setAbilityIds([]);
                  setFeatureWithComments(
                    featureWithComments.map((fwc) => {
                      return { id: fwc.id, comment: "", checked: false };
                    }),
                  );
                }
              }}
            >
              {clans
                .filter(
                  (c) =>
                    c.visibleToPlayer &&
                    c
                      .ClanInFaction!.map((fa) => fa.factionId)
                      .includes(factionId!),
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
                      <span className="whitespace-normal text-tiny dark:text-red-100">
                        {clan.content}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </Select>
            <Input
              type="number"
              variant="underlined"
              label="Возраст"
              placeholder="Введите возраст"
              value={age ? age.toString() : ""}
              onValueChange={(a) => setAge(Number(a))}
            />
          </div>
          <div className="col-span-2 flex-1 flex-col sm:col-span-3 sm:flex md:col-span-2">
            <Input
              variant="underlined"
              label="Имя игрока"
              placeholder="Введите имя игрока"
              value={playerName}
              onValueChange={setPlayerName}
            />

            <Autocomplete
              label="Способ связи"
              placeholder="Введите способ связи"
              variant="underlined"
              defaultItems={contactSelect}
              allowsCustomValue={true}
              selectedKey={playerContactKey}
              onSelectionChange={(k) =>
                setPlayerContactKey(!!k ? k.toString() : "")
              }
              onInputChange={setPlayerContact}
            >
              {(item) => (
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
            {/* <Input
              variant="underlined"
              label="Контакт игрока"
              placeholder="Введите предпочитаемый способ связи"
              value={playerContact}
              onValueChange={setPlayerContact}
            /> */}
            <Input
              variant="underlined"
              label="Статусы"
              placeholder="Введите статусы через запятую"
              value={status}
              onValueChange={setStatus}
            />
            <Input
              variant="underlined"
              label="Титулы"
              placeholder="Введите титулы через запятую"
              value={title}
              onValueChange={setTitle}
            />
          </div>
        </div>
        <Checkbox
          color="warning"
          size="sm"
          isSelected={visible}
          onValueChange={(e) => setVisible(e)}
        >
          Персонаж виден другим игрокам
        </Checkbox>
        {/* <div className="flex flex-1 flex-col sm:hidden">
          <Input
            type="number"
            variant="underlined"
            label="Возраст"
            placeholder="Введите возраст"
            value={age ? age.toString() : ""}
            onValueChange={(a) => setAge(Number(a))}
          />
          <Input
            variant="underlined"
            label="Статусы"
            placeholder="Введите статусы через запятую"
            value={status}
            onValueChange={setStatus}
          />
          <Input
            variant="underlined"
            label="Титулы"
            placeholder="Введите титулы через запятую"
            value={title}
            onValueChange={setTitle}
          />
        </div> */}
        <div className="flex flex-col gap-2">
          <DefaultEditor
            className="min-h-44 sm:min-h-20"
            onUpdate={setPublicInfo}
            initialContent={initialPublicInfo}
            placeholder="Введите информацию о вашем персонаже, известную другим персонажам в городе"
          />
          {/* <p className="mx-auto -mb-1 flex flex-row text-xs text-warning/50">
            &nbsp;Публичная информация&nbsp;
          </p>
          <Divider className="bg-warning/50" />
          <p className="mx-auto -mt-1 flex flex-row text-xs text-warning/50">
            &nbsp;Тайная информация&nbsp;
          </p> */}
          <div className={"-mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2"}>
            <Input
              variant="underlined"
              label="Сир"
              placeholder="Введите имя сира"
              value={sire}
              onValueChange={setSire}
            />
            <Input
              variant="underlined"
              label="Чайлды"
              placeholder="Введите имена чайлдов через запятую"
              value={childer}
              onValueChange={setChilder}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {/* <DefaultEditor
          label="Амбиции"
          className="min-h-12"
          onUpdate={setAmbition}
          initialContent={initialAmbition}
          placeholder="Введите амбиции и желания вашего персонажа"
        /> */}
          <Textarea
            variant="underlined"
            label="Амбиции и желания"
            placeholder="Введите амбиции и желания вашего персонажа"
            value={ambition}
            onValueChange={setAmbition}
          />
          <DefaultEditor
            label="Квента"
            className="min-h-44 sm:min-h-20"
            onUpdate={setQuenta}
            initialContent={initialQuenta}
            placeholder="Введите предысторию персонажа и прочую информацию для мастерской группы"
          />
        </div>
        <Accordion isCompact>
          <AccordionItem
            className="-mx-2"
            aria-label={"Дисциплины"}
            title={
              "Дисциплины" +
              (!!abilityIds.length ? ` (всего ${abilityIds.length})` : "")
            }
          >
            <CheckboxGroup
              label={
                !!clanId
                  ? `Выберите дисциплины - не больше ${
                      featureWithComments
                        .filter((fwc) => fwc.checked)
                        .map((fwc) => fwc.id)
                        .includes(
                          features.find((f) => f.name === "Способный ученик")!
                            .id,
                        )
                        ? "четырёх"
                        : "трёх"
                    }`
                  : "Сначала выберите клан"
              }
              color="warning"
              value={abilityIds ? abilityIds.map((a) => a.toString()) : []}
              onValueChange={(aids) => {
                const maxDisc = featureWithComments
                  .filter((fwc) => fwc.checked)
                  .map((fwc) => fwc.id)
                  .includes(
                    features.find((f) => f.name === "Способный ученик")!.id,
                  )
                  ? 4
                  : 3;
                if (aids.length <= maxDisc)
                  setAbilityIds(aids.map((aid) => Number(aid)));
              }}
            >
              {abilities
                .filter(
                  (a) =>
                    a
                      .AbilityAvailable!.map((aa) => aa.clanId)
                      .includes(clanId!) &&
                    (a.requirementId
                      ? abilityIds.includes(a.requirementId)
                      : true) &&
                    a.visibleToPlayer,
                )
                .map((ability) => (
                  <Checkbox
                    isDisabled={
                      abilities
                        .filter((a) => abilityIds.includes(a.id))
                        .map((a) => a.requirementId)
                        .includes(Number(ability.id)) ||
                      (abilities
                        .filter((a) => !abilityIds.includes(a.id))
                        .map((a) => a.id)
                        .includes(Number(ability.id)) &&
                        abilityIds.length >
                          (featureWithComments
                            .filter((fwc) => fwc.checked)
                            .map((fwc) => fwc.id)
                            .includes(
                              features.find(
                                (f) => f.name === "Способный ученик",
                              )!.id,
                            )
                            ? 3
                            : 2))
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
                              ? discIcons.find((di) => di.key === ability.icon)
                                  ?.value ?? ""
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
            title={"Дополнения" + (!!costSum ? ` (в сумме ${costSum})` : "")}
          >
            <CheckboxGroup
              label={!!clanId ? "Выберите дополнения" : "Сначала выберите клан"}
              color="warning"
              value={featureWithComments
                .filter((fwc) => fwc.checked)
                .map((fwc) => fwc.id.toString())}
              onValueChange={(fids) => {
                setCostSum(
                  features
                    .filter((f) => fids.includes(f.id.toString()))
                    .reduce((a, b) => a + b.cost, 0),
                );
                setFeatureWithComments(
                  featureWithComments.map((fwc) => {
                    return {
                      ...fwc,
                      checked: fids.includes(fwc.id.toString()),
                    };
                  }),
                );
              }}
            >
              {features
                .filter(
                  (f) =>
                    f
                      .FeatureAvailable!.map((fa) => fa.clanId)
                      .includes(clanId!) && f.visibleToPlayer,
                )
                .map((feature) => (
                  <>
                    <Checkbox
                      key={feature.id}
                      value={feature.id.toString()}
                      isDisabled={
                        feature.name === "Способный ученик" &&
                        abilityIds.length > 3
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
                        {feature.cost > 0 ? `+${feature.cost}` : feature.cost}
                        &nbsp;{feature.name}
                        <p className="whitespace-break-spaces pt-1 text-justify text-xs">
                          {feature.content}
                        </p>
                      </div>
                    </Checkbox>
                    {featureWithComments.find((fwc) => fwc.id === feature.id)
                      ?.checked && (
                      <Input
                        variant="underlined"
                        color="warning"
                        label="Комментарий"
                        placeholder={`Введите комментарий к дополнению "${feature.name}"`}
                        onValueChange={(v) => {
                          setFeatureWithComments(
                            featureWithComments.map((fwc) => {
                              return {
                                id: fwc.id,
                                checked: fwc.checked,
                                comment:
                                  fwc.id === feature.id ? v : fwc.comment,
                              };
                            }),
                          );
                        }}
                        value={
                          featureWithComments.find(
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
  );
}
