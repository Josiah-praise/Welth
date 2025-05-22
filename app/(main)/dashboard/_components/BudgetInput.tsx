"use client";

import { updateBudget } from "@/actions/Budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetch } from "@/hooks/use-fetch-hook";
import { Check, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

function BudgetInput({
  initialBudget,
  toggleEdit,
}: {
  initialBudget: number;
  toggleEdit: Dispatch<SetStateAction<boolean>>;
}) {
  const [value, setValue] = useState(initialBudget);

  const { data, error, loading, fetch } = useFetch(updateBudget);

  useEffect(() => {
    if (!error) return;

    toast.error("Update failed, try again later");
  }, [error]);

  useEffect(() => {
    if (!data) return;
    setValue(data.amount);
    toast.success("Update successful");
    toggleEdit((prev) => !prev);
  }, [data, toggleEdit]);

  const handleSave = () => {
    if (initialBudget === value) return;
    if (value < 0) {
      toast.error("Budget cannot be less than 0");
      return;
    }

    fetch(value);
  };
  return (
    <div className="flex gap-1.5">
      <Input
        type={"number"}
        value={value}
        disabled={loading}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <Button variant={"ghost"} disabled={loading} onClick={handleSave}>
        <Check className="text-green-500"/>
      </Button>
      <Button
        variant={"ghost"}
        disabled={loading}
        onClick={() => toggleEdit((prev) => !prev)}
      >
        <X className="text-red-500"/>
      </Button>
    </div>
  );
}
export default BudgetInput;
