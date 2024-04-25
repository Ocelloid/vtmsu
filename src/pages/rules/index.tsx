import { Tab, Tabs, Button, Tooltip } from "@nextui-org/react";
import Head from "next/head";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import RuleEditor from "~/components/editors/RuleEditor";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { type Rule } from "~/server/api/routers/rule";
import { type Ability } from "~/server/api/routers/char";
import { Element, scroller } from "react-scroll";
import { FaPencilAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { translit } from "~/utils/text";

export default function Rules() {
  const categories = [
    { value: 1, label: "Общие" },
    { value: 2, label: "Дисциплины" },
    { value: 3, label: "Ритуалы" },
  ];
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [rules, setRules] = useState<Rule[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);

  const { data: isPersonnel, isLoading: isUserLoading } =
    api.user.userIsPersonnel.useQuery();

  const { mutate: changeOrder, isPending: isOrderLoading } =
    api.rule.changeOrder.useMutation();

  const {
    data: rulesData,
    isLoading: isRulesLoading,
    refetch,
  } = api.rule.getAll.useQuery();
  const { data: abilityData, isLoading: isAbilityLoading } =
    api.char.getAbilities.useQuery();

  useEffect(() => {
    setRules(rulesData ?? []);
    setAbilities(abilityData ?? []);

    const ruleTo = Array.isArray(router.query.rule)
      ? router.query.rule[0] ?? ""
      : router.query.rule ?? "";
    const catTo = Array.isArray(router.query.category)
      ? router.query.category[0] ?? ""
      : router.query.category ?? "";

    setCategory(catTo);

    if (catTo !== "editor")
      setTimeout(() => {
        scroller.scrollTo(ruleTo, {
          duration: 1500,
          delay: 100,
          smooth: true,
          offset: -96,
        });
      }, 200);
  }, [rulesData, abilityData, router.query]);

  const handleCategoryChange = (e: string) => {
    setCategory(e);
    void router.push(
      {
        pathname: "/rules",
        query: { category: e },
      },
      undefined,
      { shallow: false },
    );
  };

  const handleRuleOrderChange = (rule: Rule, order: string) => {
    changeOrder(
      { id: rule.id, order: order },
      {
        onSuccess: (data) => {
          refetch()
            .then(() => {
              setTimeout(() => {
                handleRuleFind(data!);
              }, 200);
            })
            .catch((e) => console.log(e));
        },
      },
    );
  };

  const handleRuleEdit = (rule: Rule) => {
    setCategory("editor");
    void router.push(
      {
        pathname: "/rules",
        query: { category: "editor", ruleId: rule.id },
      },
      undefined,
      { shallow: false },
    );
  };

  const handleRuleCopy = (linkTo: string) => {
    void navigator.clipboard.writeText(
      document.location.origin +
        router.pathname +
        "?category=" +
        category +
        "&rule=" +
        linkTo,
    );
    void router.push(
      {
        pathname: "/rules",
        query: { category: category, rule: linkTo },
      },
      undefined,
      { shallow: false },
    );
  };

  const handleRuleFind = (rule?: Rule) => {
    refetch()
      .then(() => {
        if (rule) {
          setCategory(rule.categoryId.toString());
          void router.push(
            {
              pathname: "/rules",
              query: {
                category: rule.categoryId,
                rule: rule.link,
              },
            },
            undefined,
            { shallow: false },
          );
        } else {
          setCategory("1");
          void router.push(
            {
              pathname: "/rules",
              query: {
                category: "1",
              },
            },
            undefined,
            { shallow: false },
          );
        }
      })
      .catch((e) => console.log(e));
  };

  if (isUserLoading || isRulesLoading || isAbilityLoading)
    return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Правила</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-1 flex-col">
        <div className="container mt-20 flex flex-1 flex-col">
          <Tabs
            selectedKey={category}
            onSelectionChange={(e) => handleCategoryChange(e.toString())}
            aria-label="tabs"
            variant="underlined"
            classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#dc2626]",
              tab: "first:ml-auto max-w-fit px-0 h-12 last:mr-auto md:last:mr-0",
              panel: "bg-white/75 dark:bg-red-950/50 px-2 mb-2 rounded-b-lg",
            }}
          >
            {categories.map((cat) => (
              <Tab
                key={cat.value}
                title={
                  <div className="flex items-center space-x-2">
                    <span>{cat.label}</span>
                  </div>
                }
              >
                {rules
                  .filter((x) => x.categoryId === cat.value)
                  .sort((a, b) => a.orderedAs - b.orderedAs)
                  .map((rule, i, arr) => {
                    const isFirst = arr[0]!.orderedAs === rule.orderedAs;
                    const isLast =
                      arr[arr.length - 1]!.orderedAs === rule.orderedAs;
                    return (
                      <Element
                        key={rule.id}
                        className="section"
                        name={rule.link}
                      >
                        <div className="flex flex-row">
                          <Tooltip
                            className="rounded-md text-tiny text-default-500"
                            content={"Скопировать ссылку"}
                            placement="top"
                          >
                            <h2
                              className={`cursor-pointer pb-2 ${rule.content === "<p> </p>" ? "text-4xl" : "text-2xl"}`}
                              onClick={() => handleRuleCopy(rule.link)}
                            >
                              {rule.name}
                            </h2>
                          </Tooltip>
                          {isPersonnel && (
                            <div className="ml-auto flex flex-row gap-2">
                              <Button
                                isDisabled={isOrderLoading || isFirst}
                                variant="light"
                                color="warning"
                                className="h-8 w-8 min-w-0 rounded-full p-0"
                                onClick={() =>
                                  handleRuleOrderChange(rule, "up")
                                }
                              >
                                <FaArrowUp size={16} />
                              </Button>
                              <Button
                                isDisabled={isOrderLoading || isLast}
                                variant="light"
                                color="warning"
                                className="h-8 w-8 min-w-0 rounded-full p-0"
                                onClick={() =>
                                  handleRuleOrderChange(rule, "down")
                                }
                              >
                                <FaArrowDown size={16} />
                              </Button>
                              <Button
                                isDisabled={isOrderLoading}
                                variant="light"
                                color="warning"
                                className="h-8 w-8 min-w-0 rounded-full p-0"
                                onClick={() => handleRuleEdit(rule)}
                              >
                                <FaPencilAlt size={16} />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div
                          className="tiptap-display pb-4 text-justify"
                          dangerouslySetInnerHTML={{ __html: rule.content }}
                        />
                      </Element>
                    );
                  })}
                {cat.value === 2 &&
                  abilities.map((ability) => {
                    return (
                      <Element
                        key={ability.id}
                        className="section"
                        name={translit(ability.name)}
                      >
                        <div className="flex flex-row">
                          <Tooltip
                            className="rounded-md text-tiny text-default-500"
                            content={"Скопировать ссылку"}
                            placement="top"
                          >
                            <h2
                              className={`cursor-pointer pb-2 text-2xl`}
                              onClick={() =>
                                handleRuleCopy(translit(ability.name))
                              }
                            >
                              {ability.name}
                            </h2>
                          </Tooltip>
                        </div>
                        <div className="tiptap-display whitespace-break-spaces pb-4 text-justify">
                          {ability.content}
                        </div>
                      </Element>
                    );
                  })}
              </Tab>
            ))}
            {!!isPersonnel && (
              <Tab
                key="editor"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Редактор</span>
                  </div>
                }
              >
                <RuleEditor onSubmit={(rule?: Rule) => handleRuleFind(rule)} />
              </Tab>
            )}
          </Tabs>
        </div>
      </main>
    </>
  );
}
