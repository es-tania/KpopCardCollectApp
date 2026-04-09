import { SelectOption } from "@/src/types";
import { StatusFilter } from "../../types/navigation";

export const STATUS_OPTIONS: SelectOption[] = [
  { key: "active", label: "Actif" },
  { key: "hiatus", label: "En hiatus" },
  { key: "disbanded", label: "Disbandé" },
];

export const STATUS_FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "active", label: "Actifs" },
  { key: "hiatus", label: "Hiatus" },
  { key: "disbanded", label: "Disbandés" },
];
