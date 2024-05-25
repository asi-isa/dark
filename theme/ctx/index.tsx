import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setStatusBarStyle } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Canvas,
  SkImage,
  dist,
  makeImageFromView,
  mix,
  Image,
  Circle,
  ImageShader,
} from "@shopify/react-native-skia";

import { Colors, type ColorThemeType, type ThemeName } from "../Colors";
import { wait } from "@/util";
import { AS_KEYS } from "@/util/async-storage";
import { CORNERS, HEIGHT, OSTheme, WIDTH } from "@/constants";

interface ThemeContextState {
  themeName: ThemeName;
  themeColors: ColorThemeType;
  isTransitioning: boolean;
  overlay1: SkImage | null;
  overlay2: SkImage | null;
}

const defaultState: ThemeContextState = {
  themeName: OSTheme,
  themeColors: Colors[OSTheme],
  isTransitioning: false,
  overlay1: null,
  overlay2: null,
};

interface ThemeContext extends ThemeContextState {
  toggleTheme: (themName?: ThemeName) => void;
  toggleThemeWithTransition: (x: number, y: number) => void;
}

const ThemeContext = createContext<ThemeContext | null>(null);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeState, setThemeState] = useState(defaultState);

  const ref = useRef(null);
  const circle = useSharedValue({ x: 0, y: 0, r: 0 });
  const transition = useSharedValue(0);

  const oppositeThemeName = () =>
    themeState.themeName === "dark" ? "light" : "dark";

  const toggleTheme = async (theme?: ThemeName) => {
    const themeName = theme ?? oppositeThemeName();

    setThemeState({
      themeName,
      themeColors: Colors[themeName],
      isTransitioning: false,
      overlay1: null,
      overlay2: null,
    });

    await AsyncStorage.setItem(AS_KEYS.themeName, themeName);
  };

  const toggleThemeWithTransition = async (x: number, y: number) => {
    setThemeState((currentState) => ({
      ...currentState,
      isTransitioning: true,
    }));

    // 0. Define the circle and its maximum radius
    const r = Math.max(...CORNERS.map((corner) => dist(corner, { x, y })));
    circle.value = { x, y, r };

    // 1. Take the screenshot
    const overlay1 = await makeImageFromView(ref);

    // 2. display it
    setThemeState((currentState) => ({ ...currentState, overlay1 }));

    // 3. switch to dark mode
    await wait(16);
    const newThemeName = oppositeThemeName();

    setThemeState((currentState) => ({
      ...currentState,
      themeName: newThemeName,
      themeColors: Colors[newThemeName],
    }));

    await AsyncStorage.setItem(AS_KEYS.themeName, newThemeName);

    // 4. wait for the dark mode to render
    await wait(16);

    // 5. take screenshot
    const overlay2 = await makeImageFromView(ref);
    setThemeState((currentState) => ({ ...currentState, overlay2 }));

    // 6. transition
    transition.value = 0;
    transition.value = withTiming(1, { duration: 650 });
    await wait(650);
    setThemeState((currentState) => ({
      ...currentState,
      isTransitioning: false,
      overlay1: null,
      overlay2: null,
    }));

    setStatusBarStyle(themeState.themeName, true);
  };

  // if the user has already set a theme, then use it
  useEffect(() => {
    (async () => {
      const themeName = (await AsyncStorage.getItem(
        AS_KEYS.themeName
      )) as ThemeName | null;

      if (themeName) {
        toggleTheme(themeName);
        setStatusBarStyle(themeName === "dark" ? "light" : "dark", true);
      }
    })();
  }, []);

  const r = useDerivedValue(() => {
    return mix(transition.value, 0, circle.value.r);
  });

  return (
    <View style={{ flex: 1 }}>
      <View ref={ref} style={{ flex: 1 }} collapsable={false}>
        <ThemeContext.Provider
          value={{ ...themeState, toggleTheme, toggleThemeWithTransition }}
        >
          {children}
        </ThemeContext.Provider>
      </View>

      <Canvas style={StyleSheet.absoluteFill} pointerEvents={"none"}>
        <Image
          image={themeState.overlay1}
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
        />
        {themeState.overlay2 && (
          <Circle c={circle} r={r}>
            <ImageShader
              image={themeState.overlay2}
              x={0}
              y={0}
              width={WIDTH}
              height={HEIGHT}
              fit="cover"
            />
          </Circle>
        )}
      </Canvas>
    </View>
  );
};

export default ThemeProvider;

export const useTheme = () => {
  const ctx = useContext(ThemeContext);

  if (ctx === null) {
    throw new Error("No Theme context found");
  }

  return ctx;
};
