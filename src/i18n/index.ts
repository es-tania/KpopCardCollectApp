import { I18n } from "i18n-js";
import en from "./locales/en";
import fr from "./locales/fr";
import ko from "./locales/ko";
import type { Translations } from "./locales/fr";

// ─── Instance i18n ────────────────────────────────────────────────────────────

export const i18n = new I18n({ fr, en, ko });
i18n.defaultLocale = "fr";
i18n.locale = "fr";
i18n.enableFallback = true;

// ─── Typage strict des clés ───────────────────────────────────────────────────

// Génère un type union de tous les chemins en notation pointée
// ex: "nav.home" | "common.save" | "scan.hints.center" | ...
type Paths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? Paths<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

export type TranslationKey = Paths<Translations>;

export type { Translations };
