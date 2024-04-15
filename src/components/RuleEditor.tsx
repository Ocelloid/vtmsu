import { Input, Select, SelectItem, Button } from "@nextui-org/react";
import { EditorContent, type Editor, useEditor } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { translit } from "~/utils/text";
import { FaUndoAlt, FaRedoAlt, FaRegSave, FaTrashAlt } from "react-icons/fa";
import { type Rule } from "~/server/api/routers/rule";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";

export const EditorMenuBar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 justify-between gap-1 text-red-300 md:grid-cols-12 [&>*]:rounded-md [&>*]:border-1 [&>*]:border-red-100/20">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={"font-bold"}
      >
        b
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={"italic"}
      >
        i
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={"line-through"}
      >
        s
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        h3
      </button>
      <button onClick={() => editor.chain().focus().setParagraph().run()}>
        p
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        список
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        цитата
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        раздел
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={
          !editor.can().chain().focus().undo().run() ? "opacity-50" : ""
        }
      >
        <FaUndoAlt size={12} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={
          !editor.can().chain().focus().redo().run() ? "opacity-50" : ""
        }
      >
        <FaRedoAlt size={12} className="mx-auto" />
      </button>
    </div>
  );
};

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
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
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
  ];

  const editor = useEditor(
    {
      extensions: extensions,
      content: content,
    },
    [content],
  );

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
          label="Выберите категорию"
          className="max-w-xs"
        >
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </Select>
        <div className="flex min-w-[8.25rem] flex-row gap-1">
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
      <EditorMenuBar editor={editor!} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RuleEditor;
