import { useUserStats } from "@/src/hooks/useUserStats";
import { Group } from "@/src/types";
import React from "react";
import { View } from "react-native";
import { Colors } from "../../constants/colors";
import { ProgressBar } from "../ui/ProgressBar";

const GroupProgressItem = React.memo(({ group }: { group: Group }) => {
  const stats = useUserStats({ groupId: group.id });

  return (
    <ProgressBar
      label={group.name}
      current={stats.ownedPhotocards}
      total={group.totalPhotocards ?? 0}
    />
  );
});

interface CollectionProgressProps {
  groups: Group[];
}

export const CollectionProgress: React.FC<CollectionProgressProps> = ({
  groups,
}) => {
  // Total global depuis les stats BDD — pas besoin de recalculer
  const totalCards = groups.reduce(
    (acc, g) => acc + (g.totalPhotocards ?? 0),
    0,
  );
  const totalCollected = groups.reduce(
    (acc, g) => acc + (g.ownedPhotocards ?? 0),
    0,
  );

  return (
    <View>
      {groups.map((group) => (
        <GroupProgressItem key={group.id} group={group} />
      ))}
      <ProgressBar
        label="Total"
        current={totalCollected}
        total={totalCards}
        accentColor={Colors.accent}
      />
    </View>
  );
};
