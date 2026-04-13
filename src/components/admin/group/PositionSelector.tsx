import { Colors } from "@/src/constants/colors";
import { POSITION_OPTIONS } from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import { X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Sous-composant sélecteur de positions ────────────────────────────────────

interface PositionSelectorProps {
  selected: string[];
  onChange: (positions: string[]) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  selected,
  onChange,
}) => {
  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((p) => p !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <View style={positionStyles.container}>
      <Text style={positionStyles.label}>Positions</Text>

      {/* Chips sélectionnées */}
      {selected.length > 0 && (
        <View style={positionStyles.selectedRow}>
          {selected.map((pos) => (
            <TouchableOpacity
              key={pos}
              style={positionStyles.selectedChip}
              onPress={() => toggle(pos)}
              activeOpacity={0.75}
            >
              <Text style={positionStyles.selectedChipText}>{pos}</Text>
              <X size={11} color={Colors.accent} strokeWidth={2.5} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Toutes les options */}
      <View style={positionStyles.optionsGrid}>
        {POSITION_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.key);
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                positionStyles.optionChip,
                isSelected && positionStyles.optionChipActive,
              ]}
              onPress={() => toggle(opt.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  positionStyles.optionChipText,
                  isSelected && positionStyles.optionChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const positionStyles = StyleSheet.create({
  container: { gap: 8 },
  label: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  selectedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedChipText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  optionChipActive: {
    backgroundColor: Colors.pillActive,
    borderColor: Colors.borderActive,
  },
  optionChipText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  optionChipTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
