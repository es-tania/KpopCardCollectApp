import { ImageSourcePropType } from "react-native";

export type AlbumType =
  // 🎵 Musique officielle
  | "mini_album"
  | "full_album"
  | "single"
  | "digital_single"
  | "repackage"
  | "compilation"

  // 🎤 Events & contenus fans
  | "fanmeeting"
  | "fansign"
  | "videocall"
  | "showcase"
  | "concert"
  | "tour"

  // 🎁 Merch / spéciaux (très important pour photocards)
  | "season_greetings"
  | "membership_kit"
  | "kit_album"
  | "platform_album" // ex: Weverse, Nemo
  | "jewel_case"

  // 🎉 Événements spéciaux
  | "anniversary"
  | "collaboration"
  | "pop_up_store"
  | "lucky_draw"

  // 📺 Médias / contenu
  | "ost"
  | "photobook"
  | "dvd"
  | "bluray"

  // fallback
  | "event";

export interface Album {
  id: string;
  groupId: string;
  groupName: string;

  // 🧾 Infos principales
  title: string;
  koreanTitle?: string;
  type: AlbumType;
  category?: "music" | "event" | "merch" | "media";

  // 🖼️ Médias
  coverUrl?: ImageSourcePropType;

  // 📅 Dates
  releaseDate?: string;

  // 📊 Données collection
  totalPhotocards: number;
  ownedPhotocards?: number;
  wishlistPhotocards?: number;

  // 📈 Progression
  completionPercentage?: number; // ex: 75%
  isComplete?: boolean;

  // 🎁 Spécificités K-pop
  hasPOB?: boolean; // Pre-order benefits
  isLimited?: boolean; // ex: lucky draw, event exclusif
  eventName?: string; // ex: "Weverse Fansign"
  eventLocation?: string; // ex: "Seoul", "Japan"
  eventDate?: string;

  // 📦 Détails version (très courant en K-pop)
  versions?: string[]; // ex: ["A", "B", "Digipack", "Platform"]

  // 🔍 Recherche / filtre
  tags?: string[];

  // 📱 UX
  isFavorite?: boolean;

  // 📅 Métadonnées
  createdAt?: string;
  updatedAt?: string;
}
