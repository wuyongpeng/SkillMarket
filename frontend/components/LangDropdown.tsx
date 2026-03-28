'use client'

import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/appContext'
import { Globe } from 'lucide-react'

export default function LangDropdown() {
  const { lang, setLang } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const options = [
    { value: 'zh', label: '简体中文' },
    { value: 'en', label: 'English' },
  ] as const

  const current = options.find(o => o.value === lang)!

  return (
    <div className="lang-dropdown" ref={ref} style={{ position: 'relative' }}>
      <button 
        className="nav-icon-btn lang-trigger" 
        onClick={() => setOpen(o => !o)} 
        title="Language"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', borderRadius: 8 }}
      >
        <Globe size={16} strokeWidth={2} />
      </button>

      {open && (
        <div 
          className="lang-menu" 
          style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, minWidth: 120, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {options.map(o => (
            <button
              key={o.value}
              className={`lang-option ${lang === o.value ? 'active' : ''}`}
              onClick={() => { setLang(o.value); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: lang === o.value ? 'var(--surface)' : 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: lang === o.value ? 'var(--teal)' : 'var(--ink)', fontWeight: lang === o.value ? 600 : 400 }}
            >
              <span>{o.label}</span>
              {lang === o.value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
