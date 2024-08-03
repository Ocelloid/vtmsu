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
import Link from "@tiptap/extension-link";
import EditorMenu from "~/components/EditorMenu";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";

const DefaultEditor = ({
  initialContent,
  isRequired,
  placeholder,
  className,
  onUpdate,
  tabIndex,
  editor,
  label,
}: {
  initialContent?: string;
  isRequired?: boolean;
  placeholder?: string;
  className?: string;
  onUpdate?: (arg0: string) => void;
  tabIndex?: number;
  editor?: Editor;
  label?: string;
}) => {
  const extensions = [
    Placeholder.configure({
      // Use a placeholder:
      placeholder: !!placeholder ? placeholder : "Ваш текст",
      // Use different placeholders depending on the node type:
      // placeholder: ({ node }) => {
      //   if (node.type.name === 'heading') {
      //     return 'What’s the title?'
      //   }

      //   return 'Can you add some further context?'
      // },
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

  const defaultEditor = useEditor({
    extensions: extensions,
    content: initialContent,
    onUpdate({ editor: updatedEditor }) {
      if (!!onUpdate) onUpdate(updatedEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: !!className ? className : "",
      },
    },
  });

  return (
    <>
      {!!label && (
        <p className="ml-1 mt-1 py-1 text-xs text-default-600">
          {label}
          {isRequired && <span className="ml-0.5 text-red-500">*</span>}
        </p>
      )}
      <EditorMenu editor={!!editor ? editor : defaultEditor!} />
      <EditorContent
        tabIndex={!!tabIndex ? tabIndex : 4}
        editor={!!editor ? editor : defaultEditor!}
      />
    </>
  );
};

export default DefaultEditor;
