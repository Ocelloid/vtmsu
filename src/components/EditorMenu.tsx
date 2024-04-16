import { AiOutlineMergeCells } from "react-icons/ai";
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";
import {
  TbColumnInsertLeft,
  TbColumnRemove,
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
} from "react-icons/fa";
import { type Editor } from "@tiptap/react";

const EditorMenu = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="grid grid-cols-12 justify-between gap-1 text-red-300 md:grid-cols-[repeat(24,minmax(0,1fr))]">
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
      <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <FaAlignLeft size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <FaAlignCenter size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <FaAlignRight size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <FaAlignJustify size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={100}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <FaBold size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={101}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <FaItalic size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={102}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <FaStrikethrough size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={102}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <LuHeading1 size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={103}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <LuHeading2 size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={104}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <LuHeading3 size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={105}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <FaParagraph size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={106}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FaList size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={107}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <FaQuoteLeft size={16} className="mx-auto" />
      </button>
      <button
        tabIndex={108}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <FaDivide size={16} className="mx-auto" />
      </button>
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
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}
        className={!editor.can().deleteTable() ? "opacity-50" : ""}
      >
        <TbTableMinus size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        disabled={!editor.can().addColumnBefore()}
        className={!editor.can().addColumnBefore() ? "opacity-50" : ""}
      >
        <TbColumnInsertLeft size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        className={!editor.can().deleteColumn() ? "opacity-50" : ""}
      >
        <TbColumnRemove size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}
        className={!editor.can().addRowBefore() ? "opacity-50" : ""}
      >
        <TbRowInsertTop size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        className={!editor.can().deleteRow() ? "opacity-50" : ""}
      >
        <TbRowRemove size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeaderCell().run()}
        disabled={!editor.can().toggleHeaderCell()}
        className={!editor.can().toggleHeaderCell() ? "opacity-50" : ""}
      >
        <TbTableFilled size={16} className="mx-auto" />
      </button>
      <button
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        disabled={!editor.can().mergeOrSplit()}
        className={!editor.can().mergeOrSplit() ? "opacity-50" : ""}
      >
        <AiOutlineMergeCells size={16} className="mx-auto" />
      </button>
    </div>
  );
};

export default EditorMenu;
