import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Autocomplete,
  AutocompleteItem,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { api } from "~/utils/api";
import CharacterCard from "~/components/CharacterCard";
import { LoadingPage } from "~/components/Loading";
import type {
  Character,
  Effect,
  CharacterEffects,
} from "~/server/api/routers/char";
import EffectsPage from "~/components/game/EffectsPage";

export default function ForceEffects() {
  const {
    data: characters,
    isLoading: isCharactersLoading,
    refetch,
  } = api.char.getAll.useQuery();
  const [characterId, setCharacterId] = useState<number>();
  const [char, setChar] = useState<Character>();
  const handleRefetch = () => {
    void refetch();
    setChar(undefined);
    setCharacterId(undefined);
  };
  if (isCharactersLoading) return <LoadingPage />;
  return (
    <div className="container flex h-full flex-col gap-1 rounded-b-lg bg-white/75 p-2 dark:bg-red-950/50 sm:h-full">
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
      {!!char && <ForceEffectsForm char={char} refetch={handleRefetch} />}
      {!!char && (
        <>
          <EffectsPage char={char} auspex={false} />
        </>
      )}
    </div>
  );
}

function ForceEffectsForm({
  char,
  refetch,
}: {
  char: Character;
  refetch: () => void;
}) {
  const {
    isOpen: isApplyModalOpen,
    onOpen: onApplyModalOpen,
    onClose: onApplyModalClose,
  } = useDisclosure();
  const {
    isOpen: isRemoveModalOpen,
    onOpen: onRemoveModalOpen,
    onClose: onRemoveModalClose,
  } = useDisclosure();
  const { mutate: forceEffect, isPending: isForceEffectsPending } =
    api.char.forceEffect.useMutation();
  const { mutate: removeForceEffect, isPending: isRemoveForceEffectsPending } =
    api.char.removeForceEffect.useMutation();
  const { data: effects, isLoading: isEffectsLoading } =
    api.char.getEffects.useQuery();
  const [effect, setEffect] = useState<Effect>();
  const [characterEffect, setCharacterEffect] = useState<CharacterEffects>();

  const handleForceEffect = () => {
    if (!effect?.id) return;
    forceEffect(
      {
        id: char.id,
        effectId: effect.id,
      },
      {
        onSuccess() {
          void refetch();
          onApplyModalClose();
        },
      },
    );
  };

  const handleRemoveForceEffect = () => {
    if (!characterEffect?.id) return;
    removeForceEffect(
      {
        id: characterEffect.id,
      },
      {
        onSuccess() {
          void refetch();
          onRemoveModalClose();
        },
      },
    );
  };

  if (isEffectsLoading) return <LoadingPage />;

  return (
    <>
      <Modal isOpen={isApplyModalOpen} onClose={onApplyModalClose}>
        <ModalContent>
          <ModalHeader>Применить эффект</ModalHeader>
          <ModalBody>
            {!!effects && (
              <Autocomplete
                size="sm"
                variant="bordered"
                placeholder="Выберите эффект"
                aria-label="effects"
                className="w-full rounded-sm"
                selectedKey={effect ? effect.id.toString() : undefined}
                onSelectionChange={(e) => {
                  const effectId = Number(e);
                  setEffect(effects.find((e) => e.id === effectId));
                }}
              >
                {effects.map((e) => (
                  <AutocompleteItem
                    key={e.id.toString()}
                    value={e.id.toString()}
                    textValue={e.name}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-default-900 dark:text-red-100">
                        {e.name}
                      </div>
                      <div className="flex flex-row items-center gap-1 text-sm text-default-900 dark:text-red-100">
                        {e.content}
                      </div>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onApplyModalClose}>
              Отменить
            </Button>
            <Button
              color="success"
              onClick={handleForceEffect}
              isDisabled={isForceEffectsPending}
            >
              Применить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isRemoveModalOpen} onClose={onRemoveModalClose}>
        <ModalContent>
          <ModalHeader>Убрать эффект</ModalHeader>
          <ModalBody>
            {!!char?.effects && (
              <Autocomplete
                size="sm"
                variant="bordered"
                placeholder="Выберите эффект"
                aria-label="effects"
                className="w-full rounded-sm"
                selectedKey={effect ? effect.id.toString() : undefined}
                onSelectionChange={(e) => {
                  const effectId = Number(e);
                  setCharacterEffect(
                    char.effects?.find((e) => e.id === effectId),
                  );
                }}
              >
                {char.effects.map((e) => (
                  <AutocompleteItem
                    key={e.id ? e.id.toString() : ""}
                    value={e.id ? e.id.toString() : ""}
                    textValue={e.effect?.name}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-default-900 dark:text-red-100">
                        {e.effect?.name}
                      </div>
                      <div className="flex flex-row items-center gap-1 text-sm text-default-900 dark:text-red-100">
                        {e.effect?.content}
                      </div>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onRemoveModalClose}>
              Отменить
            </Button>
            <Button
              color="success"
              onClick={handleRemoveForceEffect}
              isDisabled={isRemoveForceEffectsPending}
            >
              Убрать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="flex flex-row justify-between">
        <Button variant="bordered" onClick={onRemoveModalOpen}>
          Убрать эффект
        </Button>
        <Button variant="bordered" onClick={onApplyModalOpen}>
          Применить эффект
        </Button>
      </div>
    </>
  );
}
