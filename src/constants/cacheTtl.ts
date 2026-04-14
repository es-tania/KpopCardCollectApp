// src/constants/cacheTtl.ts
export const CACHE_TTL = {
  groups: 10 * 60 * 1000, // 10 min — change peu
  albums: 10 * 60 * 1000, // 10 min
  members: 10 * 60 * 1000, // 10 min
  photocards: 5 * 60 * 1000, // 5 min
  profile: 5 * 60 * 1000, // 5 min
  collection: 1 * 60 * 1000, // 1 min — change souvent
} as const;
