import { View } from "@/components/Themed";
import { PHOTOCARD_FILTER_OPTIONS } from "@/src/constants/options";
import { useShopsStore } from "@/src/store/shopsStore";
import React, { useMemo } from "react";
import { FilterToggle } from "./FilterToggle";
import { QuickFilterChips } from "./QuickFilterChips";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  key: string;
  label: string;
}

interface CardFiltersBarProps {
  // ── Type ──────────────────────────────────────────────────────────────
  activeType: string;
  onTypeChange: (type: string) => void;
  availableTypes?: string[]; // ← liste des types présents (optionnel, affiche tout si absent)
  // ── Shop ──────────────────────────────────────────────────────────────
  activeShop: string;
  onShopChange: (shop: string) => void;
  availableShops?: string[]; // ← liste des shops présents
}

export const CardFiltersBar: React.FC<CardFiltersBarProps> = ({
  activeType,
  onTypeChange,
  availableTypes,
  activeShop,
  onShopChange,
  availableShops,
}) => {
  const { getLabel } = useShopsStore();

  const typeOptions = useMemo(() => {
    const all = PHOTOCARD_FILTER_OPTIONS;
    if (!availableTypes) return all;
    const set = new Set(availableTypes);
    return all.filter((o) => o.key === "all" || set.has(o.key));
  }, [availableTypes]);

  const shopOptions = useMemo(() => {
    if (!availableShops || availableShops.length === 0) return [];
    return [
      { key: "all", label: "Tous" },
      ...availableShops.map((s) => ({ key: s, label: getLabel(s) })),
    ];
  }, [availableShops, getLabel]);

  const showType = typeOptions.length > 1;
  const showShop = shopOptions.length > 1;

  if (!showType && !showShop) return null;

  return (
    <>
      {showType && (
        <View>
          <QuickFilterChips
            options={typeOptions}
            selected={activeType}
            onSelect={onTypeChange}
          />
        </View>
      )}
      {showShop && (
        <FilterToggle
          options={shopOptions}
          selected={activeShop}
          onSelect={onShopChange}
          label="Filtrer par shop"
        />
      )}
    </>
  );
};
