"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
type ThemeToggleProps = {
  fullWidth?: boolean;
};

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
  window.dispatchEvent(new Event("themechange"));
}

function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);

  return () => {
    window.removeEventListener("themechange", callback);
  };
}

function getSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function ThemeToggle({ fullWidth = false }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");
  const isDark = theme === "dark";

  function handleToggle() {
    applyTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-[11px] font-semibold text-primary transition-colors hover:bg-surface-container ${
        fullWidth ? "w-full" : ""
      }`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="material-symbols-outlined text-[16px]">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
