import { SelectOption } from "@/src/types";

export type FilterKey =
  | "all"
  | "collection"
  | "favorites"
  | "wishlist"
  | "none";

export const FILTER_OPTIONS: SelectOption[] = [
  { key: "all", label: "Toutes" },
  { key: "collection", label: "Collection" },
  { key: "favorites", label: "Favoris" },
  { key: "wishlist", label: "Souhaits" },
  { key: "none", label: "Non classées" },
];

export const ALL_MEMBERS_ID = "all";
