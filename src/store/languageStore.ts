import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { i18n } from "../i18n";

const STORAGE_KEY = "@app_locale";
const SUPPORTED_LOCALES = ["fr", "en", "ko"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

interface LanguageStore {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  loadLocale: () => Promise<void>;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  locale: "fr",

  setLocale: async (locale) => {
    i18n.locale = locale;
    set({ locale });
    await AsyncStorage.setItem(STORAGE_KEY, locale);
  },

  loadLocale: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) {
      i18n.locale = saved;
      set({ locale: saved as SupportedLocale });
      return;
    }

    // Premier lancement : détecte la langue du device via Intl (disponible dans Hermes)
    let deviceCode = "fr";
    try {
      deviceCode = Intl.DateTimeFormat().resolvedOptions().locale.split(/[-_]/)[0];
    } catch {}
    const detected = (SUPPORTED_LOCALES as readonly string[]).includes(deviceCode)
      ? (deviceCode as SupportedLocale)
      : "fr";

    i18n.locale = detected;
    set({ locale: detected });
  },
}));
