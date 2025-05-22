import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { checkBudgetAlerts, generateMonthlyReports, processRecurringTransaction } from "@/inngest/functions/budget-alert";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts, processRecurringTransaction, generateMonthlyReports
  ],
});
