"use client";
import {
  OghamKeyboard,
  alphabet,
} from "~/components/admin/OghamTransliteration";
import { Button } from "@nextui-org/react";
import { FaCopy } from "react-icons/fa";
import { useState } from "react";

export default function OghamPage() {
  const [valueFrom, seValueFrom] = useState("");
  const [transliterationFrom, setTransliterationFrom] = useState("");

  const handleChangeFrom = (e: string) => {
    seValueFrom(e);
    let transliteration = "";
    const fromTransliteration = e.replace(/᚛/g, "").replace(/᚜/g, "");
    for (const char of fromTransliteration) {
      const index = Object.values(alphabet).indexOf(char);
      if (index !== -1) {
        transliteration += Object.keys(alphabet)[index];
      }
    }
    setTransliterationFrom(transliteration);
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      <Button
        className="items-center text-wrap break-all text-center text-xl"
        size="sm"
        variant="light"
        isDisabled={!valueFrom}
        onClick={() => navigator.clipboard.writeText(valueFrom)}
      >
        {valueFrom} {!!valueFrom && <FaCopy size={12} />}
      </Button>
      <p className="min-h-8 text-wrap break-all text-center text-xl">
        {transliterationFrom}
      </p>
      <OghamKeyboard
        onPress={(e: string) => handleChangeFrom(valueFrom + e)}
        onRemoveLast={() => handleChangeFrom(valueFrom.slice(0, -1))}
        backward={true}
        latin={false}
      />
    </div>
  );
}
