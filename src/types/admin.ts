import { PhotocardWithDetails } from "./photocard";

// ─── Soumissions ──────────────────────────────────────────────────────────────

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  card: PhotocardWithDetails;
  submittedBy: string;
  submittedAt: string;
}

// ─── Gestion ──────────────────────────────────────────────────────────────────

export type AdminTabKey = "photocards" | "albums" | "groups";

export type ViewMode = "search" | "edit";

export interface AdminTab {
  key: string;
  label: string;
  count?: number;
}
