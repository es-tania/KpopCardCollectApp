import { PhotocardWithDetails } from "../types";
import { MOCK_PHOTOCARDS } from "./mockPhotocards";

export const MOCK_PENDING: Array<
  PhotocardWithDetails & {
    submittedBy: string;
    submittedAt: string;
  }
> = [
  {
    ...MOCK_PHOTOCARDS[0],
    id: "pending-1",
    status: "pending",
    submittedBy: "user_hana",
    submittedAt: "il y a 2h",
  },
  {
    ...MOCK_PHOTOCARDS[1],
    id: "pending-2",
    status: "pending",
    submittedBy: "p1h_lover",
    submittedAt: "il y a 5h",
  },
  {
    ...MOCK_PHOTOCARDS[2],
    id: "pending-3",
    status: "pending",
    submittedBy: "keeho_stan",
    submittedAt: "hier",
  },
];
