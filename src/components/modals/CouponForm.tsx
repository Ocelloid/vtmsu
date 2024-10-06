/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { FaBoxes } from "react-icons/fa";
import { LoadingSpinner } from "~/components/Loading";
import { type ReactNode, useState, useEffect } from "react";
import type {
  Feature,
  Ability,
  Ritual,
  Knowledge,
  Effect,
} from "~/server/api/routers/char";
import type { BankAccount, Company } from "~/server/api/routers/econ";
import type { ItemType, Item } from "~/server/api/routers/item";

const CouponForm = ({
  editId,
  children,
  onRefetch,
}: {
  editId?: string;
  children?: ReactNode;
  onRefetch?: () => void;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [address, setAddress] = useState("");
  const [usage, setUsage] = useState(0);

  const [featureIds, setFeatureIds] = useState<number[]>([]);
  const [abilityIds, setAbilityIds] = useState<number[]>([]);
  const [ritualIds, setRitualIds] = useState<number[]>([]);
  const [knowledgeIds, setKnowledgeIds] = useState<number[]>([]);
  const [effectIds, setEffectIds] = useState<number[]>([]);
  const [bankAccountIds, setBankAccountIds] = useState<number[]>([]);
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [itemTypeIds, setItemTypeIds] = useState<number[]>([]);
  const [itemIds, setItemIds] = useState<number[]>([]);

  const { mutate: createMutation, isPending } =
    api.util.createCoupon.useMutation();
  const { mutate: updateMutation, isPending: isPendingUpdate } =
    api.util.updateCoupon.useMutation();

  const { data: featuresData, isLoading: isFeaturesLoading } =
    api.char.getFeatures.useQuery(undefined, { enabled: isOpen });
  const { data: abilityData, isLoading: isAbilitiesLoading } =
    api.char.getAbilities.useQuery(undefined, { enabled: isOpen });
  const { data: itemTypesData, isLoading: isItemTypesLoading } =
    api.item.getAllTypes.useQuery(undefined, { enabled: isOpen });
  const { data: itemsData, isLoading: isItemsLoading } =
    api.item.getAll.useQuery(undefined, { enabled: isOpen });
  const { data: companiesData, isLoading: isCompaniesLoading } =
    api.econ.getAll.useQuery(undefined, { enabled: isOpen });
  const { data: bankAccountsData, isLoading: isBankAccountsLoading } =
    api.econ.getBankAccounts.useQuery(undefined, { enabled: isOpen });
  const { data: ritualsData, isLoading: isRitualsLoading } =
    api.char.getRituals.useQuery(undefined, { enabled: isOpen });
  const { data: knowledgesData, isLoading: isKnowledgesLoading } =
    api.char.getKnowledges.useQuery(undefined, { enabled: isOpen });
  const { data: effectsData, isLoading: isEffectsLoading } =
    api.char.getEffects.useQuery(undefined, { enabled: isOpen });
  const { data: couponData, isLoading: isCouponLoading } =
    api.util.getCouponById.useQuery(
      {
        id: editId!,
      },
      { enabled: !!editId && isOpen },
    );

  useEffect(() => {
    if (!!couponData) {
      setName(couponData?.name ?? "");
      setContent(couponData?.content ?? "");
      setAddress(couponData?.address ?? "");
      setUsage(couponData?.usage ?? 0);
      setFeatureIds(couponData?.CouponFeature.map((a) => a.featureId) ?? []);
      setAbilityIds(couponData?.CouponAbility.map((a) => a.abilityId) ?? []);
      setRitualIds(couponData?.CouponRitual.map((a) => a.ritualId) ?? []);
      setKnowledgeIds(
        couponData?.CouponKnowledge.map((a) => a.knowledgeId) ?? [],
      );
      setEffectIds(couponData?.CouponEffect.map((a) => a.effectId) ?? []);
      setBankAccountIds(
        couponData?.CouponBankAccount.map((a) => a.bankAccountId) ?? [],
      );
      setCompanyIds(couponData?.CouponCompany.map((a) => a.companyId) ?? []);
      setItemTypeIds(couponData?.CouponItemType.map((a) => a.itemTypeId) ?? []);
      setItemIds(couponData?.CouponItem.map((a) => a.itemId) ?? []);
    }
  }, [couponData]);

  const resetForm = () => {
    setName("");
    setContent("");
    setAddress("");
    setUsage(0);
    setFeatureIds([]);
    setAbilityIds([]);
    setRitualIds([]);
    setKnowledgeIds([]);
    setEffectIds([]);
    setBankAccountIds([]);
    setCompanyIds([]);
    setItemTypeIds([]);
    setItemIds([]);
  };

  useEffect(() => {
    if (!!couponData) {
      return;
    }
  }, [couponData]);

  useEffect(() => {
    if (!!featuresData) {
      setFeatures(featuresData);
    }
  }, [featuresData]);

  useEffect(() => {
    if (!!abilityData) {
      setAbilities(abilityData);
    }
  }, [abilityData]);

  useEffect(() => {
    if (!!itemTypesData) {
      setItemTypes(itemTypesData);
    }
  }, [itemTypesData]);

  useEffect(() => {
    if (!!itemsData) {
      setItems(itemsData);
    }
  }, [itemsData]);

  useEffect(() => {
    if (!!companiesData) {
      setCompanies(companiesData);
    }
  }, [companiesData]);

  useEffect(() => {
    if (!!bankAccountsData) {
      setBankAccounts(bankAccountsData);
    }
  }, [bankAccountsData]);

  useEffect(() => {
    if (!!ritualsData) {
      setRituals(ritualsData);
    }
  }, [ritualsData]);

  useEffect(() => {
    if (!!knowledgesData) {
      setKnowledges(knowledgesData);
    }
  }, [knowledgesData]);

  useEffect(() => {
    if (!!effectsData) {
      setEffects(effectsData);
    }
  }, [effectsData]);

  const handleFormSubmit = () => {
    if (!editId)
      createMutation(
        {
          name,
          content,
          address,
          usage,
          featureIds,
          abilityIds,
          ritualIds,
          knowledgeIds,
          effectIds,
          bankAccountIds,
          companyIds,
          itemTypeIds,
          itemIds,
        },
        {
          onSuccess() {
            resetForm();
            if (onRefetch) onRefetch();
            onClose();
          },
        },
      );
    else
      updateMutation(
        {
          id: editId,
          name,
          content,
          address,
          usage,
          featureIds,
          abilityIds,
          ritualIds,
          knowledgeIds,
          effectIds,
          bankAccountIds,
          companyIds,
          itemTypeIds,
          itemIds,
        },
        {
          onSuccess() {
            resetForm();
            if (onRefetch) onRefetch();
            onClose();
          },
        },
      );
  };

  if (
    isAbilitiesLoading ||
    isItemTypesLoading ||
    isItemsLoading ||
    isCompaniesLoading ||
    isBankAccountsLoading ||
    isRitualsLoading ||
    isKnowledgesLoading ||
    isEffectsLoading ||
    isCouponLoading ||
    isFeaturesLoading
  )
    return <LoadingSpinner width={24} height={24} />;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        size="full"
        placement="top-center"
        backdrop="blur"
        classNames={{
          wrapper: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100 mt-24",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {!!editId ? "Редактирование купона" : "Добавить купон"}
          </ModalHeader>
          <ModalBody>
            <Input
              size="sm"
              variant="underlined"
              label="Название"
              placeholder="Введите название"
              value={name}
              onValueChange={setName}
            />
            <Textarea
              label="Контент"
              variant="underlined"
              className="min-h-44 sm:min-h-20"
              value={content}
              onValueChange={setContent}
              placeholder="Введите описание"
            />
            <div className="flex flex-row gap-2">
              <Input
                size="sm"
                variant="underlined"
                label="Адрес"
                value={address.toString()}
                onValueChange={(v) => setAddress(v)}
              />
              <Input
                size="sm"
                type="number"
                variant="underlined"
                label="Количество использований"
                value={usage.toString()}
                onValueChange={(v) => setUsage(Number(v))}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Select
                size="sm"
                variant="bordered"
                placeholder="Дополнения"
                aria-label="Дополнения"
                selectionMode="multiple"
                selectedKeys={featureIds.map((f) => f.toString())}
                onChange={(e) => {
                  setFeatureIds(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {features.map((feature) => (
                  <SelectItem
                    key={feature.id}
                    value={feature.id}
                    textValue={feature.name}
                  >
                    {feature.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                variant="bordered"
                placeholder="Способности"
                aria-label="Способности"
                selectionMode="multiple"
                selectedKeys={abilityIds.map((f) => f.toString())}
                onChange={(e) => {
                  setAbilityIds(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {abilities.map((ability) => (
                  <SelectItem
                    key={ability.id}
                    value={ability.id}
                    textValue={ability.name}
                  >
                    {ability.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex flex-row gap-2">
              <Select
                size="sm"
                variant="bordered"
                placeholder="Знания"
                aria-label="Знания"
                selectionMode="multiple"
                selectedKeys={knowledgeIds.map((f) => f.toString())}
                onChange={(e) => {
                  setKnowledgeIds(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {knowledges.map((knowledge) => (
                  <SelectItem
                    key={knowledge.id}
                    value={knowledge.id}
                    textValue={knowledge.name}
                  >
                    {knowledge.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                variant="bordered"
                placeholder="Ритуалы"
                aria-label="Ритуалы"
                selectionMode="multiple"
                selectedKeys={ritualIds.map((f) => f.toString())}
                onChange={(e) => {
                  setRitualIds(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {rituals.map((ritual) => (
                  <SelectItem
                    key={ritual.id}
                    value={ritual.id}
                    textValue={ritual.name}
                  >
                    {ritual.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Select
              size="sm"
              variant="bordered"
              placeholder="Эффекты"
              aria-label="Эффекты"
              selectionMode="multiple"
              selectedKeys={effectIds.map((f) => f.toString())}
              onChange={(e) => {
                setEffectIds(
                  !!e.target.value
                    ? e.target.value.split(",").map((s) => Number(s))
                    : [],
                );
              }}
            >
              {effects.map((effect) => (
                <SelectItem
                  key={effect.id}
                  value={effect.id.toString()}
                  textValue={effect.name}
                >
                  {effect.name}
                </SelectItem>
              ))}
            </Select>
            <div className="flex flex-row gap-2">
              <Select
                size="sm"
                variant="bordered"
                placeholder="Счета"
                aria-label="Счета"
                selectionMode="multiple"
                selectedKeys={bankAccountIds.map((f) => f.toString())}
                onChange={(e) => {
                  setBankAccountIds(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {bankAccounts.map((bankAccount) => (
                  <SelectItem
                    key={bankAccount.id}
                    value={bankAccount.id}
                    textValue={bankAccount.address}
                  >
                    {bankAccount.address}
                  </SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                variant="bordered"
                placeholder="Предприятия"
                aria-label="Предприятия"
                selectionMode="multiple"
                selectedKeys={companyIds.map((f) => f.toString())}
                onChange={(e) => {
                  setCompanyIds(
                    !!e.target.value ? e.target.value.split(",") : [],
                  );
                }}
              >
                {companies.map((company) => (
                  <SelectItem
                    key={company.id}
                    value={company.id}
                    textValue={company.name}
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex flex-row gap-2">
              <Select
                size="sm"
                variant="bordered"
                placeholder="Новые предметы"
                aria-label="Новые преметы"
                selectionMode="multiple"
                selectedKeys={itemTypeIds.map((f) => f.toString())}
                onChange={(e) => {
                  setItemTypeIds(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {itemTypes.map((itemType) => (
                  <SelectItem
                    key={itemType.id!}
                    value={itemType.id}
                    textValue={itemType.name}
                  >
                    {itemType.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                size="sm"
                variant="bordered"
                placeholder="Существующие предметы"
                aria-label="Существующие предметы"
                selectionMode="multiple"
                selectedKeys={itemIds.map((f) => f.toString())}
                onChange={(e) => {
                  setItemIds(
                    !!e.target.value
                      ? e.target.value.split(",").map((s) => Number(s))
                      : [],
                  );
                }}
              >
                {items.map((item) => (
                  <SelectItem
                    key={item.id!}
                    value={item.id}
                    textValue={item.name}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="mr-auto"
            >
              Отменить
            </Button>
            <Button
              variant="solid"
              color="success"
              isDisabled={isPending || isPendingUpdate || !name || !content}
              onClick={handleFormSubmit}
            >
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        onClick={onOpen}
        variant="light"
        size="sm"
        className="flex min-w-10 flex-row gap-0 bg-transparent text-black dark:text-red-100"
      >
        {children ? (
          children
        ) : (
          <>
            <FaBoxes size={24} />
            &nbsp;Добавить купон
          </>
        )}
      </Button>
    </>
  );
};

export default CouponForm;
