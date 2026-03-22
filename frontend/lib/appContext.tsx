'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'zh' | 'en'
type Theme = 'light' | 'dark'
type Mode = 'os' | 'web'

interface AppCtx {
  lang: Lang
  theme: Theme
  mode: Mode
  setLang: (l: Lang) => void
  setTheme: (t: Theme) => void
  setMode: (m: Mode) => void
  t: (zh: string, en: string) => string
}

const AppContext = createContext<AppCtx>({} as AppCtx)

export function AppProvider({ children, defaultMode = 'os' }: { children: ReactNode; defaultMode?: Mode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [theme, setTheme] = useState<Theme>('light')
  const [mode, setMode] = useState<Mode>(defaultMode)

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const t = (zh: string, en: string) => lang === 'zh' ? zh : en

  return (
    <AppContext.Provider value={{ lang, theme, mode, setLang, setTheme, setMode, t }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
