// src/constants/cacheTtl.ts
// export const CACHE_TTL = {
//   groups: 10 * 60 * 1000, // 10 min — change peu
//   albums: 10 * 60 * 1000, // 10 min
//   members: 10 * 60 * 1000, // 10 min
//   photocards: 5 * 60 * 1000, // 5 min
//   profile: 5 * 60 * 1000, // 5 min
//   collection: 1 * 60 * 1000, // 1 min — change souvent
// } as const;

// export const CACHE_TTL = {
//   groups: 1 * 60 * 1000, // 10 min — change peu
//   albums: 1 * 60 * 1000, // 10 min
//   members: 1 * 60 * 1000, // 10 min
//   photocards: 1 * 60 * 1000, // 5 min
//   profile: 1 * 60 * 1000, // 5 min
//   collection: 1 * 60 * 1000, // 1 min — change souvent
// } as const;

export const CACHE_TTL = {
  groups: 0 * 60 * 1000, // 10 min — change peu
  albums: 0 * 60 * 1000, // 10 min
  members: 0 * 60 * 1000, // 10 min
  photocards: 0 * 60 * 1000, // 5 min
  profile: 0 * 60 * 1000, // 5 min
  collection: 0 * 60 * 1000, // 1 min — change souvent
  shops: 5 * 60 * 1000,
} as const;
