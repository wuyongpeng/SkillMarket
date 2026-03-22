'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import axios from 'axios'
import { Calendar, User as UserIcon, Users, FileText, Settings, Flame, CheckCircle2, LogOut, Monitor, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useApp } from '@/lib/appContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

interface Profile {
  name: string; role: string; score: number; initial_score: number
  streak: number; max_streak: number; tasks_completed: number
  rank: number; total_members: number; joined_days: number
}
interface Task {
  id: number; title: string; tag: string; steps: string[]
  duration: string; badges: string[]; completed: boolean
}
interface GroupMember {
  name: string; color: string; week: number[]; streak: number; rank: number
}
interface Stats { today: string; weekday: string; day_num: number }

export default function AppShell({ user }: { user: User }) {
  const { theme, setTheme, setMode, t } = useApp()
  const [activePage, setActivePage] = useState('today')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [group, setGroup] = useState<GroupMember[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    // TODO: replace with real API calls when backend is ready
    setProfile({ name: '吴道子', role: '产品经理 · 7年', score: 71, initial_score: 47, streak: 23, max_streak: 31, tasks_completed: 87, rank: 2, total_members: 5, joined_days: 94 })
    setTasks([{ id: 1, title: '用 AI 将你昨天的一段会议纪要，改写成可直接发给老板的结构化决策备忘录', tag: '今日任务', duration: '预计 5 分钟', badges: ['沟通效率', '文档写作', 'Claude / ChatGPT'], completed: false, steps: ['打开 Claude 或 ChatGPT，粘贴你最近一次会议纪要（哪怕很简陋的文字记录都行）', '输入 Prompt：「将以上内容改写为决策备忘录，包含：背景一句话、核心决策、执行负责人与时间节点、风险提示」', '对比 AI 输出和你自己写的版本，记录最让你惊喜的一点，填入今日反馈'] }])
    setGroup([
      { name: '你', color: '#048a81', week: [1,1,1,1,1,1,1], streak: 23, rank: 2 },
      { name: '成员 1', color: '#5b4fcf', week: [1,1,1,1,1,1,1], streak: 31, rank: 1 },
      { name: '成员 2', color: '#d4890a', week: [1,1,0,1,1,0,1], streak: 12, rank: 3 },
      { name: '成员 3', color: '#c94040', week: [1,1,0,0,0,0,0], streak: 2, rank: 4 },
      { name: '成员 4', color: '#888', week: [1,0,1,0,1,0,1], streak: 7, rank: 5 },
    ])
    setStats({ today: '2026-03-22', weekday: '星期日', day_num: 23 })
  }, [])

  async function completeTask(taskId: number) {
    const res = await axios.post(`${API_BASE}/tasks/${taskId}/complete`)
    if (res.data.status === 'success') {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t))
      setProfile(prev => prev ? { ...prev, streak: prev.streak + 1, tasks_completed: prev.tasks_completed + 1 } : prev)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!profile || !stats) return <div className="loading">加载中...</div>

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const displayName = (user.user_metadata?.name as string) || user.email || '?'

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">起飞AI</div>
          <div className="logo-sub">AI Transformation OS</div>
          <button
            onClick={() => setMode('os')}
            title={t('切换到 OS 模式', 'Switch to OS Mode')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '5px 10px', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
          >
            <Monitor size={11} /> {t('切换到 OS 模式', 'Switch to OS Mode')}
          </button>
        </div>
        <nav className="nav">
          <div className="nav-section">主要功能</div>
          {[
            { id: 'today', icon: <Calendar className="nav-icon" />, label: '今日任务' },
            { id: 'profile', icon: <UserIcon className="nav-icon" />, label: '成长档案' },
            { id: 'group', icon: <Users className="nav-icon" />, label: '我的小组' },
            { id: 'report', icon: <FileText className="nav-icon" />, label: '季度报告' },
          ].map(item => (
            <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
              {item.icon}{item.label}
            </button>
          ))}
          <div className="nav-section">设置</div>
          <button className={`nav-item ${activePage === 'onboard' ? 'active' : ''}`} onClick={() => setActivePage('onboard')}>
            <Settings className="nav-icon" />重新测评
          </button>
        </nav>
        <div className="sidebar-user">
          {avatarUrl
            ? <Image src={avatarUrl} alt="avatar" width={30} height={30} className="avatar" />
            : <div className="avatar">{displayName[0].toUpperCase()}</div>
          }
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div className="role">{profile.role}</div>
          </div>
          <button onClick={handleSignOut} title="退出登录" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px', flexShrink: 0 }}>
            <LogOut size={14} />
          </button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title={t('切换主题','Toggle theme')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px', flexShrink: 0 }}>
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {activePage === 'today' && <TodayPage profile={profile} tasks={tasks} stats={stats} onComplete={completeTask} />}
        {activePage === 'profile' && <ProfilePage profile={profile} />}
        {activePage === 'group' && <GroupPage group={group} />}
        {activePage === 'report' && <ReportPage profile={profile} />}
        {activePage === 'onboard' && <Onboarding onComplete={() => setActivePage('today')} />}
      </div>
    </div>
  )
}

