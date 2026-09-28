# KCardCollect

> Track, collect and discover K-pop photocards — all in one place.

KCardCollect is a mobile app for K-pop fans to manage their photocard collection. Browse a community-built catalog, track what you own, build your wishlist, identify cards with AI scanning, and submit missing cards for review.

---

## Features

- **Collection tracking** — Mark cards as collected, favorited or wishlisted
- **Missing cards** — See at a glance which cards you're still missing, filtered by album, member, type or shop
- **AI scan** — Identify a physical card by pointing your camera at it (CLIP embeddings + pgvector similarity search)
- **Community submissions** — Users can propose new photocards, albums and groups; admins review and approve
- **In-app notifications** — Get notified when your submissions are approved or rejected
- **Group & member pages** — Browse the full catalog organized by group → album → member
- **Multi-filter system** — Filter by photocard type (POB, Fansign, Lucky Draw…) and shop (Soundwave, Ktown4u, Weverse…)
- **Multilingual** — French, English, Korean

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 52 |
| Routing | Expo Router (file-based) |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Language | TypeScript |
| Icons | lucide-react-native |

---

## Getting started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- A Supabase project with the schema set up

### Install

```bash
git clone https://github.com/es-tania/KpopCardCollect.git
cd KpopCardCollect
npm install
```

### Run on device / emulator

```bash
npx expo start
```

---

## Build

### Quick test APK (EAS cloud build)

```bash
eas build --platform android --profile preview
```

### Local APK

```bash
npx expo prebuild --platform android
cd android
gradlew assembleDebug     # debug
gradlew assembleRelease   # release
```

> EAS project ID: `7e38f23c-c632-45d2-a9ff-5880fc869262`

---

## Status

> 🚧 Currently in active development — not yet publicly available.
