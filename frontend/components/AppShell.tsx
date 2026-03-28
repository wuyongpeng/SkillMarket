'use client'

import SharedDocView from './SharedDocView'
import LangDropdown from './LangDropdown'
import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  Telescope, LayoutGrid, Bot, Cpu, Server, LogOut, LogIn, Sun, Moon,
  Monitor, Globe, Languages, SidebarClose, SidebarOpen, Search,
  ChevronRight, Home, Menu, X, BookOpen, Code, Wrench, BarChart,
  History, AlertTriangle, Bookmark, Database
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useApp } from '@/lib/appContext'
import type { LensId } from '@/lib/appContext'
import RagConceptual from './RagConceptual'
import { MDXRemote } from 'next-mdx-remote'

// ------------------------------
// 1 级导航
// ------------------------------
export const NAV_ITEMS = [
  { id: 'frontier',     zhLabel: '前沿探索',   enLabel: 'Frontier',      icon: Telescope  },
  { id: 'execution',    zhLabel: '执行层',     enLabel: 'Execution',     icon: Cpu        },
  { id: 'applications', zhLabel: '应用落地',   enLabel: 'Applications',  icon: LayoutGrid },
  { id: 'agents',       zhLabel: '智能体',     enLabel: 'Agents',        icon: Bot        },
  { id: 'ai-infra',     zhLabel: 'AI基础设施', enLabel: 'AI Infra',      icon: Server     },
] as const

export type PageId = typeof NAV_ITEMS[number]['id']

// ------------------------------
// 2 级知识点卡片（Azure 风格）
// ------------------------------
export const TOPICS = {
  'ai-infra': [
    { id: 'transformer', zh: 'Transformer', en: 'Transformer', icon: Code,     descZh: '神经网络核心架构',   descEn: 'Core neural network architecture' },
    { id: 'moe',         zh: 'MoE 架构',    en: 'MoE Architecture', icon: Bot, descZh: '混合专家稀疏模型',   descEn: 'Mixture of Experts sparse model' },
    { id: 'embedding',   zh: 'Embedding',   en: 'Embedding',   icon: Bookmark, descZh: '文本/图像向量表示',   descEn: 'Text/image vector representation' },
    { id: 'scaling',     zh: 'Scaling Law', en: 'Scaling Law', icon: BarChart, descZh: '模型性能缩放规律',   descEn: 'Model performance scaling rules' },
  ],
  'agents': [
    { id: 'react',    zh: 'ReAct',    en: 'ReAct',    icon: Bot,        descZh: '推理+行动协同架构',   descEn: 'Reasoning + acting architecture' },
    { id: 'planning', zh: '规划系统', en: 'Planning', icon: LayoutGrid, descZh: '多步决策与目标分解',   descEn: 'Multi-step planning & decomposition' },
    { id: 'memory',   zh: '记忆系统', en: 'Memory',   icon: Bookmark,   descZh: '长短时记忆管理',       descEn: 'Long/short-term memory management' },
  ],
  'applications': [
    { id: 'generate', zh: '内容生成', en: 'Generation', icon: BookOpen, descZh: '文本/图像/音频生成', descEn: 'Text/image/audio generation' },
    { id: 'decision', zh: '决策辅助', en: 'Decision',   icon: Bot,      descZh: '分析与判断增强',     descEn: 'Analysis & decision augmentation' },
  ],
  'execution': [
    { id: 'orchestration', zh: '工作流编排', en: 'Orchestration', icon: LayoutGrid, descZh: 'DAG/状态机执行',   descEn: 'DAG / state machine execution' },
    { id: 'observability', zh: '可观测性',   en: 'Observability', icon: BarChart,   descZh: '监控/追踪/日志',   descEn: 'Monitoring / tracing / logging' },
    { id: 'rag',           zh: '检索增强生成', en: 'RAG',         icon: Database,   descZh: '检索外部知识增强生成', descEn: 'Retrieve external knowledge to enhance generation' },
  ],
  'frontier': [
    { id: 'world-model', zh: '世界模型',  en: 'World Model',      icon: Globe, descZh: '物理与时空建模',     descEn: 'Physical & spatiotemporal modeling' },
    { id: 'causal',      zh: '因果推理',  en: 'Causal Reasoning', icon: Bot,   descZh: '反事实与因果推断',   descEn: 'Counterfactual & causal inference' },
  ],
}

// ------------------------------
// 3 级 Lens 内容（文档正文）
// ------------------------------

export const LENS_ICONS = {
  conceptual: BookOpen,
  mechanical: Code,
  practical: Wrench,
  comparative: BarChart,
  evolutionary: History,
  critical: AlertTriangle,
}

export const LENS_ZH: Record<LensId, string> = {
  conceptual: '概念',
  mechanical: '机制',
  practical: '实践',
  comparative: '对比',
  evolutionary: '演进',
  critical: '批判',
}

