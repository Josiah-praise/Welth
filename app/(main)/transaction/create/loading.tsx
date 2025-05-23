"use client";

import { PuffLoader } from "react-spinners";
import { useTheme } from "next-themes";
import { useMemo } from "react";

function LoadingUI() {
  const { theme, systemTheme } = useTheme();

  const loaderColor = useMemo(() => {
    const activeTheme = theme === "system" ? systemTheme : theme;
    return activeTheme === "dark" ? "#fff" : "#000";
  }, [theme, systemTheme]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <PuffLoader color={loaderColor} />
    </div>
  );
}

export default LoadingUI;
