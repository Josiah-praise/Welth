"use client";

import { toggleDefault } from "@/actions/Account";
import { Switch } from "./ui/switch";
import { useFetch } from "@/hooks/use-fetch-hook";
import { useEffect, useState } from "react";
import { isAccountsResponse } from "@/lib/utils";

function IsDefaultSwitch({
  isChecked,
  accountId,
}: {
  isChecked: boolean;
  accountId: string;
}) {
  const { fetch, loading } = useFetch(toggleDefault);

 

  const toggle = async (value: boolean) => {
    await fetch({ value, accountId });
    console.log("done running");
  };
  return (
    <Switch
      checked={isChecked}
      onCheckedChange={toggle}
      disabled={loading}
    />
  );
}
export default IsDefaultSwitch;
