"use client";

import { currentBudget } from "@/actions/Budget";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BudgetInput from "./BudgetInput";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

function BudgetProgress({ budget }: { budget: currentBudget | undefined }) {
  const [edit, setEditState] = useState<boolean>(false);
  console.log(budget, "budget");

  const percentage = useMemo(() => {
    return !budget || !budget.budget
      ? 0
      : Number((budget.currentExpenses / budget.budget.amount).toFixed(2)) *
          100;
  }, [budget]);

  return (
    <Card className="mb-8 mx-2">
      <CardHeader>
        <CardTitle>Monthly Budget(Default Account)</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="mb-2" />

        <div className="flex gap-1.5 items-center">
          {edit ? (
            <BudgetInput
              initialBudget={budget?.budget?.amount || 0}
              toggleEdit={setEditState}
            />
          ) : (
            budget &&
            (budget.budget?.amount ? (
              <p className="text-muted-foreground">{`₦${Number(
                budget?.currentExpenses.toFixed(2)
              ).toLocaleString()} of ₦${Number(
                budget?.budget?.amount.toFixed(2)
              ).toLocaleString()}`}</p>
            ) : (
              <p className="text-muted-foreground">No monthly budget</p>
            ))
          )}
          {budget && !edit && (
            <Button variant={"ghost"} onClick={() => setEditState(true)}>
              <Pencil className="text-muted-foreground" />
            </Button>
          )}
          {!budget && (
            <p className="text-muted-foreground">
              Select an account as default
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default BudgetProgress;
