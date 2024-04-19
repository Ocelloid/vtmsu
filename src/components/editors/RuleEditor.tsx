import { Input, Select, SelectItem, Button } from "@nextui-org/react";
import { EditorContent, useEditor } from "@tiptap/react";
import EditorMenu from "~/components/EditorMenu";
import { Color } from "@tiptap/extension-color";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useState, useEffect } from "react";
import { FaRegSave, FaTrashAlt, FaImage } from "react-icons/fa";
import { api } from "~/utils/api";
import { translit } from "~/utils/text";
import { type Rule } from "~/server/api/routers/rule";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";

const RuleEditor = ({ onSubmit }: { onSubmit: (rule?: Rule) => void }) => {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("1");
  const categories = [
    { value: 1, label: "Общие правила" },
    { value: 2, label: "Дисциплины" },
    { value: 3, label: "Ритуалы" },
  ];

  const extensions = [
    Placeholder.configure({
      placeholder:
        "Чтобы добавить в правила большой заголовок, введите 1 пробел",
    }),
    Link.configure({
      validate: (href) => /^https?:\/\//.test(href),
      openOnClick: true,
      autolink: true,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph", "image"],
    }),
    Image,
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle,
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ];

  const editor = useEditor(
    {
      extensions: extensions,
      content: content,
      editorProps: {
        attributes: {
          class: "min-h-[calc(100vh-18rem)]",
        },
      },
    },
    [content],
  );

  const addImage = () => {
    const url = window.prompt("URL");

    if (url) {
      editor!.chain().focus().setImage({ src: url }).run();
    }
  };

  useEffect(() => {
    const id = Array.isArray(router.query.ruleId)
      ? router.query.ruleId[0] ?? ""
      : router.query.ruleId ?? "";
    setRuleId(id);
  }, [router.query.ruleId]);

  const { mutate: createMutation, isPending: isCreatePending } =
    api.rule.create.useMutation();
  const { mutate: updateMutation, isPending: isUpdatePending } =
    api.rule.update.useMutation();
  const { mutate: deleteMutation, isPending: isDeletePending } =
    api.rule.delete.useMutation();

  const { data: ruleData, isLoading: isRuleLoading } =
    api.rule.findById.useQuery({ id: Number(ruleId) }, { enabled: !!ruleId });

  useEffect(() => {
    if (!!ruleData) {
      setLink(ruleData.link);
      setTitle(ruleData.name);
      setContent(ruleData.content);
      setCategory(ruleData.categoryId.toString());
    }
  }, [ruleData]);

  const isEmpty = () => {
    return editor?.getHTML() === `<p></p>`;
  };

  const handleRuleSubmit = () => {
    const ruleConfirm = confirm("Сохранить правило?");
    if (ruleConfirm)
      if (ruleId) {
        updateMutation(
          {
            id: Number(ruleId),
            name: title,
            link: link ?? translit(title),
            content: editor?.getHTML() ?? "",
            categoryId: Number(category),
          },
          {
            onSuccess: (data) => {
              setLink("");
              setTitle("");
              setCategory("1");
              editor?.commands.clearContent();
              onSubmit(data);
            },
          },
        );
      } else {
        createMutation(
          {
            name: title,
            link: link ?? translit(title),
            content: editor?.getHTML() ?? "",
            categoryId: Number(category),
          },
          {
            onSuccess: (data) => {
              setLink("");
              setTitle("");
              setCategory("1");
              editor?.commands.clearContent();
              onSubmit(data);
            },
          },
        );
      }
  };

  const handleRuleDelete = () => {
    const deleteConfirm = confirm("Удалить правило?");
    if (deleteConfirm)
      deleteMutation(
        { id: Number(ruleId) },
        {
          onSuccess: () => {
            setLink("");
            setTitle("");
            setCategory("1");
            editor?.commands.clearContent();
            onSubmit();
          },
        },
      );
  };

  if (isRuleLoading || isCreatePending || isUpdatePending || isDeletePending)
    return <LoadingPage />;

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          variant="underlined"
          color="warning"
          label="Название"
          placeholder="Введите название правила"
          value={title}
          onValueChange={setTitle}
        />
        <Input
          variant="underlined"
          color="warning"
          label="Ссылка"
          placeholder="Введите короткую ссылку"
          value={link}
          onValueChange={setLink}
        />
        <Select
          color="warning"
          variant="underlined"
          selectedKeys={[category]}
          onChange={(e) => {
            setCategory(!!e.target.value ? e.target.value : category);
          }}
          label="Категория"
        >
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </Select>
        <div className="flex flex-row gap-1">
          <Button
            onClick={addImage}
            variant="light"
            className="h-14 w-full min-w-0 text-red-300 data-[hover=true]:bg-transparent"
          >
            <FaImage size={32} />
          </Button>
          <Button
            isDisabled={!title || !link || isEmpty()}
            onClick={handleRuleSubmit}
            color="warning"
            variant="light"
            className="h-14 w-full min-w-0 data-[hover=true]:bg-transparent"
          >
            <FaRegSave size={32} />
          </Button>
          {!!ruleId && (
            <Button
              onClick={handleRuleDelete}
              color="danger"
              variant="light"
              className="h-14 w-full min-w-0 data-[hover=true]:bg-transparent"
            >
              <FaTrashAlt size={32} />
            </Button>
          )}
        </div>
      </div>
      <EditorMenu editor={editor!} />
      <EditorContent tabIndex={4} editor={editor} />
    </div>
  );
};

export default RuleEditor;
