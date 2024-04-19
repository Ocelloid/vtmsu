import {
  Input,
  Select,
  SelectItem,
  Divider,
  Checkbox,
  Button,
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
import {
  FaRegSave,
  FaTrashAlt,
  FaImage,
  FaArrowDown,
  FaFile,
} from "react-icons/fa";
import default_char from "~/../public/default_char.png";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

export default function CharacterEditor({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [characterId, setCharacterId] = useState<number>();
  const [factionId, setFactionId] = useState<number>();
  const [clanId, setClanId] = useState<number>();
  const [abilityIds, setAbilityIds] = useState<Set<string>>(new Set());
  const [featureIds, setFeatureIds] = useState<Set<string>>(new Set());
  const [age, setAge] = useState<number>(0);
  const [image, setImage] = useState<string>("");
  const [sire, setSire] = useState<string>("");
  const [childer, setChilder] = useState<string>("");
  const [publicInfo, setPublicInfo] = useState<string>("");
  const [initialPublicInfo, setInitialPublicInfo] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [ambition, setAmbition] = useState<string>("");
  const [initialAmbition, setInitialAmbition] = useState<string>("");
  const [quenta, setQuenta] = useState<string>("");
  const [initialQuenta, setInitialQuenta] = useState<string>("");
  const [factions, setFactions] = useState<Faction[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);

  const { data: characterData, isLoading: isCharacterLoading } =
    api.char.getById.useQuery({ id: characterId! }, { enabled: !!characterId });

  const { data: traitsData, isLoading: isTraitsLoading } =
    api.char.getCharTraits.useQuery();

  const { mutate: createMutation, isPending: isCharacterCreatePending } =
    api.char.create.useMutation();

  const { mutate: updateMutation, isPending: isCharacterUpdatePending } =
    api.char.update.useMutation();

  useEffect(() => {
    if (!!traitsData) {
      setFactions(traitsData.factions);
      setClans(traitsData.clans);
      setAbilities(traitsData.abilities);
      setFeatures(traitsData.features);
    }
  }, [traitsData]);

  useEffect(() => {
    if (!!characterData) {
      setName(characterData.name);
      setFactionId(characterData.factionId);
      setClanId(characterData.clanId);
      setAbilityIds(
        new Set(characterData.abilities.map((a) => a.id.toString())),
      );
      setFeatureIds(
        new Set(characterData.features.map((f) => f.id.toString())),
      );
      setAge(Number(characterData.age));
      setImage(characterData.image ?? "");
      setSire(characterData.sire ?? "");
      setChilder(characterData.childer ?? "");
      setInitialPublicInfo(characterData.publicInfo ?? "");
      setPublicInfo(characterData.publicInfo ?? "");
      setVisible(characterData.visible);
      setInitialAmbition(characterData.ambition ?? "");
      setAmbition(characterData.ambition ?? "");
      setInitialQuenta(characterData.content ?? "");
      setQuenta(characterData.content ?? "");
    }
  }, [characterData]);

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
          age: age.toString(),
          sire: sire,
          childer: childer,
          ambition: ambition,
          publicInfo: publicInfo,
          content: quenta,
          abilities: [...abilityIds].map((a) => Number(a)),
          features: [...featureIds].map((a) => Number(a)),
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
          age: age.toString(),
          sire: sire,
          childer: childer,
          ambition: ambition,
          publicInfo: publicInfo,
          content: quenta,
          abilities: [...abilityIds].map((a) => Number(a)),
          features: [...featureIds].map((a) => Number(a)),
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
    setAbilityIds(new Set([]));
    setFeatureIds(new Set([]));
    setAge(0);
    setImage("");
    setSire("");
    setChilder("");
    setInitialPublicInfo("");
    setVisible(false);
    setInitialAmbition("");
    setInitialQuenta("");
  };

  const handleDeleteCharacter = () => {
    return;
  };

  if (
    isTraitsLoading ||
    isCharacterCreatePending ||
    isCharacterUpdatePending ||
    isCharacterLoading
  )
    return <LoadingPage />;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-2">
      <div className="flex flex-row gap-2">
        <UploadButton
          content={{
            button: (
              <>
                <FaImage size={16} />
                <p className="hidden sm:flex">Изображение</p>
              </>
            ),
            allowedContent: "Изображение (1 Мб)",
          }}
          className="h-8 w-full cursor-pointer text-white [&>div]:hidden [&>label]:w-full [&>label]:min-w-[84px] [&>label]:flex-1 [&>label]:gap-2 [&>label]:rounded-medium [&>label]:border-2 [&>label]:border-white [&>label]:bg-transparent [&>label]:pl-4 [&>label]:pr-2 [&>label]:focus-within:ring-0 [&>label]:hover:bg-white/25"
          endpoint="imageUploader"
          onClientUploadComplete={(res) => setImage(res[0]?.url ?? "")}
        />
        <Button
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
      <div className="flex flex-row gap-2 sm:gap-4">
        <div className="flex flex-col">
          <Image
            className="mt-2 aspect-square h-[160px] w-[160px] rounded-md object-cover"
            alt="char_photo"
            src={!!image ? image : default_char}
            height="320"
            width="320"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <Input
            variant="underlined"
            label="Имя"
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
                    <div className="text-small">{faction.name}</div>
                    <div className="whitespace-normal text-tiny text-default-400">
                      {faction.content}
                    </div>
                  </div>
                </SelectItem>
              ))}
          </Select>
          <Select
            label="Клан"
            variant="underlined"
            placeholder="Выберите клан"
            selectedKeys={!!clanId ? [clanId.toString()] : []}
            onChange={(e) => {
              if (!!e.target.value) {
                setClanId(Number(e.target.value));
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
                <SelectItem key={clan.id} value={clan.id} textValue={clan.name}>
                  <div className="flex flex-col gap-1">
                    <span className="text-small">{clan.name}</span>
                    <span className="whitespace-normal text-tiny text-default-400">
                      {clan.content}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </Select>
        </div>
        <div className="hidden flex-1 flex-col sm:flex">
          <Input
            type="number"
            variant="underlined"
            label="Возраст"
            placeholder="Возраст"
            value={age.toString()}
            onValueChange={(a) => setAge(Number(a))}
          />
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
            placeholder="Введите имена чайлдов"
            value={childer}
            onValueChange={setChilder}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col sm:hidden">
        <Input
          type="number"
          variant="underlined"
          label="Возраст"
          placeholder="Возраст"
          value={age.toString()}
          onValueChange={(a) => setAge(Number(a))}
        />
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
          placeholder="Введите имена чайлдов"
          value={childer}
          onValueChange={setChilder}
        />
      </div>
      <DefaultEditor
        label="Публичная информация"
        className="min-h-20"
        onUpdate={setPublicInfo}
        initialContent={initialPublicInfo}
        placeholder="Введите информацию о вашем персонаже, известную другим персонажам в городе"
      />
      <Checkbox
        color="warning"
        isSelected={visible}
        onValueChange={(e) => setVisible(e)}
      >
        Персонажа видно другим игрокам
      </Checkbox>
      <Divider className="bg-red-500/50" />
      <p className="mx-auto -mt-1 flex flex-row text-xs text-red-500/50">
        <FaArrowDown />
        &nbsp;Тайная информация&nbsp;
        <FaArrowDown />
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Дисциплины"
          variant="underlined"
          placeholder="Выберите дисциплины"
          selectionMode="multiple"
          selectedKeys={abilityIds}
          onChange={(e) => setAbilityIds(new Set(e.target.value.split(",")))}
        >
          {abilities
            .filter((a) =>
              a.AbilityAvailable!.map((aa) => aa.clanId).includes(clanId!),
            )
            .map((ability) => (
              <SelectItem
                key={ability.id}
                value={ability.id}
                textValue={ability.name}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-small">{ability.name}</span>
                  <span className="whitespace-normal text-tiny text-default-400">
                    {ability.content}
                  </span>
                </div>
              </SelectItem>
            ))}
        </Select>
        <Select
          label="Дополнения"
          variant="underlined"
          placeholder="Выберите дополнения"
          selectionMode="multiple"
          selectedKeys={featureIds}
          onChange={(e) => setFeatureIds(new Set(e.target.value.split(",")))}
        >
          {features
            .filter((a) =>
              a.FeatureAvailable!.map((fa) => fa.clanId).includes(clanId!),
            )
            .map((feature) => (
              <SelectItem
                key={feature.id}
                value={feature.id}
                textValue={feature.name}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-small">
                    {feature.cost}&nbsp;{feature.name}
                  </span>
                  <span className="whitespace-normal text-tiny text-default-400">
                    {feature.content}
                  </span>
                </div>
              </SelectItem>
            ))}
        </Select>
      </div>
      <DefaultEditor
        label="Амбиции"
        className="min-h-20"
        onUpdate={setAmbition}
        initialContent={initialAmbition}
        placeholder="Введите амбиции и желания вашего персонажа"
      />
      <DefaultEditor
        label="Квента"
        className="min-h-20"
        onUpdate={setQuenta}
        initialContent={initialQuenta}
        placeholder="Введите предысторию персонажа и прочую информацию для мастерской группы"
      />
    </div>
  );
}
