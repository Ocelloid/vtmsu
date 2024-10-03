"use client";
import {
  OghamKeyboard,
  alphabet,
} from "~/components/admin/OghamTransliteration";
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
      <p className="text-wrap break-all text-center text-xl">{valueFrom}</p>
      <p className="text-wrap break-all text-center text-xl">
        {transliterationFrom}
      </p>
      <OghamKeyboard
        onPress={(e: string) => handleChangeFrom(valueFrom + e)}
        backward={true}
        latin={false}
      />
    </div>
  );
}
