import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AlbumSectionPaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

export const AlbumSectionPagination: React.FC<AlbumSectionPaginationProps> = ({
  page,
  totalPages,
  onPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
        onPress={() => onPage(Math.max(0, page - 1))}
        disabled={page === 0}
      >
        <ChevronLeft
          size={14}
          color={page === 0 ? Colors.textMuted : Colors.accent}
          strokeWidth={2}
        />
      </TouchableOpacity>

      <View style={styles.pageNumbers}>
        {Array.from({ length: totalPages }, (_, i) => {
          if (
            totalPages <= 5 ||
            i === 0 ||
            i === totalPages - 1 ||
            Math.abs(i - page) <= 1
          ) {
            return (
              <TouchableOpacity
                key={i}
                style={[styles.pageNum, i === page && styles.pageNumActive]}
                onPress={() => onPage(i)}
              >
                <Text
                  style={[
                    styles.pageNumText,
                    i === page && styles.pageNumTextActive,
                  ]}
                >
                  {i + 1}
                </Text>
              </TouchableOpacity>
            );
          }
          if (Math.abs(i - page) === 2) {
            return (
              <Text key={i} style={styles.pageDots}>
                …
              </Text>
            );
          }
          return null;
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.pageBtn,
          page === totalPages - 1 && styles.pageBtnDisabled,
        ]}
        onPress={() => onPage(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
      >
        <ChevronRight
          size={14}
          color={page === totalPages - 1 ? Colors.textMuted : Colors.accent}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    marginTop: Theme.spacing.sm,
  },
  pageBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageNumbers: { flexDirection: "row", alignItems: "center", gap: 4 },
  pageNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  pageNumActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pageNumText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  pageNumTextActive: { color: Colors.bg, fontWeight: "600" },
  pageDots: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: 2,
  },
});