/* ── TODAY ── */
function TodayPage({ profile, tasks, stats, onComplete }: { profile: Profile; tasks: Task[]; stats: Stats; onComplete: (id: number) => void }) {
  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="page-title">今日任务</div>
          <div className="page-sub">{stats.today} · {stats.weekday} · 第{stats.day_num}天</div>
        </div>
        <div className="topbar-right">
          <div className="streak-pill"><Flame size={12} fill="currentColor" />连续 {profile.streak} 天</div>
          <button className="btn btn-ghost btn-sm">跳过今天</button>
        </div>
      </div>
      <div className="grid4">
        <StatCard label="累计完成任务" value={profile.tasks_completed} unit="个" note="↑ 本周完成 6 个" />
        <StatCard label="当前连续打卡" value={profile.streak} streak note={`历史最长 ${profile.max_streak} 天`} />
        <StatCard label="AI就绪度评分" value={profile.score} unit="分" note={`较入测时 +${profile.score - profile.initial_score} 分`} color="var(--teal)" />
        <StatCard label="小组本周排名" value={profile.rank} unit={` / ${profile.total_members}`} note="超越 1 位成员" />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>今天的任务</h3>
          <span className="badge badge-teal">产品经理 · AI辅助</span>
        </div>
        {tasks.map(task => <TaskCard key={task.id} task={task} onComplete={() => onComplete(task.id)} />)}
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>本月打卡记录</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>3月</span>
        </div>
        <div className="streak-bar">
          {Array.from({ length: 31 }).map((_, i) => (
            <div key={i} className={`streak-dot ${i < 16 ? 'done' : i === 16 ? 'today' : 'future'}`} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          {[['var(--teal)', '已完成'], ['var(--streak)', '今天'], ['var(--border2)', '未完成']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 1, background: c }} />{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, note, streak, color }: { label: string; value: number; unit?: string; note: string; streak?: boolean; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={streak ? 'stat-streak' : 'stat-val'} style={{ color }}>
        {value}{unit && <span className="unit">{unit}</span>}
      </div>
      <div className="stat-note" style={streak ? { color: 'var(--streak)' } : {}}>{note}</div>
    </div>
  )
}

function TaskCard({ task, onComplete }: { task: Task; onComplete: () => void }) {
  return (
    <div className="task-card">
      <div className="task-header">
        <div className="task-tag">📋 {task.tag} · {task.duration}</div>
        <div className="task-title">{task.title}</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {task.badges.map(b => <span key={b} className="badge badge-ink">{b}</span>)}
        </div>
      </div>
      <div className="task-steps">
        {task.steps.map((step, i) => (
          <div className="step" key={i}>
            <div className="step-num">{i + 1}</div>
            <div className="step-text">{step}</div>
          </div>
        ))}
      </div>
      <div className="task-footer">
        <div className="task-meta">🎯 完成后请自评 1-5 分 · 本任务匹配你的第 2 阶段进度</div>
        <button className={`complete-btn ${task.completed ? 'done' : ''}`} onClick={onComplete} disabled={task.completed}>
          {task.completed ? <CheckCircle2 size={12} /> : <div style={{ width: 12 }} />}
          {task.completed ? '已完成！' : '标记完成'}
        </button>
      </div>
    </div>
  )
}

/* ── PROFILE ── */
function ProfilePage({ profile }: { profile: Profile }) {
  return (
    <div className="page">
      <div className="page-title">成长档案</div>
      <div className="page-sub">你的 AI 转型记录 · 加入 {profile.joined_days} 天</div>
      <div className="grid2" style={{ marginBottom: '12px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <svg className="ring-svg" width="80" height="80" viewBox="0 0 80 80">
              <circle className="ring-track" cx="40" cy="40" r="32" />
              <circle className="ring-fill" cx="40" cy="40" r="32" strokeDasharray="201" strokeDashoffset={201 * (1 - profile.score / 100)} />
              <text className="ring-text" x="40" y="44" textAnchor="middle">{profile.score}</text>
              <text className="ring-sub" x="40" y="56" textAnchor="middle">AI就绪度</text>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>入测评分 → 当前</div>
              <div style={{ fontSize: '22px', fontWeight: 300 }}>
                {profile.initial_score} → <span style={{ color: 'var(--teal)', fontWeight: 500 }}>{profile.score}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--teal)', marginTop: '4px' }}>↑ 提升 {profile.score - profile.initial_score} 分 · 超越同行业 68% 用户</div>
              <div className="prog-bar" style={{ marginTop: '10px' }}>
                <div className="prog-fill" style={{ width: `${profile.score}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>转型阶段</h3>
          <TimelineItem done title="AI观望者" meta="了解AI工具 · Day 1-14" />
          <TimelineItem done title="日常使用者" meta="每日使用AI · Day 14-60" tag="已达成" tagType="teal" />
          <TimelineItem active title="AI协作者" meta="工作流整合 · Day 60-180" tag="进行中" tagType="amber" />
          <TimelineItem future title="AI增强专家" meta="领域深度整合 · Day 180+" />
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>已解锁技能标签</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>共 14 个</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {['文档写作', '会议纪要', '数据分析辅助', 'Prompt设计', '产品需求描述', '竞品研究', '用户调研设计', '代码审阅辅助'].map(s => (
            <span key={s} className="badge badge-teal" style={{ fontSize: '12px', padding: '4px 12px' }}>{s}</span>
          ))}
          <span style={{ background: 'var(--border)', color: 'var(--muted)', fontSize: '12px', padding: '4px 12px', borderRadius: '20px' }}>+4 个待解锁</span>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ done, active, future, title, meta, tag, tagType }: { done?: boolean; active?: boolean; future?: boolean; title: string; meta: string; tag?: string; tagType?: string }) {
  return (
    <div className="timeline-item">
      <div className={`tl-dot ${done ? 'done' : active ? 'active' : 'future'}`}>
        {done ? '✓' : active ? '→' : '○'}
      </div>
      <div className="tl-content">
        <div className="tl-title">
          {title}
          {tag && <span className={`badge badge-${tagType} tl-badge`}>{tag}</span>}
        </div>
        <div className="tl-meta">{meta}</div>
      </div>
    </div>
  )
}

/* ── GROUP ── */
function GroupPage({ group }: { group: GroupMember[] }) {
  return (
    <div className="page">
      <div className="page-title">我的小组</div>
      <div className="page-sub">互联网产品组 · 5 人 · 本周第 2 名</div>
      <div className="grid2">
        <div className="card">
          <h3>本周小组排行</h3>
          {group.map(m => (
            <div key={m.name} className="group-member">
              <div className="member-left">
                <div style={{ width: 16, textAlign: 'right', fontSize: 13, color: 'var(--muted)' }}>{m.rank}</div>
                <div className="member-avatar" style={{ background: m.color }}>{m.name[0]}</div>
                <div>
                  <div className="member-name">{m.name} {m.name === '你' && <span style={{ color: 'var(--teal)', fontSize: 10 }}>(我)</span>}</div>
                  <div className="member-streak">连续 {m.streak} 天</div>
                </div>
              </div>
              <div className="member-dots">
                {m.week.slice(0, 5).map((d, i) => <div key={i} className="mdot" style={{ background: d ? 'var(--teal)' : 'var(--border2)' }} />)}
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>小组动态</h3>
          {[
            { icon: '🎉', title: '成员 2 达成「连续30天」成就', time: '30分钟前', type: 'teal' },
            { icon: '⚡', title: '成员 4 今日完成任务', time: '1小时前', type: '' },
            { icon: '⚠️', title: '成员 3 已 3 天未打卡', time: '系统提醒', type: 'amber' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px', background: a.type === 'teal' ? 'var(--teal-light)' : a.type === 'amber' ? 'var(--amber-light)' : 'var(--surface)', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px' }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: a.type === 'teal' ? 'var(--teal)' : a.type === 'amber' ? 'var(--amber)' : 'inherit' }}>{a.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── REPORT ── */
function ReportPage({ profile }: { profile: Profile }) {
  return (
    <div className="page">
      <div className="page-title">季度报告</div>
      <div className="report-highlight">
        <div className="report-title">2026 Q1 · AI 转型成长报告</div>
        <div className="report-period">2026年1月 — 3月 · {profile.name} · 产品经理</div>
        <div className="report-stats">
          <div><div className="rs-val">{profile.tasks_completed}</div><div className="rs-label">完成任务数</div></div>
          <div><div className="rs-val">+{profile.score - profile.initial_score}</div><div className="rs-label">评分提升</div></div>
          <div><div className="rs-val">68%</div><div className="rs-label">超越同行比例</div></div>
        </div>
      </div>
    </div>
  )
}

/* ── ONBOARDING ── */
function Onboarding({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="page">
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div className="page-title">职业 AI 测评</div>
        <div className="question">你目前的工作领域是？</div>
        <div className="option-grid">
          {['互联网 / 科技', '金融 / 咨询', '教育 / 培训', '医疗 / 健康'].map(o => (
            <div key={o} className="option" onClick={onComplete}>{o}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
