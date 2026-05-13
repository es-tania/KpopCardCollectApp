import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PhotocardWithDetails } from "../../types";
import { AlbumCardRow } from "./AlbumCardRow";
import { AlbumSectionPagination } from "./AlbumSectionPagination";

const NUM_COLUMNS = 3;
const PAGE_SIZE = 12;

interface StaticSection {
  albumId: string;
  albumTitle: string;
  coverUrl?: any;
  cards: PhotocardWithDetails[];
}

interface AlbumSectionStaticProps {
  section: StaticSection;
  expanded: boolean;
  onToggle: () => void;
  onPressCard?: (card: PhotocardWithDetails) => void;
}

export const AlbumSectionStatic: React.FC<AlbumSectionStaticProps> = ({
  section,
  expanded,
  onToggle,
  onPressCard,
}) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(section.cards.length / PAGE_SIZE);
  const pageCards = section.cards.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

  const rows: PhotocardWithDetails[][] = [];
  for (let i = 0; i < pageCards.length; i += NUM_COLUMNS) {
    rows.push(pageCards.slice(i, i + NUM_COLUMNS));
  }

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.albumHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.albumCoverWrap}>
          {section.coverUrl ? (
            <Image
              source={
                typeof section.coverUrl === "string"
                  ? { uri: section.coverUrl }
                  : section.coverUrl
              }
              style={styles.albumCover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.albumCoverFallback}>
              <Text style={styles.albumCoverEmoji}>📀</Text>
            </View>
          )}
        </View>
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle} numberOfLines={1}>
            {section.albumTitle}
          </Text>
          <Text style={styles.albumSubtitle}>
            {section.cards.length} carte{section.cards.length !== 1 ? "s" : ""}
            {totalPages > 1 && ` · page ${page + 1}/${totalPages}`}
          </Text>
        </View>
        <View style={styles.albumToggle}>
          {expanded ? (
            <ChevronUp size={16} color={Colors.textMuted} strokeWidth={1.6} />
          ) : (
            <ChevronDown size={16} color={Colors.textMuted} strokeWidth={1.6} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.sectionCards}>
          {rows.map((row, i) => (
            <AlbumCardRow
              key={`${section.albumId}-${page}-${i}`}
              row={row}
              onPressCard={onPressCard}
            />
          ))}
          <AlbumSectionPagination
            page={page}
            totalPages={totalPages}
            onPage={setPage}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  albumHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.surface,
  },
  albumCoverWrap: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  albumCover: { width: "100%", height: "100%" },
  albumCoverFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  albumCoverEmoji: { fontSize: 20 },
  albumInfo: { flex: 1, gap: 2 },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  albumSubtitle: { fontSize: Theme.fontSize.xs + 1, color: Colors.textMuted },
  albumToggle: { alignItems: "center" },
  sectionCards: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: 8,
    backgroundColor: Colors.bg,
  },
});
