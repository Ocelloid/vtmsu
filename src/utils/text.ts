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

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Convert to meters
  console.log(distance);
  return distance;
}

export function containsAllValuesCaseInsensitive(
  strA: string,
  strB: string,
): boolean {
  const valuesA = strA.split(",").map((val) => val.trim().toLowerCase());
  const valuesB = strB.split(",").map((val) => val.trim().toLowerCase());

  return valuesB.every((val) => valuesA.includes(val));
}
