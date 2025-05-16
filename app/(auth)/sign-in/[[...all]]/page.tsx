"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";

function SignInPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  return <SignIn />;
}
export default SignInPage;
