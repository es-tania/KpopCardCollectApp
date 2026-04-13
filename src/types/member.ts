import { ImageSourcePropType } from "react-native";

export type MemberPosition =
  | "Leader"
  | "Main Vocalist"
  | "Lead Vocalist"
  | "Sub Vocalist"
  | "Main Dancer"
  | "Lead Dancer"
  | "Rapper"
  | "Main Rapper"
  | "Visual"
  | "Maknae"
  | "Vocalist"
  | "Composer"
  | "Center"
  | "Captain"
  | "Performer"
  | "Producer"
  | "Dancer";

export interface Member {
  id: string;
  groupId: string;

  // 🧾 Identité
  stageName: string; // Nom de scène
  realName?: string; // Nom réel
  koreanName?: string; // Nom en hangul

  // 🖼️ Médias
  photoUrl?: ImageSourcePropType | null;

  // 🎤 Rôle dans le groupe
  position?: MemberPosition[];

  // 👤 Infos perso
  birthDate?: string;

  // 📱 UX / App
  isFavorite?: boolean;

  // 📊 Stats liées à la collection
  totalPhotocards?: number;
  ownedPhotocards?: number;
  wishlistPhotocards?: number;

  // 🔍 Recherche / filtre
  tags?: string[];

  // 📅 Métadonnées
  createdAt?: string;
}
