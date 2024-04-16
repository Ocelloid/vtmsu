import { Color } from "@tiptap/extension-color";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import EditorMenu from "~/components/EditorMenu";
import { EditorContent, useEditor } from "@tiptap/react";

const DefaultEditor = () => {
  const extensions = [
    Text,
    Document,
    Paragraph,
    TextAlign.configure({
      types: ["heading", "paragraph", "image"],
    }),
    Image,
    Dropcursor,
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

  const editor = useEditor({
    extensions: extensions,
  });

  return (
    <>
      <EditorMenu editor={editor!} />
      <EditorContent tabIndex={4} editor={editor} />
    </>
  );
};

export default DefaultEditor;
