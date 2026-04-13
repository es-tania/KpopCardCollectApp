import { GroupAlphaList } from "@/src/components/group";
import { PhotocardModal } from "@/src/components/photocard/PhotocardModal";
import {
  SearchAlbumResult,
  SearchBar,
  SearchGroupResult,
  SearchMemberResult,
  SearchPhotocardResult,
  SearchSectionHeader,
} from "@/src/components/search";
import { Theme } from "@/src/constants/theme";
import { useGroups } from "@/src/hooks/group/useGroups";
import { useFollowedGroups } from "@/src/hooks/useFollowedGroups";
import { useSearch } from "@/src/hooks/useSearch";
import { useUserCollection } from "@/src/hooks/useUserCollection";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { PhotocardWithDetails } from "../../src/types";

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);

  const { groups: allGroups, loading: groupsLoading } = useGroups();
  const { results, loading, query, search, clear } = useSearch();
  const { followedIds, toggleFollow } = useFollowedGroups();
  const { collectionIds, favoriteIds, wishlistIds } = useUserCollection();

  const [selectedCard, setSelectedCard] = useState<PhotocardWithDetails | null>(
    null,
  );

  // Debounce
  const [inputValue, setInputValue] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChangeText = useCallback(
    (text: string) => {
      setInputValue(text); // ← mise à jour immédiate de l'affichage

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        search(text); // ← recherche après 300ms
      }, 300);
    },
    [search],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    clear();
    inputRef.current?.clear();
  }, [clear]);

  const enrichedPhotocards = useMemo(
    () =>
      results.photocards.map((card) => ({
        ...card,
        isInCollection: collectionIds.has(card.id),
        isFavorite: favoriteIds.has(card.id),
        isWishlisted: wishlistIds.has(card.id),
      })),
    [results.photocards, collectionIds, favoriteIds, wishlistIds],
  );

  const hasResults =
    results.groups.length > 0 ||
    results.members.length > 0 ||
    results.albums.length > 0 ||
    results.photocards.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SearchBar
        ref={inputRef}
        value={inputValue}
        onChangeText={handleChangeText}
        onClear={handleClear}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : !inputValue.trim() ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.defaultHeader}>
            <Text style={styles.defaultTitle}>Tous les groupes</Text>
            <Text style={styles.defaultCount}>{allGroups.length}</Text>
          </View>

          {groupsLoading ? (
            <ActivityIndicator
              color={Colors.accent}
              style={styles.loadingCenter}
            />
          ) : (
            <GroupAlphaList
              groups={allGroups}
              onPressGroup={(id) => router.push(`/group/${id}`)}
            />
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {results.groups.length > 0 && (
            <>
              <SearchSectionHeader
                title="Groupes"
                count={results.groups.length}
              />
              {results.groups.map((group) => (
                <SearchGroupResult
                  key={group.id}
                  group={group}
                  isFollowing={followedIds.has(group.id)}
                  onPress={() => router.push(`/group/${group.id}`)}
                  onFollow={() => toggleFollow(group.id)}
                />
              ))}
            </>
          )}

          {results.members.length > 0 && (
            <>
              <SearchSectionHeader
                title="Membres"
                count={results.members.length}
              />
              {results.members.map((member) => (
                <SearchMemberResult
                  key={member.id}
                  member={member}
                  onPress={() =>
                    router.push(
                      `/member/${member.id}?groupId=${member.groupId}`,
                    )
                  }
                />
              ))}
            </>
          )}

          {results.albums.length > 0 && (
            <>
              <SearchSectionHeader
                title="Albums"
                count={results.albums.length}
              />
              {results.albums.map((album) => (
                <SearchAlbumResult
                  key={album.id}
                  album={album}
                  onPress={() =>
                    router.push(`/album/${album.id}?groupId=${album.groupId}`)
                  }
                />
              ))}
            </>
          )}

          {enrichedPhotocards.length > 0 && (
            <>
              <SearchSectionHeader
                title="Photocards"
                count={enrichedPhotocards.length}
              />
              {enrichedPhotocards.map((card) => (
                <SearchPhotocardResult
                  key={card.id}
                  card={card}
                  onPress={() => setSelectedCard(card)}
                />
              ))}
            </>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      <PhotocardModal
        card={selectedCard}
        visible={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  bottomPad: { height: 40 },
  defaultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  defaultTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  defaultCount: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
  loadingCenter: {
    paddingVertical: Theme.spacing.xl,
  },
});
