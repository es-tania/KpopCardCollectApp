import { Colors } from "@/src/constants/colors";
import { Theme } from "@/src/constants/theme";
import { Member } from "@/src/types";
import { formatDate, getAge } from "@/src/utils/date";
import { Image, StyleSheet, Text, View } from "react-native";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";

interface MemberHeaderProps {
  member: Member;
}

export const MemberHeader: React.FC<MemberHeaderProps> = ({ member }) => {
  const age = getAge(member.birthDate);
  const completionPct =
    member.totalPhotocards && member.totalPhotocards > 0
      ? Math.round(
          ((member.ownedPhotocards ?? 0) / member.totalPhotocards) * 100,
        )
      : 0;

  return (
    <View style={headerStyles.container}>
      {/* Photo + infos côte à côte */}
      <View style={headerStyles.topRow}>
        <View style={headerStyles.photoWrap}>
          {member.photoUrl ? (
            <Image
              source={
                typeof member.photoUrl === "string"
                  ? { uri: member.photoUrl }
                  : (member.photoUrl as any)
              }
              style={headerStyles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={headerStyles.photoFallback}>
              <Text style={headerStyles.photoInitial}>
                {member.stageName[0]}
              </Text>
            </View>
          )}
        </View>

        <View style={headerStyles.infoCol}>
          <Text style={headerStyles.stageName}>{member.stageName}</Text>
          {member.koreanName && (
            <Text style={headerStyles.koreanName}>{member.koreanName}</Text>
          )}
          {member.realName && (
            <Text style={headerStyles.realName}>{member.realName}</Text>
          )}
          {member.position && member.position.length > 0 && (
            <View style={headerStyles.positions}>
              {member.position.map((p) => (
                <Badge key={p} label={p} />
              ))}
            </View>
          )}
          {member.birthDate && (
            <Text style={headerStyles.birthDate}>
              🎂 {formatDate(member.birthDate)}
              {age !== null ? ` (${age} ans)` : ""}
            </Text>
          )}
        </View>
      </View>

      {/* Stats collection du membre */}
      <View style={headerStyles.statsRow}>
        <View style={headerStyles.statItem}>
          <Text style={headerStyles.statNum}>
            {member.ownedPhotocards ?? 0}
          </Text>
          <Text style={headerStyles.statLabel}>Collectées</Text>
        </View>
        <View style={headerStyles.statDivider} />
        <View style={headerStyles.statItem}>
          <Text style={headerStyles.statNum}>
            {member.totalPhotocards ?? 0}
          </Text>
          <Text style={headerStyles.statLabel}>Total</Text>
        </View>
        <View style={headerStyles.statDivider} />
        <View style={headerStyles.statItem}>
          <Text style={[headerStyles.statNum, { color: Colors.accent }]}>
            {member.wishlistPhotocards ?? 0}
          </Text>
          <Text style={headerStyles.statLabel}>Souhaits</Text>
        </View>
        <View style={headerStyles.statDivider} />
        <View style={headerStyles.statItem}>
          <Text style={[headerStyles.statNum, { color: Colors.accent }]}>
            {completionPct}%
          </Text>
          <Text style={headerStyles.statLabel}>Complétion</Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={headerStyles.progressRow}>
        <View style={{ flex: 1 }}>
          <ProgressBar
            label=""
            current={member.ownedPhotocards ?? 0}
            total={member.totalPhotocards ?? 0}
          />
        </View>
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  photoWrap: {
    width: 90,
    height: 110,
    borderRadius: Theme.borderRadius.md,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: Colors.surface2,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    fontSize: 36,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.accent,
  },
  infoCol: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  stageName: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  koreanName: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  realName: {
    fontSize: Theme.fontSize.base,
    color: Colors.textMuted,
  },
  positions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  birthDate: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: Colors.border,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pct: {
    fontSize: Theme.fontSize.sm,
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
    minWidth: 34,
    textAlign: "right",
  },
});
