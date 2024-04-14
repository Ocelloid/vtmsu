import { Input, Select, SelectItem, Button } from "@nextui-org/react";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { useState } from "react";
import { FaUndoAlt, FaRedoAlt } from "react-icons/fa";

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-row justify-between text-red-300">
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
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
      >
        h3
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive("paragraph") ? "is-active" : ""}
      >
        p
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
      >
        список
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "is-active" : ""}
      >
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
        <FaUndoAlt size={8} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={
          !editor.can().chain().focus().redo().run() ? "opacity-50" : ""
        }
      >
        <FaRedoAlt size={8} />
      </button>
    </div>
  );
};

const RuleEditor = () => {
  const [title, setTitle] = useState("");
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
      <div className="flex flex-row gap-2">
        <Input
          variant="underlined"
          label="Название"
          placeholder="Введите название правила"
          value={title}
          onValueChange={setTitle}
        />
        <Select
          variant="underlined"
          label="Выберите категорию"
          className="max-w-xs"
        >
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
      >
        <></>
      </EditorProvider>
      <Button variant="bordered">Добавить правило</Button>
    </div>
  );
};

export default RuleEditor;
