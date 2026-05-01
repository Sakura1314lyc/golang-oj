import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { indentWithTab } from '@codemirror/commands'
import { EditorView, keymap } from '@codemirror/view'

const langExtensions = {
  cpp: cpp(),
  go: javascript({ typescript: false }),
  python: python(),
}

const darkTheme = EditorView.theme({
  '&': { color: '#e8dff5', backgroundColor: '#1a1530' },
  '.cm-content': { fontFamily: "'Consolas', 'Monaco', 'Fira Code', monospace", fontSize: '14px', lineHeight: '1.7', padding: '16px' },
  '.cm-cursor': { borderLeftColor: '#c4b5fd', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: '#3d2e6b' },
  '.cm-activeLine': { backgroundColor: '#221d3a' },
  '.cm-gutters': { backgroundColor: '#252045', border: 'none' },
  '.cm-lineNumbers .cm-gutterElement': { color: '#6b5d8a', padding: '0 8px', fontSize: '12px' },
  '.cm-activeLineGutter': { backgroundColor: '#2a2350' },
  '.cm-matchingBracket': { backgroundColor: '#4a397a', outline: 'none' },
  '.cm-nonmatchingBracket': { backgroundColor: '#7f1d1d', outline: 'none' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
})

const lightTheme = EditorView.theme({
  '&': { color: '#4c3b5e', backgroundColor: '#faf7fd' },
  '.cm-content': { fontFamily: "'Consolas', 'Monaco', 'Fira Code', monospace", fontSize: '14px', lineHeight: '1.7', padding: '16px' },
  '.cm-cursor': { borderLeftColor: '#a78bfa', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: '#e8dff5' },
  '.cm-activeLine': { backgroundColor: '#f5f0fa' },
  '.cm-gutters': { backgroundColor: '#f0e8f7', border: 'none' },
  '.cm-lineNumbers .cm-gutterElement': { color: '#9b8db5', padding: '0 8px', fontSize: '12px' },
  '.cm-activeLineGutter': { backgroundColor: '#e8dff5' },
  '.cm-matchingBracket': { backgroundColor: '#d4c4e8', outline: 'none' },
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
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black">代码编辑器</h2>
          <div className="flex gap-1 rounded-xl border border-pink-200 bg-white/60 p-0.5 dark:border-white/10 dark:bg-white/5">
            {['cpp', 'go', 'python'].map((l) => (
              <button key={l} onClick={() => onLanguageChange(l)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${language === l
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-sm'
                  : 'text-[#704b84] hover:bg-white/50 dark:text-[#dbcaff] dark:hover:bg-white/10'}`}>
                {l === 'cpp' ? 'C++' : l === 'go' ? 'Go' : 'Python'}
              </button>
            ))}
          </div>
        </div>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-[11px] font-black tracking-wider dark:bg-white/10 dark:text-[#dbcaff]">EDITOR</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-pink-200 shadow-sm dark:border-white/10">
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
