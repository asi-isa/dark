import { useRef } from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "./ctx";

const ThemeSwitch = () => {
  const { themeName, themeColors, toggleThemeWithTransition, isTransitioning } =
    useTheme();
  const ref = useRef<View>(null);

  const onPress = () => {
    // start animation from the center of the button
    ref.current!.measure((x, y, width, height, pageX, pageY) => {
      const centerX = pageX + width / 2;
      const centerY = pageY + height / 2;

      toggleThemeWithTransition(centerX, centerY);
    });
  };

  return (
    <View ref={ref}>
      <Pressable
        onPress={onPress}
        style={{ padding: 16 }}
        disabled={isTransitioning}
      >
        <Feather
          name={themeName === "dark" ? "sun" : "moon"}
          size={24}
          color={themeColors.text}
        />
      </Pressable>
    </View>
  );
};
export default ThemeSwitch;
