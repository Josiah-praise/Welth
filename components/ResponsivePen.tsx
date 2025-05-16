'use client'

import { PenBoxIcon } from "lucide-react";
function ResponsivePen() {
  return (
    <PenBoxIcon
      className="inline"
      size={window.innerWidth < 640 ? 20 : 10}
    />
  );
}
export default ResponsivePen