export function translit(word: string) {
  const converter: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ь: "",
    ы: "y",
    ъ: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  word = word.toLowerCase();

  let answer = "";

  for (const char of word) {
    if (converter.hasOwnProperty(char)) {
      answer += converter[char];
    } else {
      answer += char;
    }
  }

  answer = answer.replace(/[^-0-9a-z]/g, "-");
  answer = answer.replace(/[-]+/g, "-");
  answer = answer.replace(/^\-|-$/g, "");

  return answer;
}

export function degreesToCoordinate(degrees: number): string {
  const wholeDegrees = Math.floor(degrees);
  const decimalPart = degrees - wholeDegrees;
  const minutes = Math.floor(decimalPart * 60);
  const seconds = Math.round((decimalPart * 60 - minutes) * 60);

  return `${wholeDegrees}° ${minutes}' ${seconds}"`;
}
