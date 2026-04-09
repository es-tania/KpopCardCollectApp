import { ImageSourcePropType } from "react-native";

export type MemberPosition =
  | "Leader"
  | "Main Vocal"
  | "Lead Vocal"
  | "Sub Vocal"
  | "Main Dancer"
  | "Lead Dancer"
  | "Rapper"
  | "Visual"
  | "Maknae";

export interface Member {
  id: string;
  groupId: string;

  // 🧾 Identité
  stageName: string; // Nom de scène
  realName?: string; // Nom réel
  koreanName?: string; // Nom en hangul

  // 🖼️ Médias
  photoUrl?: ImageSourcePropType;

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
