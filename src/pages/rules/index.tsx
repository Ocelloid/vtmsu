import { Tab, Tabs, Button, Tooltip } from "@nextui-org/react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import RuleEditor from "~/components/RuleEditor";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { type Rule } from "~/server/api/routers/rule";
import { Element, scroller } from "react-scroll";
import { FaPencilAlt } from "react-icons/fa";

export default function Rules() {
  const categoryKeys = ["common", "disciplines", "rituals"];
  const categoryTitles = ["Общие", "Дисциплины", "Ритуалы"];
  const { data, isLoading } = api.post.getAll.useQuery();
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [rules, setRules] = useState<Rule[]>([]);

  const { data: isPersonnel, isLoading: isUserLoading } =
    api.user.userIsPersonnel.useQuery(
      { id: sessionData?.user.id ?? "" },
      {
        enabled: !!sessionData,
      },
    );

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
          const cat =
            rule.categoryId == 1
              ? "common"
              : rule.categoryId == 2
                ? "disciplines"
                : "rituals";
          setCategory(cat);
          void router.push(
            {
              pathname: "/rules",
              query: {
                category: cat,
                rule: rule.link,
              },
            },
            undefined,
            { shallow: true },
          );
        } else {
          setCategory("common");
          void router.push(
            {
              pathname: "/rules",
              query: {
                category: "common",
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
            {categoryKeys.map((cat, i) => (
              <Tab
                key={cat}
                title={
                  <div className="flex items-center space-x-2">
                    <span className="font-montserrat">{categoryTitles[i]}</span>
                  </div>
                }
              >
                {rules
                  .filter((x) => x.categoryId === i + 1)
                  .map((rule) => (
                    <Element key={rule.id} className="section" name={rule.link}>
                      <div className="flex flex-row">
                        <Tooltip
                          className="rounded-md text-tiny text-default-500"
                          content={"Скопировать ссылку"}
                          placement="right"
                        >
                          <h2
                            className="cursor-pointer pb-2 text-2xl"
                            onClick={() => handleRuleCopy(rule.link)}
                          >
                            {rule.name}
                          </h2>
                        </Tooltip>
                        {isPersonnel && (
                          <Button
                            variant="bordered"
                            color="warning"
                            className="ml-auto h-8 w-8 min-w-0 p-0"
                            onClick={() => handleRuleEdit(rule)}
                          >
                            <FaPencilAlt size={16} />
                          </Button>
                        )}
                      </div>
                      <div
                        className="tiptap-display pb-8 text-justify"
                        dangerouslySetInnerHTML={{ __html: rule.content }}
                      />
                    </Element>
                  ))}
              </Tab>
            ))}
            {!!isPersonnel && (
              <Tab
                key="editor"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="font-montserrat">Редактор</span>
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
