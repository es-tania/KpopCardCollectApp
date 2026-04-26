export const CARD_FORMAT_OPTIONS = [
  { key: "photocard", label: "Photocard", ratio: 2 / 3 },
  { key: "polaroid", label: "Polaroid", ratio: 3 / 4 },
  { key: "mini_id", label: "Mini ID Card", ratio: 1 },
  { key: "postcard", label: "Postcard", ratio: 4 / 3 },
  { key: "custom", label: "Custom", ratio: null },
] as const;

export type CardFormat = (typeof CARD_FORMAT_OPTIONS)[number]["key"];

export const getCardRatio = (
  format: CardFormat,
  customW?: number,
  customH?: number,
): number => {
  if (format === "custom") {
    if (customW && customH) return customW / customH;
    return 0;
  }
  return CARD_FORMAT_OPTIONS.find((f) => f.key === format)?.ratio ?? 2 / 3;
};
