import { ImageSourcePropType } from "react-native";

export type PhotocardType =
  | "normal"
  | "pob"
  | "lucky_draw"
  | "broadcast"
  | "event"
  | "benefit";

export type PhotocardTypeFilter = "all" | PhotocardType;

export type PhotocardStatus = "approved" | "pending" | "rejected";

export interface Photocard {
  id: string;

  // 🔗 Relations
  memberId: string;
  albumId: string;
  groupId: string;

  // 🖼️ Médias
  imageUrl?: ImageSourcePropType | null;
  backImageUrl?: ImageSourcePropType | null;

  // 🃏 Infos carte
  type: PhotocardType;
  version?: string; // ex: "A", "B", "Digipack"

  // 🎁 Spécificités collection
  isLimited?: boolean;
  shopName?: string; // ex: "Weverse Fansign"
  rarity?: "common" | "rare" | "very_rare";

  // 🤖 IA / scan
  fingerprint?: string; // hash image pour reconnaissance
  detectedMember?: string; // suggestion IA

  // 📊 Modération
  status: PhotocardStatus;
  createdBy?: string;

  // 📅 Métadonnées
  createdAt?: string;
  updatedAt?: string;
}

export interface PhotocardWithDetails extends Photocard {
  memberName: string;
  albumTitle: string;
  groupName: string;
  createdBy: string;

  // 📊 États utilisateur
  isInCollection?: boolean;
  isFavorite?: boolean;
  isWishlisted?: boolean;
}
