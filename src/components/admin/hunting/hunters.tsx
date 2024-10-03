import { api } from "~/utils/api";
import type { Character, Faction, Clan } from "~/server/api/routers/char";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Textarea,
  Input,
  Select,
  SelectItem,
  Divider,
  Tooltip,
} from "@nextui-org/react";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function Hunters() {
  const [selectedKeys, setSelectedKeys] = useState(new Set([""]));
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factionIds, setFactionIds] = useState<number[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [clanIds, setClanIds] = useState<number[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [name, setName] = useState("");
  const {
    data: charactersData,
    isLoading: charactersIsLoading,
    refetch,
  } = api.char.getAll.useQuery();
  const { data: traitsData, isLoading: isTraitsLoading } =
    api.char.getCharTraits.useQuery();

  useEffect(() => {
    if (!!traitsData) {
      setFactions(traitsData.factions);
      setClans(traitsData.clans);
    }
  }, [traitsData]);

  useEffect(() => {
    if (!!charactersData) setCharacters(charactersData);
  }, [charactersData]);

  if (charactersIsLoading || isTraitsLoading) return <LoadingPage />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <Input
          size="sm"
          variant="bordered"
          className="min-w-28 max-w-96"
          aria-label="Имя"
          placeholder="Имя"
          value={name}
          onValueChange={setName}
        />
        <div className="flex w-full min-w-56 flex-col gap-2 sm:flex-row">
          <Select
            size="sm"
            variant="bordered"
            aria-label="Фракция"
            placeholder="Фракция"
            selectionMode="multiple"
            selectedKeys={factionIds.map((f) => f.toString())}
            onChange={(e) => {
              setFactionIds(
                !!e.target.value
                  ? e.target.value.split(",").map((s) => Number(s))
                  : [],
              );
            }}
          >
            {factions.map((faction) => (
              <SelectItem
                key={faction.id}
                value={faction.id}
                textValue={faction.name}
              >
                {faction.name}
              </SelectItem>
            ))}
          </Select>
          <Select
            size="sm"
            variant="bordered"
            placeholder="Клан"
            aria-label="Клан"
            selectionMode="multiple"
            selectedKeys={clanIds.map((f) => f.toString())}
            onChange={(e) => {
              setClanIds(
                !!e.target.value
                  ? e.target.value.split(",").map((s) => Number(s))
                  : [],
              );
            }}
          >
            {clans.map((clan) => (
              <SelectItem key={clan.id} value={clan.id} textValue={clan.name}>
                {clan.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <Accordion
        selectedKeys={selectedKeys}
        onSelectionChange={(e) => setSelectedKeys(e as Set<string>)}
      >
        {characters
          .sort((a, b) => b.id - a.id)
          .filter((c) =>
            !!factionIds.length ? factionIds.includes(c.factionId) : true,
          )
          .filter((c) => (!!clanIds.length ? clanIds.includes(c.clanId) : true))
          .filter((c) =>
            !!name ? c.name.toLowerCase().includes(name.toLowerCase()) : true,
          )
          .map((char) => (
            <AccordionItem
              key={char.id}
              aria-label={char.name}
              title={char.name}
              startContent={
                <Avatar
                  isBordered
                  color="danger"
                  radius="lg"
                  src={char.image ?? "/default_char.png"}
                />
              }
              subtitle={
                <div className="iems-center flex flex-col gap-2 md:flex-row">
                  <div className="flex flex-row items-center gap-1">
                    Предпочтение в охоте:
                    {!!char.hunt_req ? <FaCheck /> : <FaTimes />}
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    Прорицание:
                    {!!char.auspexData ? <FaCheck /> : <FaTimes />}
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    Анимализм:
                    {!!char.animalismData ? <FaCheck /> : <FaTimes />}
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    Хакерство:
                    {!!char.hackerData ? <FaCheck /> : <FaTimes />}
                  </div>
                </div>
              }
            >
              {selectedKeys.has(char.id.toString()) && (
                <HunterForm char={char} refetch={refetch} />
              )}
            </AccordionItem>
          ))}
      </Accordion>
    </div>
  );
}

const HunterForm = ({
  char,
  refetch,
}: {
  char: Character;
  refetch: () => void;
}) => {
  const [taboo, setTaboo] = useState("");
  const [hackerData, setHackerData] = useState("");
  const [auspexData, setAuspexData] = useState("");
  const [requirement, setRequirement] = useState("");
  const [animalismData, setAnimalismData] = useState("");

  const { mutate: saveChar, isPending: isSavePending } =
    api.char.updateData.useMutation();

  const handleSave = () => {
    saveChar(
      {
        id: char.id,
        auspexData: auspexData,
        animalismData: animalismData,
        hackerData: hackerData,
        huntReq: requirement,
        taboo: taboo,
      },
      {
        onSuccess() {
          refetch();
        },
      },
    );
  };

  useEffect(() => {
    if (!!char.auspexData) setAuspexData(char.auspexData);
    if (!!char.animalismData) setAnimalismData(char.animalismData);
    if (!!char.hackerData) setHackerData(char.hackerData);
    if (!!char.hunt_req) setRequirement(char.hunt_req);
    if (!!char.taboo) setTaboo(char.taboo);
  }, [char]);

  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          label="Требование к охоте"
          placeholder="Введите требование к охоте"
          value={requirement}
          onValueChange={setRequirement}
        />
        <Input
          label="Запрет на охоту"
          placeholder="Введите запрет на охоту"
          value={taboo}
          onValueChange={setTaboo}
        />
      </div>
      <div className="flex flex-row flex-wrap text-justify text-sm">
        <Tooltip content={char.clan?.content}>
          <p>{char.clan?.name}&nbsp;-&nbsp;</p>
        </Tooltip>
        {char.features?.map((f, i) => (
          <Tooltip
            key={char.id + "_feature_" + f.id}
            content={f.feature?.content}
          >
            <p>
              {f.feature?.name}
              {(char.features?.length ?? 0) !== i + 1 ? <>,&nbsp;</> : ""}
            </p>
          </Tooltip>
        ))}
      </div>
      <Divider />
      <div
        className="flex flex-col text-justify text-sm"
        dangerouslySetInnerHTML={{ __html: char.publicInfo ?? "" }}
      />
      <Divider />
      <div
        className="flex flex-col text-justify text-sm"
        dangerouslySetInnerHTML={{ __html: char.content ?? "" }}
      />
      <Textarea
        label="Данные при прорицании"
        placeholder="Введите данные при прорицании"
        value={auspexData}
        onValueChange={setAuspexData}
      />
      <Textarea
        label="Данные при анимализме"
        placeholder="Введите данные при анимализме"
        value={animalismData}
        onValueChange={setAnimalismData}
      />
      <Textarea
        label="Данные при хакерстве"
        placeholder="Введите данные при хакерстве"
        value={hackerData}
        onValueChange={setHackerData}
      />
      <Button
        variant="bordered"
        color="success"
        onClick={handleSave}
        isDisabled={isSavePending}
      >
        {isSavePending ? <LoadingSpinner height={24} /> : "Сохранить"}
      </Button>
    </div>
  );
};
