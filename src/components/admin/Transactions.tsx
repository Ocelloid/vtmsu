import {
  Input,
  Autocomplete,
  AutocompleteItem,
  Button,
} from "@nextui-org/react";
import CharacterCard from "~/components/CharacterCard";
import type { Transaction } from "~/server/api/routers/econ";
import type { Character } from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

type imporvedTransactions = Transaction & {
  characterFrom?: Character;
  characterTo?: Character;
};

export default function Transactions() {
  const [accountFromAddress, setAccountFromAddress] = useState<string>("");
  const [accountToAddress, setAccountToAddress] = useState<string>("25908998");
  const [selectedFromCharacter, setSelectedFromCharacter] = useState<number>();
  const [selectedToCharacter, setSelectedToCharacter] = useState<number>();
  const [transactions, setTransactions] = useState<imporvedTransactions[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);

  const { data: charactersData, isLoading: charactersLoading } =
    api.char.getAll.useQuery();

  const { data: transactionsData, isLoading: transactionsLoading } =
    api.econ.getAllTransactions.useQuery(
      {
        accountFromAddress,
        accountToAddress,
        characterFromId: selectedFromCharacter,
        characterToId: selectedToCharacter,
      },
      {
        refetchInterval: 60000,
      },
    );

  useEffect(() => {
    if (!!transactionsData) setTransactions(transactionsData);
  }, [transactionsData]);

  useEffect(() => {
    if (!!charactersData) setCharacters(charactersData);
  }, [charactersData]);

  return (
    <div className="container flex max-h-[calc(100svh-240px)] flex-col gap-1 rounded-b-lg bg-white/75 p-2 dark:bg-red-950/50 sm:h-full">
      <div className="flex flex-col items-center gap-1 sm:flex-row">
        <Input
          size="sm"
          isClearable={true}
          variant="bordered"
          className="w-full"
          placeholder="Со счёта"
          value={accountFromAddress}
          onValueChange={setAccountFromAddress}
        />
        <Input
          size="sm"
          isClearable={true}
          variant="bordered"
          className="w-full"
          placeholder="На счёт"
          value={accountToAddress}
          onValueChange={setAccountToAddress}
        />
        <Autocomplete
          size="sm"
          variant="bordered"
          placeholder="От персонажа"
          aria-label="characters"
          className="w-full rounded-sm"
          selectedKey={
            selectedFromCharacter ? selectedFromCharacter.toString() : undefined
          }
          onSelectionChange={(e) => {
            const charId = Number(e);
            setSelectedFromCharacter(charId);
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
        <Autocomplete
          size="sm"
          variant="bordered"
          placeholder="К персонажу"
          aria-label="characters"
          className="w-full rounded-sm"
          selectedKey={
            selectedToCharacter ? selectedToCharacter.toString() : undefined
          }
          onSelectionChange={(e) => {
            const charId = Number(e);
            setSelectedToCharacter(charId);
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
      </div>

      {charactersLoading || transactionsLoading ? (
        <LoadingPage />
      ) : (
        <div className="flex max-h-[70svh] flex-col gap-1 overflow-y-auto sm:max-h-[80svh]">
          {transactions.map((t) => (
            <>
              <div
                key={t.id}
                className="grid grid-cols-5 items-center justify-between gap-1 border-b-2 border-divider py-2 md:grid-cols-7"
              >
                <div className="col-span-2 flex flex-col gap-1 md:col-span-3">
                  <div className="flex flex-row items-center gap-1">
                    <div className="flex flex-col">
                      <div className="text-sm font-bold">
                        {t.characterFrom?.name ?? "Неизвестный персонаж"}
                      </div>
                      <Button
                        size="sm"
                        variant="light"
                        className="w-min justify-start text-start text-xs text-gray-500"
                        onClick={() =>
                          navigator.clipboard.writeText(t.accountFromAddress)
                        }
                      >
                        {t.accountFromAddress}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex flex-col gap-1 md:col-span-3">
                  <div className="flex flex-row items-center gap-1">
                    <div className="flex flex-col">
                      <div className="text-sm font-bold">
                        {t.characterTo?.name ?? "Неизвестный персонаж"}
                      </div>
                      <Button
                        size="sm"
                        variant="light"
                        className="w-min justify-start text-start text-xs text-gray-500"
                        onClick={() =>
                          navigator.clipboard.writeText(t.accountToAddress)
                        }
                      >
                        {t.accountToAddress}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 -mb-4 text-sm md:text-3xl">
                  {t.amount}
                </div>
                <p className="col-span-5 pl-3 text-xs text-gray-500">
                  {t.createdAt.toLocaleString()}
                </p>
              </div>
            </>
          ))}
        </div>
      )}
    </div>
  );
}
