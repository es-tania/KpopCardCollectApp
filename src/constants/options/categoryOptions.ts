import { SelectOption } from "@/src/types";

export const CATEGORY_OPTIONS: SelectOption[] = [
  { key: "music", label: "Musique" },
  { key: "event", label: "Événement" },
  { key: "merch", label: "Merch" },
  { key: "media", label: "Média" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  music: "Musique",
  event: "Événement",
  merch: "Merch",
  media: "Média",
};
