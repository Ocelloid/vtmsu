"use client";
import { Button, Input } from "@nextui-org/react";
import { useState } from "react";

export const alphabet = {
  а: "ᚐ",
  б: "ᚁ",
  в: "ᚃ",
  г: "ᚌ",
  д: "ᚇ",
  е: "ᚓ",
  ё: "ᚓ",
  ж: "ᚎ",
  з: "ᚎ",
  и: "ᚔ",
  й: "ᚆ",
  к: "ᚊ",
  л: "ᚂ",
  м: "ᚋ",
  н: "ᚅ",
  о: "ᚑ",
  п: "ᚚ",
  р: "ᚏ",
  с: "ᚄ",
  т: "ᚈ",
  у: "ᚒ",
  ф: "ᚃ",
  х: "ᚕ",
  ц: "ᚊ",
  ч: "ᚊ",
  ш: "ᚄ",
  щ: "ᚄ",
  ъ: "",
  ы: "ᚔ",
  ь: "",
  э: "ᚕ",
  ю: "ᚗ",
  я: "ᚘ",
  a: "ᚐ",
  b: "ᚁ",
  c: "ᚉ",
  d: "ᚇ",
  e: "ᚓ",
  f: "ᚃ",
  g: "ᚌ",
  h: "ᚆ",
  i: "ᚔ",
  j: "ᚆ",
  k: "ᚉ",
  l: "ᚂ",
  m: "ᚋ",
  n: "ᚅ",
  o: "ᚑ",
  p: "ᚚ",
  q: "ᚊ",
  r: "ᚏ",
  s: "ᚄ",
  t: "ᚈ",
  u: "ᚒ",
  v: "ᚃ",
  w: "ᚃ",
  x: "ᚕ",
  y: "ᚗ",
  z: "ᚎ",
  " ": " ",
};

export default function OghamTransliteration() {
  const [valueTo, setValueTo] = useState("");
  const [valueFrom, seValueFrom] = useState("");
  const [transliterationTo, setTransliterationTo] = useState("");
  const [transliterationFrom, setTransliterationFrom] = useState("");

  const handleChangeTo = (e: string) => {
    setValueTo(e);
    let transliteration = "";
    for (const char of e.toLowerCase()) {
      const index = Object.keys(alphabet).indexOf(char);
      if (index !== -1) {
        transliteration += Object.values(alphabet)[index];
        transliteration += " ";
      }
    }
    setTransliterationTo(`᚛${transliteration}᚜`);
  };

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
      Перевести на Охам:
      <Input value={valueTo} onChange={(e) => handleChangeTo(e.target.value)} />
      <p
        className="cursor-pointer text-center text-3xl"
        onClick={() => navigator.clipboard.writeText(transliterationTo)}
        title="Скопировать"
      >
        {transliterationTo}
      </p>
      Перевести с Охама:
      <OghamKeyboard onPress={(e: string) => handleChangeFrom(valueFrom + e)} />
      <Input
        value={valueFrom}
        onChange={(e) => handleChangeFrom(e.target.value)}
      />
      <p
        className="cursor-pointer text-center text-3xl"
        onClick={() => navigator.clipboard.writeText(transliterationFrom)}
        title="Скопировать"
      >
        {transliterationFrom}
      </p>
    </div>
  );
}

export const OghamKeyboard = ({
  onPress,
  backward = false,
  latin = true,
}: {
  onPress: (e: string) => void;
  backward?: boolean;
  latin?: boolean;
}) => {
  return (
    <div className="flex w-full flex-row flex-wrap gap-2">
      {Object.values(alphabet)
        .filter((_a, i) => i < 33 || latin)
        .map((val, index) => (
          <Button
            key={val}
            className="h-8 w-8 min-w-14 rounded-lg bg-white/75 p-0 text-2xl dark:bg-red-950/50"
            onClick={() => onPress(val)}
          >
            {backward ? (
              <span>
                {Object.keys(alphabet)[index]}: {val}
              </span>
            ) : (
              <span>
                {val}: {Object.keys(alphabet)[index]}
              </span>
            )}
          </Button>
        ))}
    </div>
  );
};
