import { Group } from "@/src/types";
import React from "react";
import { View } from "react-native";
import { Colors } from "../../constants/colors";
import { ProgressBar } from "../ui/ProgressBar";

interface CollectionProgressProps {
  groups: Group[];
}

export const CollectionProgress: React.FC<CollectionProgressProps> = ({
  groups,
}) => {
  const totalCollected = groups.reduce(
    (acc, g) => acc + (g.ownedPhotocards ?? 0),
    0,
  );

  const totalCards = groups.reduce(
    (acc, g) => acc + (g.totalPhotocards ?? 0),
    0,
  );

  return (
    <View>
      {groups.map((group) => (
        <ProgressBar
          key={group.id}
          label={group.name}
          current={group.ownedPhotocards ?? 0}
          total={group.totalPhotocards ?? 0}
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
