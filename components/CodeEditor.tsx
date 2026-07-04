"use client";

import { Editor, type OnMount } from "@monaco-editor/react";
import { useRef } from "react";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  /** Ctrl/Cmd+S handler so users can save from the keyboard. */
  onSave?: () => void;
  readOnly?: boolean;
  height?: string;
};

/**
 * A thin wrapper around Monaco tuned for a JavaScript practice experience:
 * IntelliSense, Ctrl+/ comment toggle, bracket-pair colorization, auto-indent,
 * line numbers, and squiggles are all on by default in Monaco — we mostly
 * configure the language service and a custom dark theme that matches the app.
 */
export function CodeEditor({
  value,
  onChange,
  onSave,
  readOnly = false,
  height = "100%",
}: CodeEditorProps) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  const handleMount: OnMount = (editor, monaco) => {
    // Define a dark theme that blends with the vault palette.
    monaco.editor.defineTheme("vault-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "string", foreground: "2dd4bf" },
        { token: "number", foreground: "ff8a3d" },
        { token: "type", foreground: "38bdf8" },
        { token: "delimiter", foreground: "8a8aa0" },
      ],
      colors: {
        "editor.background": "#0d0d14",
        "editor.foreground": "#e8e8f0",
        "editorLineNumber.foreground": "#3a3a4d",
        "editorLineNumber.activeForeground": "#8a8aa0",
        "editor.selectionBackground": "#a855f733",
        "editor.lineHighlightBackground": "#16161f",
        "editorCursor.foreground": "#ff8a3d",
        "editorBracketHighlight.foreground1": "#ff8a3d",
        "editorBracketHighlight.foreground2": "#a855f7",
        "editorBracketHighlight.foreground3": "#2dd4bf",
        "editorIndentGuide.background1": "#1e1e2a",
        "editorGutter.background": "#0d0d14",
      },
    });
    monaco.editor.setTheme("vault-dark");

    // Rich JS language service: allow non-ESM globals, enable suggestions,
    // and surface obvious errors as squiggles without being noisy.
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: false,
      moduleResolution:
        monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Ctrl/Cmd+S → save (prevents the browser's own save dialog).
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveRef.current?.();
    });
  };

  return (
    <Editor
      height={height}
      defaultLanguage="javascript"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      loading={
        <div className="flex h-full w-full items-center justify-center text-sm text-vault-muted">
          Loading editor…
        </div>
      }
      options={{
        readOnly,
        fontSize: 14,
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontLigatures: true,
        lineNumbers: "on",
        minimap: { enabled: false },
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 18, bottom: 18 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        autoIndent: "full",
        formatOnPaste: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        wordWrap: "on",
        renderLineHighlight: "all",
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
    />
  );
}
