import { Tab, Tabs, Button, Tooltip } from "@nextui-org/react";
import Head from "next/head";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import RuleEditor from "~/components/RuleEditor";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { type Rule } from "~/server/api/routers/rule";
import { Element, scroller } from "react-scroll";
import { FaPencilAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function Rules() {
  const categories = [
    { value: 1, label: "Общие" },
    { value: 2, label: "Дисциплины" },
    { value: 3, label: "Ритуалы" },
  ];
  const { data, isLoading } = api.post.getAll.useQuery();
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [rules, setRules] = useState<Rule[]>([]);

  const { data: isPersonnel, isLoading: isUserLoading } =
    api.user.userIsPersonnel.useQuery();

  const { mutate: changeOrder, isPending: isOrderLoading } =
    api.rule.changeOrder.useMutation();

  const {
    data: rulesData,
    isLoading: isRulesLoading,
    refetch,
  } = api.rule.getAll.useQuery();

  useEffect(() => {
    setRules(rulesData ?? []);
    const ruleTo = Array.isArray(router.query.rule)
      ? router.query.rule[0] ?? ""
      : router.query.rule ?? "";
    const catTo = Array.isArray(router.query.category)
      ? router.query.category[0] ?? ""
      : router.query.category ?? "";

    if (catTo !== "editor")
      setTimeout(() => {
        scroller.scrollTo(ruleTo, {
          duration: 1500,
          delay: 100,
          smooth: true,
          offset: -96,
        });
      }, 200);
  }, [rulesData, router.query]);

  const handleCategoryChange = (e: string) => {
    setCategory(e);
    void router.push(
      {
        pathname: "/rules",
        query: { category: e },
      },
      undefined,
      { shallow: true },
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
      { shallow: true },
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
      { shallow: true },
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
            { shallow: true },
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
            { shallow: true },
          );
        }
      })
      .catch((e) => console.log(e));
  };

  if (isLoading || isUserLoading || isRulesLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

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
                            placement="right"
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
                                variant="bordered"
                                color="warning"
                                className="h-8 w-8 min-w-0 rounded-full p-0"
                                onClick={() =>
                                  handleRuleOrderChange(rule, "up")
                                }
                              >
                                <FaArrowUp size={16} />
                              </Button>
                              <Button
                                isDisabled={isOrderLoading}
                                variant="bordered"
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
                                variant="bordered"
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
                          className="tiptap-display pb-8 text-justify"
                          dangerouslySetInnerHTML={{ __html: rule.content }}
                        />
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
