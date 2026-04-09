import { PhotocardWithDetails } from "./photocard";

export type ScanStatus = "idle" | "scanning" | "found" | "not_found";

export type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "found"; card: PhotocardWithDetails }
  | { status: "not_found" };
