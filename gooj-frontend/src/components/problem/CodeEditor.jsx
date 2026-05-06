import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { indentWithTab } from '@codemirror/commands'
import { EditorView, keymap } from '@codemirror/view'

const langExtensions = {
  cpp: cpp(),
  go: javascript({ typescript: false }),
  python: python(),
  java: java(),
  javascript: javascript(),
}

const langLabels = {
  cpp: 'C++',
  go: 'Go',
  python: 'Python',
  java: 'Java',
  javascript: 'JS',
}

const darkTheme = EditorView.theme({
  '&': { color: '#f2f4f6', backgroundColor: '#090b0e' },
  '.cm-content': { fontFamily: "'Consolas', 'Monaco', 'Fira Code', monospace", fontSize: '14px', lineHeight: '1.75', padding: '16px' },
  '.cm-cursor': { borderLeftColor: '#e34545', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: '#263745' },
  '.cm-activeLine': { backgroundColor: '#141a20' },
  '.cm-gutters': { backgroundColor: '#101419', border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)' },
  '.cm-lineNumbers .cm-gutterElement': { color: '#66707a', padding: '0 10px', fontSize: '12px' },
  '.cm-activeLineGutter': { backgroundColor: '#1b222a', color: '#5ad7ff' },
  '.cm-matchingBracket': { backgroundColor: '#243b45', outline: '1px solid rgba(90,215,255,0.35)' },
  '.cm-nonmatchingBracket': { backgroundColor: '#4a1616', outline: 'none' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
})

const lightTheme = EditorView.theme({
  '&': { color: '#17202a', backgroundColor: '#eef1f3' },
  '.cm-content': { fontFamily: "'Consolas', 'Monaco', 'Fira Code', monospace", fontSize: '14px', lineHeight: '1.75', padding: '16px' },
  '.cm-cursor': { borderLeftColor: '#e34545', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: '#cbd7df' },
  '.cm-activeLine': { backgroundColor: '#e0e6ea' },
  '.cm-gutters': { backgroundColor: '#dce2e7', border: 'none', borderRight: '1px solid rgba(10,16,22,0.12)' },
  '.cm-lineNumbers .cm-gutterElement': { color: '#7d8791', padding: '0 10px', fontSize: '12px' },
  '.cm-activeLineGutter': { backgroundColor: '#d4dde3', color: '#b3212b' },
  '.cm-matchingBracket': { backgroundColor: '#c8d9e0', outline: '1px solid rgba(22,105,132,0.35)' },
  '.cm-nonmatchingBracket': { backgroundColor: '#fecaca', outline: 'none' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
})

export default function CodeEditor({ value, onChange, language, onLanguageChange, dark }) {
  const handleChange = useCallback((val) => onChange(val), [onChange])

  const extensions = [
    keymap.of([indentWithTab]),
    langExtensions[language] || cpp(),
    dark ? darkTheme : lightTheme,
  ]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2 max-md:flex-col max-md:items-start">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="ark-kicker">Source Editor</div>
            <h2 className="mt-1 text-lg font-black">代码编辑器</h2>
          </div>
          <div className="flex flex-wrap border border-white/12 bg-black/20 p-0.5">
            {['cpp', 'go', 'python', 'java', 'javascript'].map((l) => (
              <button
                key={l}
                onClick={() => onLanguageChange(l)}
                className={`px-3 py-1.5 text-xs font-black transition ${
                  language === l
                    ? 'bg-[var(--ark-red)] text-white'
                    : 'text-white/62 hover:bg-white/10 hover:text-white'
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
        </div>
        <span className="ark-tag px-3 py-1">EDITOR</span>
      </div>
      <div className="code-shell overflow-hidden border border-white/14 shadow-2xl">
        <CodeMirror
          value={value}
          onChange={handleChange}
          extensions={extensions}
          height="620px"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            indentOnInput: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}
