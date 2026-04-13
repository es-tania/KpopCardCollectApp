import { SHOP_OPTIONS } from "@/src/constants/options/shopOptions";

export const getShopLabel = (key: string | undefined): string => {
  if (!key) return "";
  const option = SHOP_OPTIONS.find((s) => s.key === key);
  return option?.label ?? key; // fallback sur la key si non trouvée
};
