import { StatusBar } from "expo-status-bar";
import type { ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Appearance, Dimensions, View, StyleSheet } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors, type ColorThemeType, type ThemeName } from "../Colors";

interface ThemeContextState {
  themeName: ThemeName;
  themeColors: ColorThemeType;
}

const OSTheme = Appearance.getColorScheme() ?? "light";

const defaultState: ThemeContextState = {
  themeName: OSTheme,
  themeColors: Colors[OSTheme],
};

interface ThemeContext extends ThemeContextState {
  toggleTheme: (themName?: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContext | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);

  if (ctx === null) {
    throw new Error("No Theme context found");
  }

  return ctx;
};

const AS_KEYS = {
  themeName: "themeName",
};

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeState, setThemeState] = useState(defaultState);

  console.log({ themeState });

  const oppositeThemeName = () =>
    themeState.themeName === "dark" ? "light" : "dark";

  const toggleTheme = async (theme?: ThemeName) => {
    const themeName = theme ?? oppositeThemeName();

    setThemeState({
      themeName,
      themeColors: Colors[themeName],
    });

    await AsyncStorage.setItem(AS_KEYS.themeName, themeName);
  };

  // if the user has already set a theme, then use it
  useEffect(() => {
    (async () => {
      const themeName = (await AsyncStorage.getItem(
        AS_KEYS.themeName
      )) as ThemeName | null;

      if (themeName) {
        toggleTheme(themeName);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }} collapsable={false}>
        <ThemeContext.Provider value={{ ...themeState, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      </View>
    </View>
  );
};

export default ThemeProvider;
