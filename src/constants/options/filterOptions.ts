import { FilterOption } from "../../components/ui/FilterPills";

export type FilterKey = "all" | "collection" | "favorites" | "wishlist";

export const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", label: "Toutes" },
  { key: "collection", label: "Collection" },
  { key: "favorites", label: "Favoris" },
  { key: "wishlist", label: "Souhaits" },
];

export const ALL_MEMBERS_ID = "all";
