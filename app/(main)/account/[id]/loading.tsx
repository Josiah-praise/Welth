"use client";

import { PuffLoader } from "react-spinners";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function LoadingUI() {
  const { theme } = useTheme();

 

const loaderColor = theme === "dark" ? "#ffffff" : "#000000";

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <PuffLoader color={loaderColor} size={60} />
    </div>
  );
}

export default LoadingUI;
