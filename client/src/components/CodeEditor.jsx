 import React from "react"
 import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"

const CodeEditor = ({ code, language, onChange }) => {
  const editorRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      // Initialize Monaco editor
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: code,
        language: getMonacoLanguage(language),
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
        wordWrap: "on",
        lineNumbers: "on",
      })

      // Set up change event handler
      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current.getValue())
      })

      // Clean up
      return () => {
        editorRef.current.dispose()
      }
    }
  }, [])

  // Update editor content when code prop changes
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue()
      if (code !== currentValue) {
        editorRef.current.setValue(code)
      }
    }
  }, [code])

  // Update editor language when language prop changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, getMonacoLanguage(language))
      }
    }
  }, [language])

  // Map language to Monaco language identifier
  const getMonacoLanguage = (lang) => {
    const languageMap = {
      javascript: "javascript",
      python: "python",
      java: "java",
      csharp: "csharp",
      cpp: "cpp",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      typescript: "typescript",
      php: "php",
    }
    return languageMap[lang] || "plaintext"
  }

  return <div ref={containerRef} className="h-full w-full" />
}

export default CodeEditor
