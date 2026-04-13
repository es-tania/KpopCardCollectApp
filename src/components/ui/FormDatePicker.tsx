import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Theme } from "../../constants/theme";

interface FormDatePickerProps {
  label: string;
  value: string; // format "YYYY-MM-DD"
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

// Formate une Date en "YYYY-MM-DD"
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Formate pour l'affichage "DD/MM/YYYY"
const formatDisplay = (dateStr: string): string => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

// Parse "YYYY-MM-DD" en Date
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Sélectionner une date",
  required,
  error,
  minDate,
  maxDate,
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? parseDate(value) : new Date(),
  );

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
      if (event.type === "set" && date) {
        onChange(formatDate(date));
      }
      return;
    }
    // iOS — mise à jour en temps réel
    if (date) setTempDate(date);
  };

  const handleConfirmIOS = () => {
    onChange(formatDate(tempDate));
    setShow(false);
  };

  const handleClear = () => {
    onChange("");
    setShow(false);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Trigger */}
      <TouchableOpacity
        style={[styles.trigger, !!error && styles.triggerError]}
        onPress={() => {
          setTempDate(value ? parseDate(value) : new Date());
          setShow(true);
        }}
        activeOpacity={0.75}
      >
        <Calendar
          size={16}
          color={value ? Colors.text : Colors.textMuted}
          strokeWidth={1.6}
        />
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? formatDisplay(value) : placeholder}
        </Text>
        {value && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color={Colors.textMuted} strokeWidth={1.8} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Erreur */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Picker Android — natif direct */}
      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}

      {/* Picker iOS — dans un Modal */}
      {Platform.OS === "ios" && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShow(false)}
          >
            <View style={styles.modalContent}>
              {/* Header modal */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleClear}>
                  <Text style={styles.modalClear}>Effacer</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text style={styles.modalConfirm}>Confirmer</Text>
                </TouchableOpacity>
              </View>

              {/* Picker */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                locale="fr-FR"
                style={styles.picker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  required: { color: Colors.danger },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
  },
  triggerError: {
    borderColor: Colors.danger,
  },
  triggerText: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  error: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.danger,
  },

  // Modal iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingBottom: 34, // safe area iOS
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  modalClear: {
    fontSize: Theme.fontSize.base,
    color: Colors.danger,
  },
  modalConfirm: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.semibold,
  },
  picker: {
    backgroundColor: Colors.surface,
  },
});
