import { Submission } from "../components/admin/submissions";
import { MOCK_PHOTOCARDS } from "./mockPhotocards";

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    card: { ...MOCK_PHOTOCARDS[0], id: "sub-1", status: "pending" },
    submittedBy: "user_hana",
    submittedAt: "il y a 2h",
  },
  {
    card: { ...MOCK_PHOTOCARDS[1], id: "sub-2", status: "pending" },
    submittedBy: "p1h_lover",
    submittedAt: "il y a 5h",
  },
  {
    card: { ...MOCK_PHOTOCARDS[2], id: "sub-3", status: "approved" },
    submittedBy: "keeho_stan",
    submittedAt: "hier",
  },
  {
    card: { ...MOCK_PHOTOCARDS[0], id: "sub-4", status: "approved" },
    submittedBy: "theo_fan",
    submittedAt: "il y a 2 jours",
  },
  {
    card: { ...MOCK_PHOTOCARDS[1], id: "sub-5", status: "rejected" },
    submittedBy: "intak_bias",
    submittedAt: "il y a 3 jours",
  },
  {
    card: { ...MOCK_PHOTOCARDS[2], id: "sub-6", status: "rejected" },
    submittedBy: "jiung_world",
    submittedAt: "il y a 4 jours",
  },
];
