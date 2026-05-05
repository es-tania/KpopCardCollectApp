import { Colors } from "@/src/constants/colors";
import { PHOTOCARD_FILTER_OPTIONS } from "@/src/constants/options";
import { Theme } from "@/src/constants/theme";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Member,
    PhotocardType,
    PhotocardTypeFilter,
    PhotocardWithDetails,
} from "../../types";
import { MembersList } from "../member/MembersList";
import { QuickFilterChips } from "../ui/QuickFilterChips";
import { PhotocardMini } from "./PhotocardMini";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlbumSection {
  albumId: string;
  albumTitle: string;
  coverUrl?: any;
  cards: PhotocardWithDetails[];
  owned: number;
  total: number;
}

interface PhotocardsByAlbumProps {
  cards: PhotocardWithDetails[];
  onPressCard?: (card: PhotocardWithDetails) => void;
  ListHeaderComponent?: React.ReactElement;
  defaultExpanded?: boolean;
  activeType?: PhotocardTypeFilter;
  onTypeChange?: (type: PhotocardTypeFilter) => void;
  members?: Member[];
  groupId?: string;
}

const NUM_COLUMNS = 3;

// ─── Row de cartes ────────────────────────────────────────────────────────────

const CardRow = React.memo(
  ({
    row,
    onPressCard,
  }: {
    row: PhotocardWithDetails[];
    onPressCard?: (card: PhotocardWithDetails) => void;
  }) => (
    <View style={styles.row}>
      {row.map((card) => (
        <View key={card.id} style={styles.cardWrap}>
          <PhotocardMini card={card} onPress={() => onPressCard?.(card)} />
        </View>
      ))}
      {row.length < NUM_COLUMNS &&
        Array(NUM_COLUMNS - row.length)
          .fill(null)
          .map((_, i) => <View key={`empty-${i}`} style={styles.cardWrap} />)}
    </View>
  ),
);

// ─── Header d'album ───────────────────────────────────────────────────────────

