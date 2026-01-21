/// <reference types="vite/client" />

// Markdown file imports (raw text)
declare module '*.md?raw' {
  const content: string
  export default content
}
