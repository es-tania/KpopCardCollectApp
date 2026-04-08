import { ImageSourcePropType } from "react-native";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: ImageSourcePropType;
  createdAt: string;
}

export interface Group {
  id: string;

  // 🧾 Identité
  name: string;
  koreanName?: string;

  // 🖼️ Médias
  logoUrl?: ImageSourcePropType;
  bannerUrl?: ImageSourcePropType;

  // 🏢 Infos générales
  company?: string; // agence
  debutDate?: string; // ISO string
  disbandDate?: string;
  status?: "active" | "hiatus" | "disbanded";

  // 🎭 Concept & identité
  generation?: string; // ex: "4th gen"
  fandomName?: string;

  // 👥 Données liées
  memberCount?: number;
  totalAlbums?: number;
  totalPhotocards: number; // total sur l'app

  // 📊 Stats utilisateur (très important UX)
  ownedPhotocards?: number;
  wishlistPhotocards?: number;
  favoritePhotocards?: number;

  // 📈 Progression
  completionPercentage?: number; // completionPercentage = (ownedPhotocards / totalPhotocards) * 100;

  // 📱 UX
  isFavorite?: boolean;

  // 📅 Métadonnées
  createdAt?: string;
}

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

export type PhotocardType =
  | "normal"
  | "pob"
  | "lucky_draw"
  | "broadcast"
  | "event"
  | "benefit";
export type PhotocardStatus = "approved" | "pending" | "rejected";

export interface Photocard {
  id: string;

  // 🔗 Relations
  memberId: string;
  albumId: string;
  groupId: string;

  // 🖼️ Médias
  imageUrl?: ImageSourcePropType;
  backImageUrl?: ImageSourcePropType;

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

export interface CollectionEntry {
  id: string;
  userId: string;
  photocardId: string;
  addedAt: string;
}

export interface UserPhotocardState {
  userId: string;
  photocardId: string;

  isFavorite?: boolean;
  isWishlisted?: boolean;

  addedAt?: string;
}

export interface UserList {
  id: string;
  userId: string;
  name: string;
  photocardIds: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Données enrichies pour l'affichage

export interface PhotocardWithDetails extends Photocard {
  memberName: string;
  albumTitle: string;
  groupName: string;

  // 📊 États utilisateur
  isInCollection?: boolean;
  isFavorite?: boolean;
  isWishlisted?: boolean;
}

export interface GroupWithProgress extends Group {
  collectedCount: number;
  totalCount: number;

  completionPercentage: number;
}
