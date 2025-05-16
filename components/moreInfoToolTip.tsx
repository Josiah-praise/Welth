"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function MoreInfoToolTip({ infoText, trigger }: { infoText: React.ReactNode, trigger: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {trigger }
                  
        </TooltipTrigger>
        <TooltipContent className="w-fit">{infoText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
export default MoreInfoToolTip;
