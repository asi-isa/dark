import UIText from "@/components/ui/UIText";
import UIView from "@/components/ui/UIView";
import { useTheme } from "@/theme/ctx";
import { Button, Text, View } from "react-native";

export default function Index() {
  const { themeName, toggleTheme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>

      <UIView style={{ padding: 44 }}>
        <UIText>hei</UIText>
      </UIView>

      <Button
        title={`switch theme to ${themeName === "dark" ? "light" : "dark"}`}
        onPress={() => {
          toggleTheme();
        }}
      />
    </View>
  );
}
