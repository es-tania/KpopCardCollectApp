import { AlbumSectionPagination } from "@/src/components/album/AlbumSectionPagination";
import { SubmissionRow } from "@/src/components/submissions/SubmissionRow";
import { useSubmissionsPaginated } from "@/src/hooks/useSubmissionsPaginated";
import { useTranslation } from "@/src/hooks/useTranslation";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../src/constants/colors";
import { Theme } from "../src/constants/theme";

export default function MySubmissionsScreen() {
  const { t } = useTranslation();
  const {
    submissions,
    totalCount,
    totalPages,
    page,
    loading,
    pageLoading,
    handlePage,
  } = useSubmissionsPaginated({ mode: "mine" });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("submissions.title")}</Text>
        <View style={styles.navBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <>
          {totalCount > 0 && (
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                <Text style={styles.infoCount}>{totalCount}</Text> soumission
                {totalCount !== 1 ? "s" : ""}
                {totalPages > 1 && ` · page ${page + 1}/${totalPages}`}
              </Text>
            </View>
          )}

          {pageLoading ? (
            <View style={styles.pageLoadingWrap}>
              <ActivityIndicator color={Colors.accent} size="small" />
            </View>
          ) : (
            <FlatList
              data={submissions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SubmissionRow card={item} showStatus />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                submissions.length === 0
                  ? styles.emptyContainer
                  : styles.listContent
              }
              ListFooterComponent={
                totalPages > 1 ? (
                  <AlbumSectionPagination
                    page={page}
                    totalPages={totalPages}
                    onPage={handlePage}
                  />
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>📭</Text>
                  <Text style={styles.emptyTitle}>
                    {t("submissions.empty")}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {t("empty.noSubmissions")}
                  </Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() =>
                      router.push("/admin/add-photocard?userSubmission=true")
                    }
                  >
                    <Text style={styles.addBtnText}>
                      {t("admin.sections.addPhotocard")}
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  pageLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.xl,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },
  infoBar: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  infoCount: { color: Colors.accent, fontWeight: Theme.fontWeight.semibold },
  listContent: { paddingBottom: Theme.spacing.xl },
  emptyContainer: { flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
  },
  addBtn: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.pillActive,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  addBtnText: {
    fontSize: Theme.fontSize.base,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
