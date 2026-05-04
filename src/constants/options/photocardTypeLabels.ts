import { PhotocardType, PhotocardTypeFilter } from "../../types/photocard";

export const PHOTOCARD_TYPE_LABELS: Record<PhotocardType, string> = {
  normal: "Normal",
  pob: "POB",
  lucky_draw: "Lucky Draw",
  broadcast: "Broadcast",
  event: "Event",
  benefit: "Benefit",
  fansign: "Fansign",
  video_call: "Video Call",
};

interface TypeFilterOption {
  key: PhotocardTypeFilter;
  label: string;
}

export const PHOTOCARD_TYPE_OPTIONS: TypeFilterOption[] = [
  { key: "normal", label: "Normal" },
  { key: "pob", label: "POB" },
  { key: "broadcast", label: "Broadcast" },
  { key: "lucky_draw", label: "Lucky Draw" },
  { key: "event", label: "Event" },
  { key: "benefit", label: "Benefit" },
  { key: "fansign", label: "Fansign" },
  { key: "video_call", label: "Video Call" },
];

export const PHOTOCARD_FILTER_OPTIONS: TypeFilterOption[] = [
  { key: "all", label: "Toutes" },
  { key: "normal", label: "Normal" },
  { key: "pob", label: "POB" },
  { key: "broadcast", label: "Broadcast" },
  { key: "lucky_draw", label: "Lucky Draw" },
  { key: "event", label: "Event" },
  { key: "benefit", label: "Benefit" },
  { key: "fansign", label: "Fansign" },
  { key: "video_call", label: "Video Call" },
];
