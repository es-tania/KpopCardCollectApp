import { useNotificationsStore } from "@/src/store/notificationsStore";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  CreditCard,
  Disc3,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";
import { AppNotification } from "../../src/store/notificationsStore";

// ─── Config par type ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { color: string; Icon: any; isApproved: boolean }
> = {
  photocard_approved: {
    color: Colors.accent,
    Icon: CreditCard,
    isApproved: true,
  },
  photocard_rejected: {
    color: Colors.danger,
    Icon: CreditCard,
    isApproved: false,
  },
  album_approved: { color: Colors.accent, Icon: Disc3, isApproved: true },
  album_rejected: { color: Colors.danger, Icon: Disc3, isApproved: false },
  group_approved: { color: Colors.accent, Icon: Users, isApproved: true },
  group_rejected: { color: Colors.danger, Icon: Users, isApproved: false },
  new_photocard_submission: {
    color: Colors.warning,
    Icon: CreditCard,
    isApproved: false,
  },
  new_album_submission: {
    color: Colors.warning,
    Icon: Disc3,
    isApproved: false,
  },
  new_group_submission: {
    color: Colors.warning,
    Icon: Users,
    isApproved: false,
  },
};

// ─── Ligne notification ───────────────────────────────────────────────────────

const NotifRow: React.FC<{ notif: AppNotification; onPress: () => void }> = ({
  notif,
  onPress,
}) => {
  const cfg = TYPE_CONFIG[notif.type] ?? {
    color: Colors.accent,
    Icon: Bell,
    isApproved: false,
  };
  const { Icon, color, isApproved } = cfg;
  const isNew = notif.type.startsWith("new_");

  return (
    <TouchableOpacity
      style={[styles.row, !notif.read && styles.rowUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* ── Icône ── */}
      <View style={[styles.iconWrap, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} strokeWidth={1.8} />
        {/* Badge statut — seulement pour approved/rejected */}
        {!isNew && (
          <View style={[styles.statusDot, { backgroundColor: color }]}>
            {isApproved ? (
              <Check size={8} color="#fff" strokeWidth={3} />
            ) : (
              <X size={8} color="#fff" strokeWidth={3} />
            )}
          </View>
        )}
      </View>

      {/* ── Texte ── */}
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {notif.title}
        </Text>
        {notif.data?.entity_name ? (
          <Text style={styles.body} numberOfLines={1}>
            {notif.data.entity_name}
          </Text>
        ) : notif.body ? (
          <Text style={styles.body} numberOfLines={1}>
            {notif.body}
          </Text>
        ) : null}
        {notif.data?.reject_reason && (
          <Text style={styles.reason} numberOfLines={2}>
            Raison : {notif.data.reject_reason}
          </Text>
        )}
        <Text style={styles.date}>
          {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {!notif.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { notifications, unreadCount, loading, fetch, markRead, markAllRead } =
    useNotificationsStore();

  useEffect(() => {
    fetch();
  }, []);

  const handlePress = (notif: AppNotification) => {
    if (!notif.read) markRead(notif.id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        {/* <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity> */}
        <Text style={styles.navTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.navBtn} onPress={markAllRead}>
            <CheckCheck size={18} color={Colors.accent} strokeWidth={1.8} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navBtn} />
        )}
      </View>

      {/* ── Sous-titre ── */}
      {unreadCount > 0 && (
        <View style={styles.unreadBar}>
          <Text style={styles.unreadText}>
            <Text style={styles.unreadCount}>{unreadCount}</Text> non lue
            {unreadCount > 1 ? "s" : ""}
          </Text>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllBtn}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifRow notif={item} onPress={() => handlePress(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyContainer : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BellOff size={48} color={Colors.textMuted} strokeWidth={1.2} />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySub}>
                Tu seras notifié quand tes soumissions seront traitées.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  unreadBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  unreadText: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  unreadCount: { color: Colors.accent, fontWeight: Theme.fontWeight.semibold },
  markAllBtn: { fontSize: Theme.fontSize.sm + 1, color: Colors.accent },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowUnread: { backgroundColor: `${Colors.accent}08` },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  },
  emoji: { fontSize: 20 },
  statusDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.bg,
  },
  textWrap: { flex: 1, gap: 2 },
  title: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  body: { fontSize: Theme.fontSize.sm + 1, color: Colors.textMuted },
  reason: { fontSize: Theme.fontSize.sm + 1, color: Colors.danger },
  date: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginTop: 4,
    flexShrink: 0,
  },
  emptyContainer: { flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  emptySub: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
