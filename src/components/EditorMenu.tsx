import { AiOutlineMergeCells } from "react-icons/ai";
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";
import {
  TbColumnInsertRight,
  TbColumnInsertLeft,
  TbColumnRemove,
  TbRowInsertBottom,
  TbRowInsertTop,
  TbRowRemove,
  TbTablePlus,
  TbTableMinus,
  TbTableFilled,
} from "react-icons/tb";
import {
  FaUndoAlt,
  FaRedoAlt,
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaParagraph,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaQuoteLeft,
  FaList,
  FaDivide,
  FaLink,
  FaImage,
} from "react-icons/fa";
import { type Editor } from "@tiptap/react";
import React, { useCallback } from "react";
import { Tooltip } from "@nextui-org/react";

const EditorMenu = ({ editor }: { editor: Editor }) => {
  const toggleLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href as string;
    const url = window.prompt("URL", previousUrl);
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = () => {
    const url = window.prompt("URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] justify-between gap-1 dark:text-red-300 md:grid-cols-[repeat(28,minmax(0,1fr))]">
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Отменить"}
        placement="bottom"
      >
        <button
          tabIndex={109}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={
            !editor.can().chain().focus().undo().run() ? "opacity-50" : ""
          }
        >
          <FaUndoAlt size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Повторно выполнить"}
        placement="bottom"
      >
        <button
          tabIndex={110}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={
            !editor.can().chain().focus().redo().run() ? "opacity-50" : ""
          }
        >
          <FaRedoAlt size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Выровнять по левому краю"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <FaAlignLeft size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Выровнять по центру"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <FaAlignCenter size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Выровнять по правому краю"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <FaAlignRight size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Выровнять по всей ширине"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <FaAlignJustify size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Жирный"}
        placement="bottom"
      >
        <button
          tabIndex={100}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <FaBold size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Курсив"}
        placement="bottom"
      >
        <button
          tabIndex={101}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <FaItalic size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Зачёркнутый"}
        placement="bottom"
      >
        <button
          tabIndex={102}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        >
          <FaStrikethrough size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Заголовок 1"}
        placement="bottom"
      >
        <button
          tabIndex={102}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <LuHeading1 size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Заголовок 2"}
        placement="bottom"
      >
        <button
          tabIndex={103}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <LuHeading2 size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Заголовок 3"}
        placement="bottom"
      >
        <button
          tabIndex={104}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <LuHeading3 size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Обычный параграф"}
        placement="bottom"
      >
        <button
          tabIndex={105}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <FaParagraph size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Ссылка"}
        placement="bottom"
      >
        <button onClick={toggleLink}>
          <FaLink size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Список"}
        placement="bottom"
      >
        <button
          tabIndex={106}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FaList size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Цитата"}
        placement="bottom"
      >
        <button
          tabIndex={107}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FaQuoteLeft size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Разделитель"}
        placement="bottom"
      >
        <button
          tabIndex={108}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <FaDivide size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Добавить таблицу"}
        placement="bottom"
      >
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TbTablePlus size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Удалить таблицу"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          className={!editor.can().deleteTable() ? "opacity-50" : ""}
        >
          <TbTableMinus size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Вставить столбец слева"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
          className={!editor.can().addColumnBefore() ? "opacity-50" : ""}
        >
          <TbColumnInsertLeft size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Вставить столбец справа"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
          className={!editor.can().addColumnAfter() ? "opacity-50" : ""}
        >
          <TbColumnInsertRight size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Удалить столбец"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          className={!editor.can().deleteColumn() ? "opacity-50" : ""}
        >
          <TbColumnRemove size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Вставить строку сверху"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
          className={!editor.can().addRowBefore() ? "opacity-50" : ""}
        >
          <TbRowInsertTop size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Вставить строку снизу"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          className={!editor.can().addRowAfter() ? "opacity-50" : ""}
        >
          <TbRowInsertBottom size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Удалить строку"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          className={!editor.can().deleteRow() ? "opacity-50" : ""}
        >
          <TbRowRemove size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Заголовок таблицы"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().toggleHeaderCell().run()}
          disabled={!editor.can().toggleHeaderCell()}
          className={!editor.can().toggleHeaderCell() ? "opacity-50" : ""}
        >
          <TbTableFilled size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Объединить/разделить ячейки"}
        placement="bottom"
      >
        <button
          onClick={() => editor.chain().focus().mergeOrSplit().run()}
          disabled={!editor.can().mergeOrSplit()}
          className={!editor.can().mergeOrSplit() ? "opacity-50" : ""}
        >
          <AiOutlineMergeCells size={16} className="mx-auto" />
        </button>
      </Tooltip>
      <Tooltip
        className="rounded-md text-tiny text-default-500"
        content={"Добавить изображение"}
        placement="bottom"
      >
        <button onClick={addImage}>
          <FaImage size={16} className="mx-auto" />
        </button>
      </Tooltip>
    </div>
  );
};

export default EditorMenu;
