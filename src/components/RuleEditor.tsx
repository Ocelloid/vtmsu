import { Input, Select, SelectItem, Button } from "@nextui-org/react";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { useState } from "react";
import { FaUndoAlt, FaRedoAlt } from "react-icons/fa";

export const EditorMenuBar = () => {
  const { editor } = useCurrentEditor();

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

const RuleEditor = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("1");
  const [content, setContent] = useState("");
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
        <Button
          color="warning"
          variant="light"
          className="h-14 data-[hover=true]:bg-transparent md:w-56"
        >
          Добавить
        </Button>
      </div>
      <EditorProvider
        slotBefore={<EditorMenuBar />}
        extensions={extensions}
        content={content}
      >
        <></>
      </EditorProvider>
    </div>
  );
};

export default RuleEditor;
