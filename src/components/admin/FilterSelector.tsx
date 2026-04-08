// ─── Sous-composant : sélecteur de filtre ─────────────────────────────────────

import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { ChevronRight } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterSelectorProps {
  label: string;
  value: string | null;
  placeholder: string;
  options: { id: string; label: string; sublabel?: string }[];
  onSelect: (id: string | null) => void;
  disabled?: boolean;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  label,
  value,
  placeholder,
  options,
  onSelect,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);
  const selected = options.find((o) => o.id === value);

  const handleOpen = () => {
    if (disabled) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <View style={filterStyles.container}>
      <Text style={filterStyles.label}>{label}</Text>
      <TouchableOpacity
        ref={triggerRef}
        style={[
          filterStyles.trigger,
          disabled && filterStyles.triggerDisabled,
          value && filterStyles.triggerActive,
        ]}
        onPress={handleOpen}
        activeOpacity={disabled ? 1 : 0.75}
      >
        <Text
          style={[
            filterStyles.triggerText,
            !selected && filterStyles.placeholder,
            disabled && filterStyles.placeholderDisabled,
          ]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        {selected ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={filterStyles.clearBtn}>✕</Text>
          </TouchableOpacity>
        ) : (
          <ChevronRight
            size={14}
            color={disabled ? Colors.surface2 : Colors.textMuted}
            strokeWidth={1.6}
          />
        )}
      </TouchableOpacity>

      {/* Dropdown */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Overlay pour fermer au clic extérieur */}
        <TouchableOpacity
          style={filterStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          {/* Dropdown positionné exactement sous le trigger */}
          <View
            style={[
              filterStyles.dropdown,
              {
                top: triggerLayout.y + triggerLayout.height + 4,
                left: triggerLayout.x,
                width: triggerLayout.width,
              },
            ]}
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Option "Tous" uniquement pour le membre */}
              {label === "Membre" && (
                <TouchableOpacity
                  style={[
                    filterStyles.option,
                    value === null && filterStyles.optionActive,
                  ]}
                  onPress={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      filterStyles.optionText,
                      value === null && filterStyles.optionTextActive,
                    ]}
                  >
                    Tous les membres
                  </Text>
                  {value === null && (
                    <Text style={filterStyles.optionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}

              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    filterStyles.option,
                    value === opt.id && filterStyles.optionActive,
                  ]}
                  onPress={() => {
                    onSelect(opt.id);
                    setOpen(false);
                  }}
                >
                  <View style={filterStyles.optionContent}>
                    <Text
                      style={[
                        filterStyles.optionText,
                        value === opt.id && filterStyles.optionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {opt.sublabel && (
                      <Text style={filterStyles.optionSublabel}>
                        {opt.sublabel}
                      </Text>
                    )}
                  </View>
                  {value === opt.id && (
                    <Text style={filterStyles.optionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const filterStyles = StyleSheet.create({
  container: { gap: 6, zIndex: 1 },
  label: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    gap: 8,
  },
  triggerDisabled: {
    opacity: 0.4,
  },
  triggerActive: {
    borderColor: Colors.borderActive,
    backgroundColor: Colors.pillActive,
  },
  triggerText: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  placeholder: { color: Colors.textMuted },
  placeholderDisabled: { color: Colors.surface2 },
  clearBtn: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  optionActive: { backgroundColor: Colors.pillActive },
  optionContent: { flex: 1, gap: 2 },
  optionText: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  optionTextActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  optionSublabel: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
  },
  optionCheck: {
    color: Colors.accent,
    fontSize: Theme.fontSize.base,
  },
});