const AlbumHeader = React.memo(
  ({
    section,
    expanded,
    onToggle,
  }: {
    section: AlbumSection;
    expanded: boolean;
    onToggle: () => void;
  }) => {
    const pct =
      section.total > 0 ? Math.round((section.owned / section.total) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.albumHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        {/* Cover */}
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

        {/* Infos */}
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle} numberOfLines={1}>
            {section.albumTitle}
          </Text>
        </View>

        {/* Toggle */}
        <View style={styles.albumToggle}>
          {expanded ? (
            <ChevronUp size={16} color={Colors.textMuted} strokeWidth={1.6} />
          ) : (
            <ChevronDown size={16} color={Colors.textMuted} strokeWidth={1.6} />
          )}
          <Text style={styles.albumToggleCount}>{section.cards.length}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

// ─── Composant principal ──────────────────────────────────────────────────────

export const PhotocardsByAlbum: React.FC<PhotocardsByAlbumProps> = ({
  cards,
  onPressCard,
  ListHeaderComponent,
  defaultExpanded = false,
  activeType,
  onTypeChange,
  members,
  groupId,
}) => {
  const [activeMemberId, setActiveMemberId] = useState<string | undefined>(
    undefined,
  );

  // ── Groupe les cartes par album ───────────────────────────────────────
  const [localActiveType, setLocalActiveType] =
    useState<PhotocardTypeFilter>("all");
  const currentType = activeType ?? localActiveType;
  const setCurrentType = onTypeChange ?? setLocalActiveType;

  // ── Types disponibles ─────────────────────────────────────────────────
  const availableTypes = useMemo(() => {
    const types = new Set(cards.map((c) => c.type));
    return PHOTOCARD_FILTER_OPTIONS.filter(
      (opt) => opt.key === "all" || types.has(opt.key as PhotocardType),
    );
  }, [cards]);

  // ── Filtre les cartes par type avant de grouper par album ─────────────
  const filteredCards = useMemo(() => {
    let filtered = cards;
    if (currentType !== "all") {
      filtered = filtered.filter((c) => c.type === currentType);
    }
    if (activeMemberId) {
      filtered = filtered.filter(
        (c) =>
          c.memberId === activeMemberId ||
          c.cardMembers?.some((m) => m.id === activeMemberId),
      );
    }
    return filtered;
  }, [cards, currentType, activeMemberId]);

  const sections = useMemo<AlbumSection[]>(() => {
    const map = new Map<string, AlbumSection>();
    filteredCards.forEach((card) => {
      if (!map.has(card.albumId)) {
        map.set(card.albumId, {
          albumId: card.albumId,
          albumTitle: card.albumTitle,
          coverUrl: (card as any).albumCoverUrl ?? null,
          cards: [],
          owned: 0,
          total: 0,
        });
      }
      const section = map.get(card.albumId)!;
      section.cards.push(card);
      section.total++;
      if (card.isInCollection) section.owned++;
    });

    return Array.from(map.values()).sort((a, b) =>
      a.albumTitle.localeCompare(b.albumTitle),
    );
  }, [filteredCards]);

  // ── État expand par section ───────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    defaultExpanded ? new Set(sections.map((s) => s.albumId)) : new Set(),
  );

  const toggleSection = useCallback((albumId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(albumId) ? next.delete(albumId) : next.add(albumId);
      return next;
    });
  }, []);

  const expandAll = useCallback(
    () => setExpanded(new Set(sections.map((s) => s.albumId))),
    [sections],
  );
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  // ── Rows de cartes par section ────────────────────────────────────────
  const sectionRows = useMemo(
    () =>
      sections.map((section) => {
        const rows: PhotocardWithDetails[][] = [];
        for (let i = 0; i < section.cards.length; i += NUM_COLUMNS) {
          rows.push(section.cards.slice(i, i + NUM_COLUMNS));
        }
        return { ...section, rows };
      }),
    [sections],
  );

  const renderSection = useCallback(
    ({ item }: { item: (typeof sectionRows)[number] }) => {
      const isExpanded = expanded.has(item.albumId);
      return (
        <View style={styles.section}>
          <AlbumHeader
            section={item}
            expanded={isExpanded}
            onToggle={() => toggleSection(item.albumId)}
          />
          {isExpanded && (
            <View style={styles.sectionCards}>
              {item.rows.map((row, i) => (
                <CardRow
                  key={`${item.albumId}-${i}`}
                  row={row}
                  onPressCard={onPressCard}
                />
              ))}
            </View>
          )}
        </View>
      );
    },
    [expanded, toggleSection, onPressCard],
  );

  const ListHeader = useMemo(
    () => (
      <>
        {ListHeaderComponent}
        {members && members.length > 1 && (
          <View style={styles.membersSection}>
            <MembersList
              members={members}
              selectedId={activeMemberId}
              showStats={false}
              onPressMember={(m) =>
                setActiveMemberId((prev) => (prev === m.id ? undefined : m.id))
              }
            />
          </View>
        )}

        {availableTypes.length > 1 && (
          <QuickFilterChips
            options={availableTypes}
            selected={currentType}
            onSelect={(k) => setCurrentType(k as PhotocardTypeFilter)}
          />
        )}
        {sections.length > 1 && (
          <View style={styles.controls}>
            <TouchableOpacity onPress={expandAll} style={styles.controlBtn}>
              <Text style={styles.controlText}>Tout déplier</Text>
            </TouchableOpacity>
            <View style={styles.controlDivider} />
            <TouchableOpacity onPress={collapseAll} style={styles.controlBtn}>
              <Text style={styles.controlText}>Tout replier</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    ),
    [
      ListHeaderComponent,
      availableTypes,
      currentType,
      sections.length,
      expandAll,
      collapseAll,
    ],
  );

  if (sections.length === 0) {
    return (
      <>
        {ListHeaderComponent}
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🃏</Text>
          <Text style={styles.emptyText}>Aucune carte</Text>
        </View>
      </>
    );
  }

  return (
    <FlatList
      data={sectionRows}
      renderItem={renderSection}
      keyExtractor={(item) => item.albumId}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={<View style={styles.footer} />}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={4}
      windowSize={8}
    />
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Section
  section: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },

  // Header d'album
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

  albumInfo: { flex: 1, gap: 4 },
  albumTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  albumMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  albumCount: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },
  albumCountOwned: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.semibold,
  },
  albumCountSep: {
    color: Colors.border,
  },
  albumPctBadge: {
    backgroundColor: "rgba(145,126,255,0.12)",
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 0.5,
    borderColor: Colors.accent + "40",
  },
  albumPctText: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.surface2,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressFillComplete: {
    backgroundColor: "#4ADE80",
  },

  membersSection: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: Theme.spacing.lg,
  },

  albumToggle: {
    alignItems: "center",
    gap: 2,
  },
  albumToggleCount: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },

  // Cartes
  sectionCards: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: 8,
    backgroundColor: Colors.bg,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cardWrap: { flex: 1 },

  // Contrôles
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  controlBtn: { paddingVertical: Theme.spacing.xs },
  controlDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: Theme.spacing.md,
  },
  controlText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },

  // Empty
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: { fontSize: 28 },
  emptyText: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },

  footer: { height: 40 },
});
