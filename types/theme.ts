export type Theme = "light" | "dark" | "system";

export interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

