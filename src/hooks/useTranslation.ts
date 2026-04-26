import { useCallback } from "react";
import { i18n, type TranslationKey } from "../i18n";
import { useLanguageStore, type SupportedLocale } from "../store/languageStore";

export function useTranslation() {
  const { locale, setLocale } = useLanguageStore();

  // Le locale en dépendance force le recalcul du cache useCallback à chaque changement de langue
  const t = useCallback(
    (key: TranslationKey, options?: Record<string, unknown>): string => {
      return i18n.t(key, options);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  return { t, locale, setLocale };
}

export type { TranslationKey, SupportedLocale };
