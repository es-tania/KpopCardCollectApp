import React from "react";
import { View } from "react-native";
import { Colors } from "../../constants/colors";
import { GroupWithProgress } from "../../types";
import { ProgressBar } from "../ui/ProgressBar";

interface CollectionProgressProps {
  groups: GroupWithProgress[];
}

export const CollectionProgress: React.FC<CollectionProgressProps> = ({
  groups,
}) => {
  const totalCollected = groups.reduce((acc, g) => acc + g.collectedCount, 0);
  const totalCards = groups.reduce((acc, g) => acc + g.totalPhotocards, 0);

  return (
    <View>
      {groups.map((group) => (
        <ProgressBar
          key={group.id}
          label={group.name}
          current={group.collectedCount}
          total={group.totalPhotocards}
        />
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
