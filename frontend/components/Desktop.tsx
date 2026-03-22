'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import {
  Calendar, User, Users, FileText, Zap, LogIn,
  X, Minus, Maximize2, Sun, Moon, Languages, Monitor, Globe,
  Flame, ArrowRight, Settings
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'
import { useApp } from '@/lib/appContext'

/* ─────────────────────────────────────
   Types
───────────────────────────────────── */
interface AppWindow {
  id: string; title: string; content: React.ReactNode
  x: number; y: number; w: number; h: number; z: number; minimized: boolean
}
interface DesktopIcon {
  id: string; label: string; fileExt: string; icon: React.ReactNode
  color: string; content: React.ReactNode; defaultW: number; defaultH: number
}

let globalZ = 100

/* ─────────────────────────────────────
   Window Frame
───────────────────────────────────── */
function AppWindowFrame({ win, onClose, onFocus, onMinimize }: {
  win: AppWindow; onClose: (id: string) => void
  onFocus: (id: string) => void; onMinimize: (id: string) => void
}) {
  const pos = useRef({ x: win.x, y: win.y })
  const [maximized, setMaximized] = useState(false)
  const [style, api] = useSpring(() => ({ x: win.x, y: win.y, config: { tension: 280, friction: 28 } }))

  const bind = useDrag(({ movement: [mx, my], first, last, event }) => {
    if (maximized) return
    const target = event?.target as HTMLElement
    if (!target?.closest('.win-titlebar')) return
    if (first) onFocus(win.id)
    const x = Math.max(0, pos.current.x + mx)
    const y = Math.max(0, pos.current.y + my)
    if (last) pos.current = { x, y }
    api.start({ x, y, immediate: true })
  }, { filterTaps: true })

  function handleTitlebarDblClick(e: React.MouseEvent) {
    if (!(e.target as HTMLElement).closest('.win-controls')) {
      setMaximized(m => !m)
    }
  }

  const NAV_H = 48
  if (win.minimized) return null
  return (
    <animated.div
      {...bind()}
      onMouseDown={() => onFocus(win.id)}
      className={`app-window ${maximized ? 'maximized' : ''}`}
      style={maximized
        ? { position: 'fixed', top: NAV_H, left: 0, width: '100vw', height: `calc(100vh - ${NAV_H}px)`, zIndex: win.z, touchAction: 'none' }
        : { ...style, zIndex: win.z, width: win.w, height: win.h, position: 'absolute', touchAction: 'none' }
      }
    >
      <div className="win-titlebar" onDoubleClick={handleTitlebarDblClick}>
        <div className="win-controls">
          <button className="win-btn win-close" onClick={() => onClose(win.id)}><X size={8} /></button>
          <button className="win-btn win-minimize" onClick={() => onMinimize(win.id)}><Minus size={8} /></button>
          <button className="win-btn win-maximize" onClick={() => setMaximized(m => !m)}><Maximize2 size={8} /></button>
        </div>
        <div className="win-title">{win.title}</div>
      </div>
      <div className="win-body">{win.content}</div>
    </animated.div>
  )
}

