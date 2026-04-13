import { Group } from "../types";

export const MOCK_GROUPS_PROGRESS: Group[] = [
  {
    id: "g1",
    name: "P1Harmony",
    koreanName: "피원하모니",

    logoUrl: require("@/assets/images/p1h_logo.png"),
    // bannerUrl: "https://example.com/p1h-banner.jpg",

    company: "FNC Entertainment",
    generation: "4th gen",
    fandomName: "P1ece",

    totalPhotocards: 210,
    collectedCount: 47,
    totalCount: 210,
    completionPercentage: 22.4,

    isFavorite: true,

    createdAt: "2024-01-01",
  },
  {
    id: "g2",
    name: "Stray Kids",
    koreanName: "스트레이 키즈",

    logoUrl: require("@/assets/images/straykids_logo.jpg"),
    // bannerUrl: "https://example.com/skz-banner.jpg",

    company: "JYP Entertainment",
    generation: "4th gen",
    fandomName: "STAY",

    totalPhotocards: 340,
    collectedCount: 83,
    totalCount: 340,
    completionPercentage: 24.4,

    isFavorite: false,

    createdAt: "2024-01-01",
  },
];
