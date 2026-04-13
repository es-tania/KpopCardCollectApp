import { ImageSourcePropType } from "react-native";

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

export interface GroupWithProgress extends Group {
  collectedCount: number;
  totalCount: number;

  completionPercentage: number;
}