/* ─────────────────────────────────────
   Desktop Icon (draggable)
───────────────────────────────────── */
function DesktopIconItem({ icon: def, onOpen }: { icon: DesktopIcon; onOpen: (def: DesktopIcon) => void }) {
  const [active, setActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pos = useRef({ x: 0, y: 0 })
  const [spring, api] = useSpring(() => ({ x: 0, y: 0, scale: 1, config: { tension: 300, friction: 26 } }))

  const bind = useDrag(({ movement: [mx, my], last, active: dragging }) => {
    const x = pos.current.x + mx
    const y = pos.current.y + my
    if (last) pos.current = { x, y }
    api.start({ x, y, scale: dragging ? 1.08 : 1, immediate: !last })
  }, { filterTaps: true })

  function handleClick() {
    if (timerRef.current) {
      clearTimeout(timerRef.current); timerRef.current = null
      onOpen(def); setActive(false)
    } else {
      setActive(true)
      timerRef.current = setTimeout(() => { timerRef.current = null; setActive(false) }, 300)
    }
  }

  return (
    <animated.div
      {...bind()}
      className={`desktop-icon ${active ? 'selected' : ''}`}
      style={{ ...spring, position: 'relative', touchAction: 'none', cursor: 'grab' }}
      onClick={handleClick}
      onDoubleClick={() => onOpen(def)}
    >
      <div className="di-icon" style={{ background: def.color }}>{def.icon}</div>
      <div className="di-label">{def.label}<span className="di-ext">.{def.fileExt}</span></div>
    </animated.div>
  )
}

/* ─────────────────────────────────────
   Settings Panel (Windows Start-menu style)
───────────────────────────────────── */
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { lang, setLang, theme, setTheme, mode, setMode, t } = useApp()
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span>{t('系统设置', 'Settings')}</span>
        <button className="settings-close" onClick={onClose}><X size={14} /></button>
      </div>

      <div className="settings-section">{t('语言 / Language', 'Language')}</div>
      <div className="settings-row">
        <button className={`settings-opt ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>
          🇨🇳 中文
        </button>
        <button className={`settings-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>
          🇺🇸 English
        </button>
      </div>

      <div className="settings-section">{t('外观', 'Appearance')}</div>
      <div className="settings-row">
        <button className={`settings-opt ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
          <Sun size={13} /> {t('白天', 'Light')}
        </button>
        <button className={`settings-opt ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
          <Moon size={13} /> {t('夜晚', 'Dark')}
        </button>
      </div>

      <div className="settings-section">{t('视图模式', 'View Mode')}</div>
      <div className="settings-row">
        <button className={`settings-opt ${mode === 'os' ? 'active' : ''}`} onClick={() => setMode('os')}>
          <Monitor size={13} /> OS
        </button>
        <button className={`settings-opt ${mode === 'web' ? 'active' : ''}`} onClick={() => setMode('web')}>
          <Globe size={13} /> Web
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────
   Window Contents
───────────────────────────────────── */
function HomeContent({ onLogin }: { onLogin: () => void }) {
  const { t, lang, setMode } = useApp()
  return (
    <div className="wc-home">
      <div className="wc-home-eyebrow">AI Transformation OS · skillmarket.top</div>
      <h1 className="wc-home-title">
        {t('让每个职场人都能驾驭 AI', 'AI Transformation for Every Professional')}
      </h1>
      <p className="wc-home-sub">
        {lang === 'zh'
          ? <>不是又一个 AI 工具推荐清单。<br />而是一套帮你把 AI 真正用进工作流的<strong>每日训练系统</strong>。</>
          : <>Not another AI tool list.<br />A <strong>daily training system</strong> that integrates AI into your real workflow.</>
        }
      </p>
      <div className="wc-home-features">
        {[
          { icon: '📋', title: t('每日 5 分钟任务', 'Daily 5-min Tasks'), desc: t('根据你的职业角色定制', 'Tailored to your role') },
          { icon: '🔥', title: t('小组打卡', 'Group Check-in'), desc: t('5 人小组，排行榜，连续打卡', '5-person groups, leaderboard, streaks') },
          { icon: '📈', title: t('AI 就绪度评分', 'AI Readiness Score'), desc: t('入测 → 持续追踪 → 季度报告', 'Baseline → Track → Quarterly report') },
          { icon: '🗺️', title: t('AI 进化路径', 'AI Evolution Path'), desc: t('从 Prompt 到 Harness Engineering', 'From Prompt to Harness Engineering') },
        ].map(f => (
          <div key={f.title as string} className="wc-home-feature">
            <div className="wc-home-feature-icon">{f.icon}</div>
            <div>
              <div className="wc-home-feature-title">{f.title}</div>
              <div className="wc-home-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="wc-home-stats">
        <div className="wc-home-stat"><span>94</span>{t('天平均坚持', 'avg days')}</div>
        <div className="wc-home-stat"><span>68%</span>{t('超越同行', 'beat peers')}</div>
        <div className="wc-home-stat"><span>+24</span>{t('分平均提升', 'score gain')}</div>
      </div>
      <div className="wc-home-actions">
        <button className="wc-home-btn-primary" onClick={onLogin}>
          {t('免费开始', 'Get Started Free')} <ArrowRight size={14} />
        </button>
        <button className="wc-home-btn-ghost" onClick={() => setMode('web')}>
          {t('切换到网页模式', 'Switch to Web Mode')}
        </button>
      </div>
      <div className="wc-home-hint">{t('↑ 双击左侧图标，探索各功能模块', '↑ Double-click icons on the left to explore')}</div>
    </div>
  )
}

function TodayContent() {
  const { t } = useApp()
  const [done, setDone] = useState(false)
  return (
    <div className="wc-today">
      <div className="wc-section-label">📋 {t('今日任务 · 预计 5 分钟', "Today's Task · ~5 min")}</div>
      <div className="wc-task-title">{t('用 AI 将你昨天的一段会议纪要，改写成可直接发给老板的结构化决策备忘录', 'Use AI to rewrite your meeting notes into a structured decision memo for your manager')}</div>
      <div className="wc-tags">
        <span className="wc-tag">{t('沟通效率', 'Communication')}</span>
        <span className="wc-tag">{t('文档写作', 'Writing')}</span>
        <span className="wc-tag">Claude / ChatGPT</span>
      </div>
      <div className="wc-steps">
        {[
          t('打开 Claude 或 ChatGPT，粘贴你最近一次会议纪要', 'Open Claude or ChatGPT, paste your recent meeting notes'),
          t('输入 Prompt：「改写为决策备忘录，包含背景、核心决策、负责人与时间节点、风险提示」', 'Prompt: "Rewrite as a decision memo with: background, key decisions, owners, timeline, risks"'),
          t('对比 AI 输出和你自己写的版本，记录最让你惊喜的一点', 'Compare AI output vs your own version, note the most surprising difference'),
        ].map((s, i) => (
          <div className="wc-step" key={i}><div className="wc-step-num">{i + 1}</div><div>{s}</div></div>
        ))}
      </div>
      <button className={`wc-complete-btn ${done ? 'done' : ''}`} onClick={() => setDone(true)} disabled={done}>
        {done ? `✓ ${t('已完成！', 'Done!')}` : t('标记完成', 'Mark Complete')}
      </button>
    </div>
  )
}

function ProfileContent({ user }: { user?: SupabaseUser | null }) {
  const { t } = useApp()
  const displayName = user?.user_metadata?.name as string || t('访客', 'Guest')
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  return (
    <div className="wc-profile">
      <div className="wc-score-row">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#e8e8f0" strokeWidth="6" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#048a81" strokeWidth="6"
            strokeLinecap="round" strokeDasharray="201" strokeDashoffset={201 * 0.29} transform="rotate(-90 40 40)" />
          <text x="40" y="44" textAnchor="middle" fontSize="20" fontWeight="300" fill="var(--ink)">71</text>
          <text x="40" y="56" textAnchor="middle" fontSize="9" fill="#8888aa">{t('AI就绪度', 'AI Readiness')}</text>
        </svg>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {avatarUrl && <Image src={avatarUrl} alt="avatar" width={28} height={28} style={{ borderRadius: '50%' }} />}
            <div className="wc-profile-name">{displayName}</div>
          </div>
          <div className="wc-profile-role">{t('产品经理 · 7年', 'Product Manager · 7yr')}</div>
          <div className="wc-profile-score">47 → <span>71{t('分', 'pts')}</span> ↑ {t('提升 24 分', '+24 pts')}</div>
        </div>
      </div>
      <div className="wc-skills">
        {[t('文档写作','Writing'), t('会议纪要','Meeting Notes'), 'Prompt Design', t('数据分析辅助','Data Analysis'), t('产品需求描述','PRD'), t('竞品研究','Competitive Research')].map(s => (
          <span key={s as string} className="wc-tag">{s}</span>
        ))}
      </div>
    </div>
  )
}

function GroupContent() {
  const { t } = useApp()
  const members = [
    { name: t('成员 1','Member 1'), color: '#5b4fcf', streak: 31, rank: 1, week: [1,1,1,1,1] },
    { name: t('你','You'), color: '#048a81', streak: 23, rank: 2, week: [1,1,1,1,1] },
    { name: t('成员 2','Member 2'), color: '#d4890a', streak: 12, rank: 3, week: [1,1,0,1,1] },
    { name: t('成员 3','Member 3'), color: '#c94040', streak: 2, rank: 4, week: [1,1,0,0,0] },
    { name: t('成员 4','Member 4'), color: '#888', streak: 7, rank: 5, week: [1,0,1,0,1] },
  ]
  const me = t('你', 'You')
  return (
    <div className="wc-group">
      {members.map(m => (
        <div key={m.name as string} className="wc-member">
          <div className="wc-rank">{m.rank}</div>
          <div className="wc-avatar" style={{ background: m.color }}>{(m.name as string)[0]}</div>
          <div className="wc-member-info">
            <div className="wc-member-name">{m.name}{m.name === me && <span className="wc-you"> ({t('我','me')})</span>}</div>
            <div className="wc-member-streak"><Flame size={10} style={{ color: '#ff6b35' }} /> {t('连续','streak')} {m.streak} {t('天','d')}</div>
          </div>
          <div className="wc-dots">
            {m.week.map((d, i) => <div key={i} className="wc-dot" style={{ background: d ? '#048a81' : 'var(--border2)' }} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function PathwayContent() {
  const { t } = useApp()
  const nodes = [
    { name: 'Prompt Engineering', desc: t('基础提示词设计', 'Basic prompt design'), status: 'done' },
    { name: 'Context Engineering', desc: t('上下文窗口管理', 'Context window management'), status: 'done' },
    { name: 'Harness Engineering', desc: t('约束与编排 AI 行为', 'Constrain & orchestrate AI'), status: 'new' },
  ]
  return (
    <div className="wc-pathway">
      {nodes.map((n, i) => (
        <div key={n.name}>
          <div className={`wc-node ${n.status}`}>
            <div className="wc-node-name">{n.name}{n.status === 'new' && <span className="wc-new-badge">2026 New</span>}</div>
            <div className="wc-node-desc">{n.desc}</div>
          </div>
          {i < nodes.length - 1 && <div className="wc-node-connector">↓</div>}
        </div>
      ))}
    </div>
  )
}

function ReportContent() {
  const { t } = useApp()
  return (
    <div className="wc-report">
      <div className="wc-report-header">2026 Q1 · {t('AI 转型成长报告', 'AI Transformation Report')}</div>
      <div className="wc-report-period">{t('2026年1月 — 3月 · 产品经理', 'Jan — Mar 2026 · Product Manager')}</div>
      <div className="wc-report-stats">
        <div className="wc-rs"><div className="wc-rs-val">87</div><div className="wc-rs-key">{t('完成任务数', 'Tasks Done')}</div></div>
        <div className="wc-rs"><div className="wc-rs-val">+24</div><div className="wc-rs-key">{t('评分提升', 'Score Gain')}</div></div>
        <div className="wc-rs"><div className="wc-rs-val">68%</div><div className="wc-rs-key">{t('超越同行', 'Beat Peers')}</div></div>
      </div>
    </div>
  )
}

function LoginContent() {
  const { t } = useApp()
  async function handleLogin() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
  }
  return (
    <div className="wc-login">
      <div className="wc-login-logo">起飞AI</div>
      <div className="wc-login-title">{t('开始你的 AI 转型之旅', 'Start Your AI Transformation')}</div>
      <div className="wc-login-sub">{t('每日 5 分钟 · 小组打卡 · 成长档案', 'Daily 5min · Group check-in · Growth profile')}</div>
      <button className="wc-google-btn" onClick={handleLogin}>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {t('使用 Google 账号登录', 'Sign in with Google')}
      </button>
    </div>
  )
}

/* ─────────────────────────────────────
   Language Dropdown
───────────────────────────────────── */
function LangDropdown() {
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
    { value: 'zh', flag: '🇨🇳', label: '中文' },
    { value: 'en', flag: '🇺🇸', label: 'English' },
  ] as const

  const current = options.find(o => o.value === lang)!

  return (
    <div className="lang-dropdown" ref={ref}>
      <button className="nav-icon-btn lang-trigger" onClick={() => setOpen(o => !o)} title="Language">
        <Languages size={15} />
        <span className="lang-current">{current.flag}</span>
      </button>
      {open && (
        <div className="lang-menu">
          {options.map(o => (
            <button
              key={o.value}
              className={`lang-option ${lang === o.value ? 'active' : ''}`}
              onClick={() => { setLang(o.value); setOpen(false) }}
            >
              <span>{o.flag}</span>
              <span>{o.label}</span>
              {lang === o.value && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────
   Main Desktop
───────────────────────────────────── */
export default function Desktop({ user }: { user?: SupabaseUser | null }) {
  const { lang, theme, setTheme, mode, setMode, t } = useApp()
  const [windows, setWindows] = useState<AppWindow[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const settingsBtnRef = useRef<HTMLDivElement>(null)
  const homeOpenedRef = useRef(false)

  useEffect(() => {
    if (!showSettings) return
    function handleClick(e: MouseEvent) {
      const inPanel = settingsRef.current?.contains(e.target as Node)
      const inBtn = settingsBtnRef.current?.contains(e.target as Node)
      if (!inPanel && !inBtn) setShowSettings(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSettings])

  async function handleLogin() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
  }

  // home label changes with language
  const homeLabel = lang === 'zh' ? '首页' : 'home'

  const ICONS: DesktopIcon[] = [
    { id: 'home', label: homeLabel, fileExt: 'mdx', icon: <FileText size={22} color="#fff" />, color: '#1a1a2e', content: <HomeContent onLogin={handleLogin} />, defaultW: 560, defaultH: 520 },
    { id: 'today', label: t('今日任务', 'Today'), fileExt: 'md', icon: <Calendar size={22} color="#fff" />, color: '#048a81', content: <TodayContent />, defaultW: 480, defaultH: 420 },
    { id: 'profile', label: t('成长档案', 'Profile'), fileExt: 'tsx', icon: <User size={22} color="#fff" />, color: '#5b4fcf', content: <ProfileContent user={user} />, defaultW: 400, defaultH: 340 },
    { id: 'group', label: t('我的小组', 'Group'), fileExt: 'tsx', icon: <Users size={22} color="#fff" />, color: '#d4890a', content: <GroupContent />, defaultW: 380, defaultH: 360 },
    { id: 'pathway', label: t('AI 路径', 'AI Path'), fileExt: 'go', icon: <Zap size={22} color="#fff" />, color: '#00a8cc', content: <PathwayContent />, defaultW: 360, defaultH: 340 },
    { id: 'report', label: t('季度报告', 'Report'), fileExt: 'pdf', icon: <FileText size={22} color="#c94040" />, color: '#fdeaea', content: <ReportContent />, defaultW: 400, defaultH: 260 },
    ...(!user ? [{ id: 'login', label: t('登录', 'Login'), fileExt: 'tsx', icon: <LogIn size={22} color="#fff" />, color: '#1a1a2e', content: <LoginContent />, defaultW: 360, defaultH: 320 }] : []),
  ]

  const openWindow = useCallback((def: DesktopIcon) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === def.id)
      if (existing) {
        globalZ += 1
        return prev.map(w => w.id === def.id ? { ...w, z: globalZ, minimized: false } : w)
      }
      globalZ += 1
      const offset = prev.filter(w => !w.minimized).length * 28
      return [...prev, { id: def.id, title: `${def.label}.${def.fileExt}`, content: def.content, x: 120 + offset, y: 60 + offset, w: def.defaultW, h: def.defaultH, z: globalZ, minimized: false }]
    })
  }, [])

  // Auto-open home on mount
  useEffect(() => {
    if (homeOpenedRef.current) return
    homeOpenedRef.current = true
    const homeDef = ICONS.find(i => i.id === 'home')!
    openWindow(homeDef)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeWindow = useCallback((id: string) => setWindows(prev => prev.filter(w => w.id !== id)), [])
  const focusWindow = useCallback((id: string) => { globalZ += 1; setWindows(prev => prev.map(w => w.id === id ? { ...w, z: globalZ } : w)) }, [])
  const minimizeWindow = useCallback((id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w)), [])

  return (
    <div className="desktop">
      <div className="desktop-grid" />

      {/* Nav */}
      <nav className="desktop-nav">
        <div className={`desktop-logo ${lang === 'en' ? 'en' : ''}`}>
          {lang === 'zh' ? '起飞AI' : 'Soar AI'}
        </div>
        {user && (
          <div className="desktop-user">
            {user.user_metadata?.avatar_url && (
              <Image src={user.user_metadata.avatar_url as string} alt="avatar" width={24} height={24} style={{ borderRadius: '50%' }} />
            )}
            <span>{user.user_metadata?.name as string || user.email}</span>
          </div>
        )}
        <div className="nav-right-controls">
          {/* Login button — top-right, only when not logged in */}
          {!user && (
            <button className="nav-login-btn" onClick={handleLogin}>
              <LogIn size={13} /> {t('立即开始', 'Get Started')}
            </button>
          )}
          {user && (
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === 'os' ? 'active' : ''}`} onClick={() => setMode('os')}><Monitor size={13} /> OS</button>
              <button className={`mode-btn ${mode === 'web' ? 'active' : ''}`} onClick={() => setMode('web')}><Globe size={13} /> Web</button>
            </div>
          )}
          <button className="nav-icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title={t('切换主题', 'Toggle theme')}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <LangDropdown />
        </div>
      </nav>

      {/* Icons grid — left side, excludes login (moved to nav) */}
      <div className="desktop-icons">
        {ICONS.filter(i => i.id !== 'login').map(icon => (
          <DesktopIconItem key={icon.id} icon={icon} onOpen={openWindow} />
        ))}
      </div>

      {/* Settings button — fixed bottom-left, Windows style */}
      <div className="desktop-settings-btn" ref={settingsBtnRef}>
        <div className={`desktop-icon ${showSettings ? 'selected' : ''}`} onClick={() => setShowSettings(s => !s)}>
          <div className="di-icon" style={{ background: '#555' }}><Settings size={22} color="#fff" /></div>
          <div className="di-label">{t('设置', 'Settings')}</div>
        </div>
      </div>

      {/* Settings panel — at root level, always on top */}
      {showSettings && (
        <div ref={settingsRef} style={{ position: 'fixed', bottom: 100, left: 16, zIndex: 99999 }}>
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </div>
      )}

      {/* Windows */}
      {windows.map(win => (
        <AppWindowFrame key={win.id} win={win} onClose={closeWindow} onFocus={focusWindow} onMinimize={minimizeWindow} />
      ))}

      {/* Taskbar */}
      {windows.some(w => w.minimized) && (
        <div className="taskbar">
          {windows.filter(w => w.minimized).map(w => (
            <button key={w.id} className="taskbar-item" onClick={() => { focusWindow(w.id); setWindows(prev => prev.map(x => x.id === w.id ? { ...x, minimized: false } : x)) }}>
              {w.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