// ------------------------------
// 主组件
// ------------------------------
export default function AppShell({ user }: { user: User | null }) {
  const { theme, setTheme, lang, setLang, setMode, activeLens, setActiveLens } = useApp()
  const [activePage, setActivePage] = useState<PageId>('frontier')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [dynamicToc, setDynamicToc] = useState<{id: string, text: string}[]>([])
  const [mdxSource, setMdxSource] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()
  const avatarUrl = user?.user_metadata?.avatar_url
  const name = user?.user_metadata.name || user?.email || 'User'

  // 点击外部关闭菜单
  useEffect(() => {
    const cb = (e: MouseEvent) => { if (userRef.current && !userRef.current.contains(e.target as any)) setShowUserMenu(false) }
    document.addEventListener('mousedown', cb)
    return () => document.removeEventListener('mousedown', cb)
  }, [])

  // Fetch MDX Content
  useEffect(() => {
    if (!selectedTopic || !activeLens) return;
    let isMounted = true;
    setIsLoading(true);
    setMdxSource(null);

    fetch(`/api/content?topic=${selectedTopic}&lens=${activeLens}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.source) {
          setMdxSource(data.source);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [selectedTopic, activeLens]);

  // 动态提取 TOC
  useEffect(() => {
    const timer = setTimeout(() => {
      const headings = document.querySelectorAll('.doc-main h2')
      const toc = Array.from(headings).map(h => ({
        id: h.id || '',
        text: h.textContent || ''
      })).filter(item => item.text.trim() !== '')
      setDynamicToc(toc)
    }, 100)
    return () => clearTimeout(timer)
  }, [selectedTopic, activeLens])

  const currentTopics = TOPICS[activePage] || []
  const showDetail = !!selectedTopic

  return (
    <div className="app-container">
      {/* 移动端顶部栏 */}
      <div className="mobile-header">
        <button onClick={() => setMobileSidebarOpen(true)}><Menu size={20} /></button>
        <div className="logo">Vela AI</div>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* 侧边栏 */}
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
        <div className="sidebar-inner">
          <div className="sidebar-header">
            {!collapsed && <div className="logo-text">{lang === 'zh' ? '帆图' : 'Vela AI'}</div>}
            <button className="close-mobile" onClick={() => setMobileSidebarOpen(false)}><X size={18} /></button>
            <button className="toggle-desktop" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <SidebarOpen size={18} /> : <SidebarClose size={18} />}
            </button>
          </div>

          <div className="search-box">
            <Search size={14} />
            <input placeholder={lang === 'zh' ? '搜索' : 'Search'} value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="nav-section">{!collapsed && (lang === 'zh' ? '知识体系' : 'Knowledge')}</div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => { setActivePage(item.id); setSelectedTopic(null); setMobileSidebarOpen(false) }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{lang === 'zh' ? item.zhLabel : item.enLabel}</span>}
              </button>
            )
          })}

          <div className="sidebar-footer" ref={userRef}>
            {user ? (
              <div className="user-row" onClick={() => setShowUserMenu(!showUserMenu)}>
                {avatarUrl ? <Image src={avatarUrl} width={28} height={28} className="avatar" alt="" /> : <div className="avatar">{name[0]}</div>}
                {!collapsed && <span className="name">{name}</span>}
              </div>
            ) : (
              <button className="signin" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
                <LogIn size={14} />{!collapsed && (lang === 'zh' ? '登录' : 'Sign in')}
              </button>
            )}
            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-label">{lang === 'zh' ? '视图模式' : 'View Mode'}</div>
                <div className="user-menu-modes">
                  <button className="user-menu-mode-btn" onClick={() => setMode('os')}><Monitor size={13} /> OS</button>
                  <button className="user-menu-mode-btn active"><Globe size={13} /> Web</button>
                </div>
                <button onClick={() => supabase.auth.signOut()}><LogOut size={14} />{lang === 'zh' ? '退出登录' : 'Sign out'}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="main-content">
        {/* 顶部控制栏 */}
        <div className="top-bar">
          {/* 主题切换 */}
          <button className="nav-icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title={lang === 'zh' ? '切换主题' : 'Toggle theme'}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {/* 语言切换 */}
          <LangDropdown />
        </div>

        <SharedDocView pageId={activePage} />
      </div>

      {/* 全局样式 */}
      <style jsx global>{`
        * { box-sizing: border-box; margin:0; padding:0; font-family: 'DM Sans', system-ui, sans-serif; }
        .app-container { display: flex; height: 100vh; background: var(--surface); color: var(--ink); }
        .mobile-header { display: none; align-items: center; justify-content: space-between; padding:12px 16px; background: var(--card); border-bottom:1px solid var(--border); }
        .sidebar { position: relative; width:240px; background: var(--card); border-right:1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; transition: width 0.2s; }
        .sidebar.collapsed { width:60px; }
        .sidebar-overlay { display: none; position: fixed; inset:0; background: rgba(0,0,0,0.4); z-index:9; }
        .sidebar-inner { position: relative; z-index:10; height: 100%; display: flex; flex-direction: column; }
        .sidebar-header { height:48px; padding:0 16px; display: flex; align-items: center; justify-content: space-between; border-bottom:1px solid var(--border); }
        .logo-text { font-family: 'Noto Serif SC', serif; font-weight:700; font-size:16px; color: var(--ink); }
        .close-mobile { display: none; }
        .search-box { display: flex; align-items: center; gap:8px; padding:8px 12px; margin:8px; background: var(--surface); border-radius:8px; }
        .search-box input { border:none; background:none; outline:none; color: var(--ink); font-size:14px; width:100%; }
        .nav-section { padding:8px 16px; font-size:11px; color: var(--muted); text-transform: uppercase; letter-spacing:0.5px; }
        .nav-item { display: flex; align-items: center; gap:10px; height:40px; padding:0 16px; border-radius:8px; cursor:pointer; background:none; border:none; color: var(--muted); font-size:14px; line-height:1; text-align:left; margin:2px 8px; width: calc(100% - 16px); white-space: nowrap; overflow: hidden; }
        .nav-item:hover { background: var(--surface); color: var(--ink); }
        .nav-item.active { background: var(--teal-light); color: var(--teal); font-weight:600; }
        .sidebar-footer { margin-top: auto; padding:12px; border-top:1px solid var(--border); position: relative; }
        .user-row { display: flex; align-items: center; gap:10px; cursor:pointer; padding: 4px; border-radius: 8px; }
        .user-row:hover { background: var(--surface); }
        .avatar { width:28px; height:28px; border-radius:8px; background: var(--surface); display: grid; place-items: center; font-weight:600; color: var(--ink); }
        .user-menu { position: absolute; bottom:60px; left:8px; width:168px; background: var(--card); border:1px solid var(--border2); border-radius:10px; padding:6px 0; box-shadow:0 4px 20px rgba(0,0,0,0.12); z-index: 99; }
        .user-menu-label { padding:6px 14px 2px; font-size:11px; color: var(--muted); text-transform: uppercase; letter-spacing:0.08em; }
        .user-menu-modes { display: flex; gap:6px; padding:4px 14px 8px; border-bottom:1px solid var(--border); }
        .user-menu-mode-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:5px; padding:6px 0; border-radius:6px; border:1px solid var(--border2); background:none; cursor:pointer; font-size:12px; font-weight:600; color: var(--muted); font-family:inherit; }
        .user-menu-mode-btn.active { border-color: var(--teal); background: var(--teal-light); color: var(--teal); cursor:default; }
        .user-menu button { display: flex; align-items: center; gap:8px; width:100%; padding:8px 14px; background:none; border:none; color: var(--ink); cursor:pointer; font-size:13px; font-family:inherit; }
        .user-menu button:hover { background: var(--surface); }
        .signin { display: flex; align-items: center; gap:8px; width:100%; padding:8px; background:none; border:none; color: var(--muted); cursor:pointer; font-size:14px; font-family:inherit; }
        .main-content { flex:1; overflow-y: auto; padding:0; display: flex; flex-direction: column; }
        .top-bar { display: flex; align-items: center; justify-content: flex-end; gap:8px; padding:0 24px; height:48px; background: var(--card); border-bottom:1px solid var(--border); flex-shrink:0; }
        .nav-icon-btn { width:32px; height:32px; border-radius:8px; border:none; background:transparent; color: var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; transition: all .15s; }
        .nav-icon-btn:hover { background: var(--surface); color: var(--ink); }
        .lang-btn { width:44px; gap:3px; }
                        .breadcrumbs .active { color: var(--teal); font-weight:600; }
                                                                                                                                                                        @media (max-width: 768px) {
          .mobile-header { display: flex; }
          .sidebar { position: fixed; left:0; top:0; bottom:0; transform: translateX(-100%); transition: transform 0.2s; z-index:99; }
          .sidebar.mobile-open { transform: translateX(0); }
          .sidebar-overlay { display: block; }
          .close-mobile { display: flex; }
          .toggle-desktop { display: none; }
                  }
        [data-theme="dark"] .app-container { background: var(--surface); color: var(--ink); }
        [data-theme="dark"] .sidebar { background: var(--card); border-right-color: var(--border); }
        [data-theme="dark"] .sidebar-header { border-bottom-color: var(--border); }
        [data-theme="dark"] .top-bar { background: var(--card); border-bottom-color: var(--border); }
        [data-theme="dark"]         [data-theme="dark"] .user-menu { background: var(--card); border-color: var(--border2); }
        [data-theme="dark"] .nav-item.active { background: rgba(4,138,129,0.2); }
      `}</style>
    </div>
  )
}