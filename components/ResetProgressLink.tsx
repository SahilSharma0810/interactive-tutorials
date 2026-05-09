"use client";

import { useEffect, useState } from "react";
import { clearAll, hasAnyProgress } from "@/lib/progress";

export default function ResetProgressLink() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(hasAnyProgress()); }, []);
  if (!show) return null;
  return (
    <button
      className="reset-progress-link"
      onClick={() => {
        if (confirm("Clear all reading progress on this device?")) {
          clearAll();
          setShow(false);
        }
      }}
    >
      Reset all progress
    </button>
  );
}
