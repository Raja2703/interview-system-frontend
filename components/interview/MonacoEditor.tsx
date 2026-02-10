"use client";

import dynamic from "next/dynamic";
import type * as monaco from "monaco-editor";

// Dynamically import the editor
const MonacoEditorComponent = dynamic(
  () => import("@monaco-editor/react"),
  { ssr: false }
);

interface EditorProps {
  language: string;
  value: string;
  onChange: (val: string) => void;
  onMount?: (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor")
  ) => void;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export default function MonacoEditor({ language,
  value,
  onChange,
  onMount,
  options,
 }: EditorProps) {
  
  return (
    <MonacoEditorComponent
      height="100%"
      width="100%"
      language={language}
      theme="vs-dark"
      value={value}
      onChange={(val) => onChange(val ?? "")}
      onMount={onMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        ...options,
      }}
    />
  );
}