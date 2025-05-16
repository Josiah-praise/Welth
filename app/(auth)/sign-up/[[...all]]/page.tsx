"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

function SignUpPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  return <SignUp />;
}
export default SignUpPage;
