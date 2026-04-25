import { z } from "zod";

// ─── Utilitaire de sanitisation ───────────────────────────────────────────────

// Supprime les espaces superflus et les octets nuls (null byte injection)
export const sanitize = (value: string): string =>
  value.trim().replace(/\x00/g, "");

// ─── Primitives réutilisables ─────────────────────────────────────────────────

const text = (max: number) =>
  z.string().max(max, `Maximum ${max} caractères`).transform(sanitize);

// Champ optionnel : accepte "" ou une chaîne avec limite de longueur
const optText = (max: number) =>
  z
    .string()
    .max(max, `Maximum ${max} caractères`)
    .transform(sanitize)
    .optional()
    .or(z.literal(""));

// Date optionnelle au format YYYY-MM-DD ou chaîne vide
const isoDate = z
  .string()
  .refine(
    (v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v),
    "Format invalide (YYYY-MM-DD)",
  )
  .optional()
  .or(z.literal(""));

// Champ CSV : borne la longueur totale et le nombre d'éléments
const csv = (maxItems: number) =>
  z
    .string()
    .max(500, "Maximum 500 caractères")
    .transform(sanitize)
    .refine(
      (v) => !v || v.split(",").filter(Boolean).length <= maxItems,
      `Maximum ${maxItems} éléments`,
    );

// ─── Valeurs d'énumérations autorisées ───────────────────────────────────────

export const PHOTOCARD_TYPES = [
  "normal",
  "pob",
  "lucky_draw",
  "broadcast",
  "event",
  "benefit",
] as const;

export const RARITY_VALUES = ["common", "rare", "very_rare"] as const;

export const ALBUM_TYPES = [
  "mini_album",
  "full_album",
  "single",
  "digital_single",
  "repackage",
  "compilation",
  "fanmeeting",
  "fansign",
  "videocall",
  "showcase",
  "concert",
  "tour",
  "season_greetings",
  "membership_kit",
  "kit_album",
  "platform_album",
  "jewel_case",
  "anniversary",
  "collaboration",
  "pop_up_store",
  "lucky_draw",
  "photobook",
  "dvd",
  "bluray",
  "ost",
  "event",
] as const;

export const CATEGORY_VALUES = ["music", "event", "merch", "media"] as const;

export const STATUS_VALUES = ["active", "hiatus", "disbanded"] as const;

// ─── Schéma Photocard ─────────────────────────────────────────────────────────

// Rareté : "" est accepté (le service applique || "common"), les autres valeurs doivent être valides
const rarityField = z
  .string()
  .refine(
    (v) => v === "" || (RARITY_VALUES as readonly string[]).includes(v),
    "Rareté invalide",
  );

// Type photocard : doit être une valeur connue ou vide
const photocardTypeField = z
  .string()
  .refine(
    (v) => v === "" || (PHOTOCARD_TYPES as readonly string[]).includes(v),
    "Type de photocard invalide",
  );

export const photocardCreateSchema = z.object({
  groupId: z.string().min(1, "Groupe requis"),
  albumId: z.string().min(1, "Album requis"),
  memberId: z.string().optional(),
  memberIds: z.array(z.string()).max(20, "Maximum 20 membres"),
  type: photocardTypeField,
  version: optText(50),
  shopName: optText(100),
  eventName: optText(150),
  rarity: rarityField,
  imageUri: z.string().min(1, "Image requise"),
  backImageUri: z.string().optional(),
});

export const photocardEditSchema = z.object({
  albumId: z.string().min(1, "Album requis"),
  memberId: z.string().optional(),
  memberIds: z.array(z.string()).max(20, "Maximum 20 membres"),
  type: photocardTypeField,
  version: optText(50),
  shopName: optText(100),
  rarity: rarityField,
});

// ─── Schéma Groupe ────────────────────────────────────────────────────────────

export const groupCreateSchema = z.object({
  name: text(100).refine((v) => v.length > 0, "Nom requis"),
  koreanName: optText(100),
  company: optText(100),
  debutDate: isoDate,
  disbandDate: isoDate,
  generation: optText(20),
  fandomName: optText(100),
  status: z
    .string()
    .refine(
      (v): v is (typeof STATUS_VALUES)[number] =>
        (STATUS_VALUES as readonly string[]).includes(v),
      "Statut invalide",
    ),
});

// ─── Schéma Album ─────────────────────────────────────────────────────────────

export const albumCreateSchema = z.object({
  groupId: z.string().min(1, "Groupe requis"),
  title: text(150).refine((v) => v.length > 0, "Titre requis"),
  koreanTitle: optText(150),
  type: z
    .string()
    .refine(
      (v): v is (typeof ALBUM_TYPES)[number] =>
        (ALBUM_TYPES as readonly string[]).includes(v),
      "Type d'album invalide",
    ),
  category: z
    .string()
    .refine(
      (v): v is (typeof CATEGORY_VALUES)[number] =>
        (CATEGORY_VALUES as readonly string[]).includes(v),
      "Catégorie invalide",
    ),
  releaseDate: isoDate,
  eventName: optText(150),
  eventLocation: optText(200),
  eventDate: isoDate,
  versions: csv(50),
  hasPOB: z.enum(["oui", "non"]),
  isLimited: z.enum(["oui", "non"]),
  tags: csv(50),
});

// ─── Schéma Membre ────────────────────────────────────────────────────────────

export const memberCreateSchema = z.object({
  stageName: text(50).refine((v) => v.length > 0, "Nom de scène requis"),
  realName: optText(100),
  koreanName: optText(100),
  birthDate: isoDate,
  position: z.array(z.string().max(50)).max(10, "Maximum 10 positions"),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

// Lance une erreur avec le premier message de validation si le schéma échoue
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError.message);
  }
  return result.data;
}
