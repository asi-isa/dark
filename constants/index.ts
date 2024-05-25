import { Appearance, Dimensions } from "react-native";
import { vec } from "@shopify/react-native-skia";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("screen");

const CORNERS = [vec(0, 0), vec(WIDTH, 0), vec(WIDTH, HEIGHT), vec(0, HEIGHT)];

const OSTheme = Appearance.getColorScheme() ?? "light";

export { WIDTH, HEIGHT, CORNERS, OSTheme };
