// ─── Filtres communs à plusieurs pages ────────────────────────────────────────

export type FilterKey = "all" | "collection" | "favorites" | "wishlist";

export type CardMode = "collection" | "favorites" | "wishlist";

export type StatusFilter = "all" | "active" | "hiatus" | "disbanded";

export type TypeFilter =
  | "all"
  | "normal"
  | "pob"
  | "lucky_draw"
  | "broadcast"
  | "event"
  | "benefit";

// ─── Params de routes ─────────────────────────────────────────────────────────

export interface GroupRouteParams {
  id: string;
  groupId?: string;
}

export interface MemberRouteParams {
  id: string;
  groupId?: string;
}

export interface AlbumRouteParams {
  id: string;
  groupId?: string;
}

export interface MyCardsRouteParams {
  mode?: CardMode;
}

export interface AdminEditRouteParams {
  id?: string;
}
