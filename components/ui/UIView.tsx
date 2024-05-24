import { View, type ViewProps } from "react-native";

import { useTheme } from "@/theme/ctx";

export type Props = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

const UIView = ({ style, lightColor, darkColor, ...otherProps }: Props) => {
  const { themeColors: colorTheme } = useTheme();
  const backgroundColor = colorTheme.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
};

export default UIView;
