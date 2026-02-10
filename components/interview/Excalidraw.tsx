"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  onChange: (elements: ExcalidrawElement[]) => void;
}

export default function ExcalidrawWrapper({
  elements,
  onChange,
}: ExcalidrawWrapperProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    if (!excalidrawAPI || !elements) return;

    // Check if the new elements are actually different from the current scene
    // This prevents the "Loop: Update -> onChange -> Update"
    const currentElements = excalidrawAPI.getSceneElements();
    
    // Simple JSON comparison is effective for preventing loops
    if (JSON.stringify(elements) !== JSON.stringify(currentElements)) {
       excalidrawAPI.updateScene({
        elements: elements,
      });
    }
  }, [elements, excalidrawAPI]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements: elements,
        }}
        onChange={(els) => onChange(els)}
      />
    </div>
  );
}