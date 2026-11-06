import React, { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect, useContext } from 'react'
import { HeroSky, WeatherBadge, WeekWeather, toggleWx, useWeather, WEATHER_CSS } from './weather.jsx'
import { DOMAIN, GOALS, setGoals, setWeather, eventTone, TONES, parse, fromAI, frequent, ghostSlots, derive, seed, effectsOf, completeEvent, todoToExpense, fmtTime, fmtHM, money, num, hourOf, startOfDay, MEAL_NAME, uid } from './data.js'
import { CSS, FONT_HREF } from './styles.js'
import { rgStarSky, rgDaySky, rgSunInfo, RgSwitch } from './sky.js'
import { bindHover } from './hover.js'
import { LiquidBar } from './liquid.jsx'
import { WeightFog, Private, FOG_CSS } from './fog.jsx'
import { ReceiptPrinter, RECEIPT_CSS } from './receipt.jsx'
import { MoneyStrip, SleepSky, useSleepRow, MoveBars, useTaste, WeightScrub, BackEnergy, BackMoney, BackSleep, BackMove, BackBody, CARDS_CSS } from './cards.jsx'
import { suggestGoals, GoalsPanel, GoalsButton, GOALS_CSS } from './goals.jsx'

const KEY = 'dsh-rigui:v1'
const FOODS_KEY = 'dsh-rigui:foods'
const GOALS_KEY = 'dsh-rigui:goals'
const loadGoals = () => { try { const g = JSON.parse(localStorage.getItem(GOALS_KEY)); if (g && typeof g === 'object') return { adopted: {}, texts: {}, ...g } } catch (e) {} return { adopted: {}, texts: {} } }
const NUM_KEYS = ['kcal', 'budget', 'sleep', 'workoutsPerWeek', 'weight', 'monthWeight']
const loadMine = () => { try { return JSON.parse(localStorage.getItem(FOODS_KEY)) || {} } catch (e) { return {} } }

// 让 DSH 里的模型把一句话拆成记录（主机半边的 /api/rigui）
async function askAI(text, mine, weightKg, signal) {
  const d = new Date(), wk = '日一二三四五六'[d.getDay()]
  const nowStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' 周' + wk
  const res = await fetch('api/rigui', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ endpoint: 'parse', payload: { text, now: nowStr, weightKg, mine } }), signal })
  if (!res.ok) throw new Error(res.status === 404 ? 'AI 接口还没加载，重启一次 DSH' : 'AI 接口出错 ' + res.status)
  const j = await res.json()
  if (!j.ok) throw new Error(j.error || 'AI 没给出结果')
  return { result: j.result, model: j.model }
}
const C = { sleep: '#3D4FB8', move: '#1E9E6A', food: '#F2994A', money: '#7C5CE0', body: '#0E8A8A', time: '#1F2328', link: '#E5484D' }

// 领域 → 哪几张卡会动
const CARDS_OF = {
  food: ['energy', 'dial', 'timeline'],
  money: ['money', 'timeline'],
  move: ['move', 'energy', 'dial', 'timeline'],
  sleep: ['sleep', 'dial', 'next'],
  time: ['dial', 'week', 'next', 'todos'],
  body: ['body'],
  link: ['insights'],
}
// 每种记录会动到哪几张卡
function cardsFor(records, now = Date.now()) {
  const c = new Set()
  const today = (t) => startOfDay(t) === startOfDay(now)
  records.forEach((r) => {
    if (r.type === 'meal') { c.add('energy'); c.add('timeline'); if (today(r.t)) c.add('dial') }
    if (r.type === 'expense' || r.type === 'income') { c.add('money'); c.add('timeline'); if (today(r.t)) c.add('dial') }
    if (r.type === 'workout') { c.add('move'); c.add('energy'); c.add('timeline'); c.add('dial') }
    if (r.type === 'sleep') { c.add('sleep'); c.add('dial'); c.add('next') }
    if (r.type === 'weight') { c.add('body'); c.add('timeline') }
    if (r.type === 'event') { c.add('week'); c.add('next'); if (today(r.t)) c.add('dial') }
    if (r.type === 'todo') { c.add('todos'); if (r.amount) c.add('money') }
  })
  if (records.length) c.add('insights')
  return c
}
const CARD_COLOR = { energy: C.food, dial: '#F4F5F1', timeline: C.time, money: C.money, move: C.move, sleep: C.sleep, next: C.move, week: C.time, todos: C.time, body: C.body, insights: C.link }
const INSIGHT_CARD = { sleep: 'sleep', move: 'move', food: 'energy', money: 'money', body: 'body', time: 'week' }

function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && Array.isArray(v.records)) return v } catch (e) {}
  return { records: seed(Date.now()), sample: true }
}

// ---------- 小部件 ----------
function Num({ value, format = num, className = 'lf-num', style }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const a = from.current, b = value
    if (a === b) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShown(b); from.current = b; return }
    let raf, t0
    const step = (t) => {
      if (!t0) t0 = t
      const p = Math.min(1, (t - t0) / 800), e = 1 - Math.pow(1 - p, 3)
      setShown(a + (b - a) * e)
      if (p < 1) raf = requestAnimationFrame(step); else from.current = b
    }
    raf = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(raf); from.current = b }
  }, [value])
  return <span className={className} style={style}>{format(shown)}</span>
}

const Icon = {
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  arrow: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
}

// ---------- 表盘 ----------
function Dial({ S, size = 380, hover, setHover }) {
  const c = size / 2, R = c - 42
  const pt = (r, h) => { const a = (h / 24) * Math.PI * 2; return [c + r * Math.sin(a), c - r * Math.cos(a)] }
  const arc = (r, h1, h2) => {
    if (h2 < h1) h2 += 24
    if (h2 - h1 >= 23.99) h2 = h1 + 23.99
    const [x1, y1] = pt(r, h1), [x2, y2] = pt(r, h2)
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${h2 - h1 > 12 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }
  const now = hourOf(S.now)
  const arcs = []
  if (S.lastNight) {
    const b = hourOf(S.lastNight.t), w = b + S.lastNight.hours
    arcs.push({ k: 'sleep', h1: b, h2: w % 24, color: C.sleep, label: '睡了 ' + fmtHM(S.lastNight.hours), sub: fmtTime(S.lastNight.t) + ' 入睡' })
  }
  S.todayEvents.forEach((e) => {
    arcs.push({ k: e.id, h1: hourOf(e.t), h2: hourOf(e.end || e.t + 3600000), color: e.domain === 'move' ? C.move : '#C9CDC5', label: e.title, sub: fmtTime(e.t) + ' – ' + fmtTime(e.end), future: e.t > S.now, ring: 0 })
  })
  S.workouts.filter((w) => !S.todayEvents.some((e) => e.id === w.from)).forEach((w) => {
    arcs.push({ k: w.id, h1: hourOf(w.t), h2: hourOf(w.t) + w.minutes / 60, color: C.move, label: w.title, sub: '消耗 ' + w.kcal + ' 千卡' })
  })
  const meals = S.meals.map((m) => ({ k: m.id, h: hourOf(m.t), label: m.title, sub: MEAL_NAME[m.meal] + ' · ' + m.kcal + ' 千卡' }))
  const spends = []
  S.timeline.forEach((g) => g.items.filter((r) => r.type === 'expense').forEach((r) => spends.push({ k: r.id, h: hourOf(r.t), label: r.title, sub: money(r.amount) + ' · ' + r.cat })))
  const ticks = []
  for (let i = 0; i < 96; i++) {
    const h = i / 4, major = i % 24 === 0, hour = i % 4 === 0
    const [x1, y1] = pt(major ? R + 20 : hour ? R + 25 : R + 28, h), [x2, y2] = pt(R + 32, h)
    ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={major ? '#F4F5F1' : hour ? 'rgba(244,245,241,.45)' : 'rgba(244,245,241,.18)'} strokeWidth={major ? 2 : 1} strokeLinecap="round" />)
  }
  const [hx1, hy1] = pt(R - 18, now), [hx2, hy2] = pt(R + 36, now)
  const hv = hover && [...arcs, ...meals, ...spends].find((a) => a.k === hover)
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: size, aspectRatio: '1 / 1', justifySelf: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" role="img" aria-label={'今天的 24 小时：' + arcs.map((a) => a.label).join('，')}>
        <circle cx={c} cy={c} r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="20" />
        <path d={arc(R, 0, now)} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="20" className="lf-dialdraw" pathLength="1" />
        {ticks}
        {arcs.map((a, i) => (
          <path key={a.k} d={arc(R, a.h1, a.h2)} fill="none" stroke={a.color} strokeWidth={hover === a.k ? 26 : 20} strokeLinecap="round"
            opacity={a.future ? 0.55 : 1} strokeDasharray={a.future ? undefined : undefined} className="lf-arc lf-dialdraw" pathLength="1"
            style={{ animationDelay: 0.25 + i * 0.12 + 's', cursor: 'pointer' }}
            onMouseMove={() => hover !== a.k && setHover(a.k)} onMouseLeave={() => setHover(null)} />
        ))}
        {meals.map((m, i) => { const [x, y] = pt(R - 30, m.h); return <circle key={m.k} cx={x} cy={y} r={hover === m.k ? 9 : 6.5} fill={C.food} className="lf-enter" style={{ animationDelay: 0.9 + i * 0.08 + 's', cursor: 'pointer', transition: 'r .2s' }} onMouseMove={() => hover !== m.k && setHover(m.k)} onMouseLeave={() => setHover(null)} /> })}
        {spends.map((s, i) => { const [x, y] = pt(R - 50, s.h); const z = hover === s.k ? 13 : 9; return <rect key={s.k} x={x - z / 2} y={y - z / 2} width={z} height={z} rx="2.5" fill={C.money} className="lf-enter" style={{ animationDelay: 1 + i * 0.08 + 's', cursor: 'pointer' }} onMouseMove={() => hover !== s.k && setHover(s.k)} onMouseLeave={() => setHover(null)} /> })}
        {[0, 6, 12, 18].map((h) => { const [x, y] = pt(R - 64, h); return <text key={h} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="rgba(244,245,241,.5)">{h}</text> })}
        <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#F4F5F1" strokeWidth="3" strokeLinecap="round" />
        <circle cx={hx2} cy={hy2} r="6" fill="#F4F5F1" />
        <circle cx={hx2} cy={hy2} r="11" fill="none" stroke="#F4F5F1" strokeOpacity=".4" style={{ animation: 'lf-breathe 2.4s ease-in-out infinite' }} />
      </svg>
      <div style={{ position: 'absolute', inset: '32%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 4, pointerEvents: 'none' }}>
        {hv ? (
          <>
            <span style={{ fontSize: 22, fontWeight: 600, color: '#F4F5F1', lineHeight: 1.15 }}>{hv.label}</span>
            <span style={{ fontSize: 13, color: 'rgba(244,245,241,.6)' }}>{hv.sub}</span>
          </>
        ) : (
          <>
            <span className="lf-num" style={{ fontSize: 52, fontWeight: 500, color: '#F4F5F1', lineHeight: 1 }}>{fmtTime(S.now)}</span>
            <span style={{ fontSize: 13, color: 'rgba(244,245,241,.6)' }}>今天过去了 {Math.round((now / 24) * 100)}%</span>
          </>
        )}
      </div>
    </div>
  )
}

// ---------- AI 状态 ----------
function AiBadge({ status, model, error }) {
  if (status === 'wait' || status === 'loading') return <span className="lf-row" style={{ gap: 8 }}><span className="lf-think"><i /><i /><i /></span>AI 正在识别</span>
  if (status === 'done') return <span className="lf-row" style={{ gap: 6 }}><span className="lf-dot" style={{ background: '#5FD3A2' }} />AI 识别{model ? ' · ' + model : ''}，数字不对可以直接改</span>
  if (status === 'error') return <span className="lf-row" style={{ gap: 6 }} title={error}><span className="lf-dot" style={{ background: '#E5A84D' }} />AI 暂时用不了（{error}），先按本地规则</span>
  return <span>本地预判</span>
}

// ---------- 小组件布局 ----------
const LAYOUT_KEY = 'dsh-rigui:layout'
const ROW_H = 116, GAP = 14
const WIDGETS = {
  energy: { name: '今天还能吃', w: 4, h: 2, minW: 3, minH: 2 },
  money: { name: '这个月还能花', w: 4, h: 2, minW: 3, minH: 2 },
  next: { name: '接下来', w: 4, h: 2, minW: 3, minH: 2 },
  timeline: { name: '今天记下的', w: 5, h: 6, minW: 4, minH: 3 },
  sleep: { name: '睡眠', w: 4, h: 3, minW: 3, minH: 3 },
  move: { name: '运动', w: 3, h: 3, minW: 3, minH: 2 },
  insights: { name: '它们之间的关系', w: 4, h: 3, minW: 3, minH: 2 },
  body: { name: '体重', w: 3, h: 3, minW: 3, minH: 2 },
  week: { name: '接下来七天', w: 8, h: 3, minW: 6, minH: 3 },
  todos: { name: '要做的事', w: 4, h: 3, minW: 3, minH: 2 },
}
const DEFAULT_LAYOUT = { order: Object.keys(WIDGETS), size: {} }
function loadLayout() {
  try {
    const v = JSON.parse(localStorage.getItem(LAYOUT_KEY))
    if (v && Array.isArray(v.order)) {
      const order = v.order.filter((id) => WIDGETS[id]).concat(Object.keys(WIDGETS).filter((id) => !v.order.includes(id)))
      return { order, size: v.size || {} }
    }
  } catch (e) {}
  return DEFAULT_LAYOUT
}
const LayoutCtx = React.createContext(null)
const FlipCtx = React.createContext(null)   // 让背面的内容也能把卡片翻回正面
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const Grip = <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="6" r="1.8" /><circle cx="16" cy="6" r="1.8" /><circle cx="8" cy="12" r="1.8" /><circle cx="16" cy="12" r="1.8" /><circle cx="8" cy="18" r="1.8" /><circle cx="16" cy="18" r="1.8" /></svg>
const Corner = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M20 10v10H10" /><path d="M20 20l-7-7" /></svg>

// ---------- 卡片外壳 ----------
function Card({ id, cls = '', bg, color, refs, flash, armed, hl, dim, children, idx = 0, style, floats, back, flipRef, tapFlip = true }) {
  // 翻面：先转到 90° 侧过去，换内容，再从另一边转回来，最后轻轻回弹
  const [face, setFace] = useState(0)
  const flipping = useRef(false)
  const flip = () => {
    const n = el.current; if (!n || flipping.current) return
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) { setFace((f) => 1 - f); return }
    flipping.current = true; n.classList.add('lf-flipping')
    const dir = face ? -1 : 1
    const a = n.animate([{ transform: 'perspective(1000px) rotateY(0deg)' }, { transform: `perspective(1000px) rotateY(${90 * dir}deg) scale(.96)` }], { duration: 210, easing: 'cubic-bezier(.55,0,.85,.45)' })
    a.onfinish = () => {
      setFace((f) => 1 - f)
      const b = n.animate([{ transform: `perspective(1000px) rotateY(${-90 * dir}deg) scale(.96)` }, { transform: `perspective(1000px) rotateY(${7 * dir}deg)`, offset: 0.68 }, { transform: 'perspective(1000px) rotateY(0deg)' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.3,1)' })
      b.onfinish = () => { flipping.current = false; n.classList.remove('lf-flipping') }
    }
  }
  const faceRef = useRef(0); faceRef.current = face
  if (flipRef) flipRef.current = flip
  // 不靠点卡片翻面的卡（主卡片）：翻到背面后，点页面任何地方都翻回来
  useEffect(() => {
    if (tapFlip || !face) return
    const k = (e) => { if (e.target.closest && e.target.closest('.lf-wk-edit')) return; if (faceRef.current) flip() }
    const esc = (e) => { if (e.key === 'Escape' && faceRef.current) flip() }
    const t = setTimeout(() => document.addEventListener('click', k), 0)
    window.addEventListener('keydown', esc)
    return () => { clearTimeout(t); document.removeEventListener('click', k); window.removeEventListener('keydown', esc) }
  }, [face, tapFlip])
  const onCardClick = (e) => {
    if (!back || !tapFlip) return
    if (e.target.closest('button,a,input,textarea,select,[role=button],.lf-grip,.lf-resize')) return
    if (window.getSelection && String(window.getSelection())) return
    flip()
  }
  const el = useRef(null)
  useEffect(() => {
    const n = el.current; if (!flash || !n) return
    n.classList.remove('lf-enter'); n.classList.remove('flash'); void n.offsetWidth; n.classList.add('flash')
    const t = setTimeout(() => n.classList.remove('flash'), 1500)
    return () => clearTimeout(t)
  }, [flash])
  useEffect(() => bindHover(el.current), [])
  const [entered, setEntered] = useState(false)
  useEffect(() => { const t = setTimeout(() => setEntered(true), 1400); return () => clearTimeout(t) }, [])
  const L = useContext(LayoutCtx)
  const W = L && WIDGETS[id]
  // 内容放不下时，底部渐隐
  const [clip, setClip] = useState(false)
  useEffect(() => {
    const n = el.current; if (!n || !W) return
    const ro = new ResizeObserver(() => setClip(n.scrollHeight > n.clientHeight + 2))
    ro.observe(n); if (n.firstElementChild) ro.observe(n.firstElementChild)
    return () => ro.disconnect()
  }, [W])
  const lay = W ? L.place(id) : null
  const dragging = W && L.active === id
  return (
    <section ref={(n) => { el.current = n; refs.current[id] = n }} data-card={id} data-face={face} onClick={onCardClick}
      className={['lf-card', back ? 'has-back' : '', entered ? '' : 'lf-enter', W ? 'lf-widget' : cls, armed ? 'armed' : '', hl ? 'hl' : '', dim ? 'dim' : '', clip ? 'clip' : '', dragging ? 'lf-lifted' : ''].join(' ')}
      style={Object.assign({ background: bg, color, '--c': CARD_COLOR[id] || '#1F2328', '--bgc': bg || 'var(--card)', '--sheen-c': color && color !== '#1F2328' ? 'rgba(255,255,255,.2)' : undefined, animationDelay: 0.15 + idx * 0.05 + 's' },
        lay ? { gridColumn: 'span ' + lay.span, gridRow: 'span ' + lay.h, order: lay.order } : null, W ? null : style)}>
      {W ? <div className="lf-widget-body" style={style}><FlipCtx.Provider value={flip}>{face && back ? back : children}</FlipCtx.Provider></div> : (face && back ? back : children)}
      {W && back && <button type="button" className="lf-flip" aria-label={face ? '翻回正面' : '翻到背面，看看怎么算的'} title={face ? '翻回去' : '看看怎么算的'} onClick={flip}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" /><path d="M4 3v5h5" /><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" /><path d="M20 21v-5h-5" /></svg>
      </button>}
      {W && (
        <>
          <button type="button" className="lf-grip" aria-label={'移动「' + W.name + '」，方向键调整位置'} title="按住拖动"
            onPointerDown={(e) => L.startDrag(id, e)} onKeyDown={(e) => L.keyMove(id, e)}><span className="lf-grip-bar" /></button>
          <button type="button" className="lf-resize" aria-label={'调整「' + W.name + '」大小，方向键放大缩小'} title="拖动改变大小"
            onPointerDown={(e) => L.startResize(id, e)} onKeyDown={(e) => L.keyResize(id, e)}>{Corner}</button>
          {L.resizing === id && <span className="lf-size-tag">{lay.w} × {lay.h}</span>}
        </>
      )}
      <span className="lf-sheen" aria-hidden="true" />
      {floats && floats.map((f, k) => (
        <span key={f.id} className="lf-float" style={{ color: f.color, top: 64 + k * 28 }}>{f.text}</span>
      ))}
    </section>
  )
}

// ---------- 主体 ----------
export default function LifeApp() {
  // 日夜：跟着日出日落走；手动拨过的，保持到下一次日出或日落
  const [, setSunTick] = useState(0)
  useEffect(() => { const iv = setInterval(() => setSunTick((x) => x + 1), 3e4); return () => clearInterval(iv) }, [])
  const sunInfo = rgSunInfo(Date.now())
  const [ovr, setOvr] = useState(() => {
    try { const o = JSON.parse(localStorage.getItem('rigui-theme2')); return o && o.until > Date.now() ? o : null } catch (e) { return null }
  })
  const isDark = ovr && ovr.until > Date.now() ? ovr.t === 'dark' : sunInfo.dark
  window.__rgDark = isDark
  useEffect(() => { window.dispatchEvent(new Event('rg-theme')) }, [isDark])
  const themeRef = useRef(null), skyRef = useRef(null), skyOrigin = useRef(null), themingT = useRef(0), skyApi = useRef(null)
  // 夜空：星星从开关停下的位置依次亮起
  useEffect(() => {
    const el = skyRef.current; if (!el) return
    const api = rgStarSky(el); skyApi.current = api
    return () => api.stop()
  }, [])
  useEffect(() => {
    const api = skyApi.current; if (!api) return
    const o = skyOrigin.current; skyOrigin.current = null
    if (isDark) o ? api.bloom(o.x, o.y) : api.full()
  }, [isDark])
  const setDark = (v) => {
    const o = v === sunInfo.dark ? null : { t: v ? 'dark' : 'light', until: sunInfo.next }
    try { o ? localStorage.setItem('rigui-theme2', JSON.stringify(o)) : localStorage.removeItem('rigui-theme2') } catch (e) {}
    const b = themeRef.current && themeRef.current.querySelector('.lf-sw')
    if (b) { const r = b.getBoundingClientRect(); skyOrigin.current = { x: r.left + (v ? r.width - r.height / 2 : r.height / 2), y: r.top + r.height / 2 } }
    // 换主题的 0.7 秒里所有颜色一起渐变
    const root = rootRef.current
    if (root) { root.classList.add('lf-theming'); clearTimeout(themingT.current); themingT.current = setTimeout(() => root.classList.remove('lf-theming'), 900) }
    setOvr(o)
  }
  const [db, setDb] = useState(load)
  const [now, setNow] = useState(Date.now())
  const [text, setText] = useState('')
  const [mine, setMine] = useState(loadMine)
  const [ai, setAi] = useState({ text: '', status: 'idle' })
  const [edits, setEdits] = useState({})
  const aiCache = useRef(new Map()), aiInflight = useRef(new Map()), S0 = useRef({}), mineRef = useRef({})
  const [hover, setHover] = useState(null)
  const [threads, setThreads] = useState(null)
  const [flash, setFlash] = useState({})
  const [focusInsight, setFocusInsight] = useState(null)
  const [geo, setGeo] = useState({ w: 0, h: 0 })
  const [toast, setToast] = useState(null)
  const rootRef = useRef(null), inputRef = useRef(null), refs = useRef({})

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  useEffect(() => {
    if (document.querySelector('link[data-lf-font]')) return
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONT_HREF; l.setAttribute('data-lf-font', '')
    document.head.appendChild(l)
  }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch (e) {} }, [db])
  useEffect(() => {
    const k = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current && inputRef.current.focus() } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => {
    const root = rootRef.current; if (!root) return
    let t, on = false
    const onWheel = (e) => {
      // 卡片里自己能滚的列表（待办、归档）：让它自己滚，不去挡指针
      const inner = e.target.closest && e.target.closest('.lf-inner-scroll')
      if (inner && inner.scrollHeight > inner.clientHeight + 1) {
        const atTop = inner.scrollTop <= 0, atEnd = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atEnd)) return
      }
      if (!on) { root.classList.add('lf-scrolling'); on = true; setHover(null); setFocusInsight(null) }
      clearTimeout(t); t = setTimeout(() => { root.classList.remove('lf-scrolling'); on = false }, 160)
    }
    root.addEventListener('wheel', onWheel, { passive: true })
    return () => { root.removeEventListener('wheel', onWheel); clearTimeout(t) }
  }, [])
  useLayoutEffect(() => {
    const el = rootRef.current; if (!el) return
    const ro = new ResizeObserver(() => setGeo({ w: el.clientWidth, h: el.offsetHeight }))
    ro.observe(el); return () => ro.disconnect()
  }, [])

  const [goals, setGoalsState] = useState(loadGoals)
  const [goalsOpen, setGoalsOpen] = useState(false)
  useEffect(() => { try { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)) } catch (e) {} }, [goals])
  useMemo(() => { const g = {}; NUM_KEYS.forEach((k) => { if (goals[k] != null) g[k] = goals[k] }); setGoals(g) }, [goals])
  const weatherW = (() => { try { return JSON.parse(localStorage.getItem('dsh-rigui:weather')) } catch (e) { return null } })()
  const [wTick, setWTick] = useState(0)
  useEffect(() => { const iv = setInterval(() => setWTick((x) => x + 1), 60000); return () => clearInterval(iv) }, [])
  useMemo(() => setWeather(weatherW), [wTick, weatherW && weatherW.at])
  const S = useMemo(() => derive(db.records, now), [db.records, now, goals, weatherW && weatherW.at])
  const suggestions = useMemo(() => suggestGoals(S, db.records), [S, db.records])
  const adoptGoal = (sg, v) => setGoalsState((g) => {
    const n = { ...g, adopted: { ...g.adopted, [sg.id]: true }, texts: { ...g.texts } }
    if (sg.num) n[sg.num.key] = v; else n.texts[sg.id] = v
    return n
  })
  const undoGoal = (sg) => setGoalsState((g) => {
    const n = { ...g, adopted: { ...g.adopted }, texts: { ...g.texts } }
    delete n.adopted[sg.id]; if (sg.num) delete n[sg.num.key]; else delete n.texts[sg.id]
    return n
  })
  const [rootRect, setRootRect] = useState(null)
  const openGoals = () => { const r = rootRef.current && rootRef.current.getBoundingClientRect(); setRootRect(r ? { left: r.left, width: r.width } : null); setGoalsOpen(true) }
  const usual = useMemo(() => frequent(db.records, now), [db.records, now])
  const ghosts = useMemo(() => ghostSlots(db.records, now), [db.records, now])
  const [sayFocus, setSayFocus] = useState(false)
  // 该记的事不再单独占一行框，直接写进输入框的提示里
  const sayHint = (() => {
    const nowH = (now - S.today) / 3600000
    const due = ghosts.filter((g) => g.h <= nowH).sort((a, b) => b.h - a.h)[0]
    return due ? due.title.replace(/[？?]$/, '') + '？说一句就记下' : '吃了什么、花了多少、练了多久，说一句就记下'
  })()
  // 点空位：把平时那句话填进输入框
  const fillFrom = (phrase) => {
    setText(phrase)
    const el = inputRef.current; if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => { el.focus({ preventScroll: true }); el.setSelectionRange(phrase.length, phrase.length) }, 280)
  }
  S0.current = S
  useEffect(() => { try { localStorage.setItem(FOODS_KEY, JSON.stringify(mine)) } catch (e) {} }, [mine])

  // 打完一句（输入法拼字结束、停手 0.8 秒）才识别；接着打字就取消上一次请求
  const [settled, setSettled] = useState('')
  const composing = useRef(false), [compTick, setCompTick] = useState(0)
  const ctrl = useRef(null)
  const runAI = useCallback((t, own) => {
    const key = t.trim()
    if (aiCache.current.has(key)) return Promise.resolve(aiCache.current.get(key))
    if (aiInflight.current.has(key)) return aiInflight.current.get(key)
    const ac = new AbortController()
    if (own) { if (ctrl.current && ctrl.current.key !== key) ctrl.current.ac.abort(); ctrl.current = { key, ac } }
    const p = askAI(key, mineRef.current, S0.current.wNow || 68, ac.signal)
      .then((r) => { const v = { status: 'done', ...r }; aiCache.current.set(key, v); return v })
      .catch((e) => (e && e.name === 'AbortError' ? { status: 'aborted' } : { status: 'error', error: e.message || String(e) }))
      .finally(() => aiInflight.current.delete(key))
    aiInflight.current.set(key, p)
    return p
  }, [])
  mineRef.current = mine
  useEffect(() => {
    const key = text.trim()
    if (!key) { setSettled(''); return }
    if (composing.current) return
    const t = setTimeout(() => setSettled(key), 800)
    return () => clearTimeout(t)
  }, [text, compTick])
  useEffect(() => {
    const key = settled
    setEdits({})
    if (key.length < 2) { setAi({ text: '', status: 'idle' }); return }
    if (aiCache.current.has(key)) { setAi({ text: key, ...aiCache.current.get(key) }); return }
    setAi({ text: key, status: 'loading' })
    runAI(key, true).then((v) => { if (v.status !== 'aborted') setAi((cur) => (cur.text === key ? { text: key, ...v } : cur)) })
  }, [settled, runAI])
  const typing = text.trim() !== settled

  const preview = useMemo(() => {
    const key = settled
    let base = ai.text === key && ai.status === 'done' ? fromAI(ai.result, key, now) : parse(key, now, mine)
    if (ai.text === key && ai.status === 'done' && !base.records.length) base = parse(key, now, mine)
    // 用户在预览里改过的热量
    base.records = base.records.map((r) => {
      if (r.type !== 'meal' || !r.items) return r
      const items = r.items.map((i) => (edits[i.name] != null ? { ...i, kcal: edits[i.name], source: 'mine' }
        : mine[i.name] != null && i.source !== 'mine' ? { ...i, kcal: Math.round(mine[i.name] * (i.qty || 1)), source: 'mine' } : i))
      return { ...r, items, kcal: items.reduce((a, i) => a + i.kcal, 0) }
    })
    return base
  }, [settled, now, ai, mine, edits])
  const aiFor = ai.text === settled ? ai.status : 'idle'
  const editKcal = (item, v) => {
    const kcal = Math.max(0, Math.round(+v || 0))
    setEdits((e) => ({ ...e, [item.name]: kcal }))
    setMine((m) => ({ ...m, [item.name]: Math.round(kcal / (item.qty || 1)) }))
  }
  const [busy, setBusy] = useState(false)
  const armedCards = useMemo(() => {
    return cardsFor(preview.records, now)
  }, [preview])

  // 线：从 a 元素到 b 卡
  const pathBetween = useCallback((fromEl, toEl) => {
    const root = rootRef.current; if (!root || !fromEl || !toEl) return null
    const R = root.getBoundingClientRect(), a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect()
    const ax = a.left + a.width / 2 - R.left, ay = a.bottom - R.top
    if (b.top >= a.bottom - 4) {
      const bx = b.left + b.width / 2 - R.left, by = b.top - R.top + 2
      const k = Math.max(60, (by - ay) * 0.5)
      return `M${ax} ${ay} C${ax} ${ay + k}, ${bx} ${by - k}, ${bx} ${by}`
    }
    const sx = a.right - R.left, sy = a.top + a.height / 2 - R.top, bx = b.left - R.left + 2, by = b.top + b.height / 2 - R.top
    const k = Math.max(40, (bx - sx) * 0.5)
    return `M${sx} ${sy} C${sx + k} ${sy}, ${bx - k} ${by}, ${bx} ${by}`
  }, [])
  const centerPath = useCallback((aEl, bEl) => {
    const root = rootRef.current; if (!root || !aEl || !bEl) return null
    const R = root.getBoundingClientRect(), a = aEl.getBoundingClientRect(), b = bEl.getBoundingClientRect()
    const ax = a.left + a.width / 2 - R.left, ay = a.top + a.height / 2 - R.top, bx = b.left + b.width / 2 - R.left, by = b.top + b.height / 2 - R.top
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.abs(bx - ax) * 0.18 - 30
    return `M${ax} ${ay} Q${mx} ${my} ${bx} ${by}`
  }, [])

  // 数值变化触发的动效
  const [pulse, setPulse] = useState({ pour: 0, shake: 0, coin: 0 })
  const prevS = useRef(null)
  useEffect(() => {
    const p = prevS.current; prevS.current = { kcalIn: 0, allowance: 0, todaySpent: 0 }
    if (S) prevS.current = { kcalIn: S.kcalIn, allowance: S.allowance, todaySpent: S.todaySpent }
    if (!p) return
    const next = {}
    if (S.kcalIn > p.kcalIn) next.pour = Date.now()
    if (S.allowance < 0 && S.allowance < p.allowance) next.shake = Date.now()
    if (S.todaySpent > p.todaySpent) next.coin = Date.now()
    if (Object.keys(next).length) setTimeout(() => setPulse((cur) => ({ ...cur, ...next })), 420)
  }, [S.kcalIn, S.allowance, S.todaySpent])

  // 卡片上冒出来的变化量（+620 千卡、−¥32 …）
  const [floats, setFloats] = useState([])
  const addFloats = useCallback((list, delay = 450) => {
    if (!list.length) return
    setTimeout(() => {
      const items = list.map((f, i) => ({ ...f, id: Date.now() + '-' + i + Math.random() }))
      setFloats((cur) => cur.concat(items))
      setTimeout(() => setFloats((cur) => cur.filter((x) => !items.includes(x))), 1700)
    }, delay)
  }, [])
  const floatsFor = (recs) => {
    const out = []
    recs.forEach((r) => {
      if (r.type === 'meal') out.push({ card: 'energy', text: '+' + num(r.kcal) + ' 千卡', color: '#C2410C' })
      if (r.type === 'expense') out.push({ card: 'money', text: '−' + money(r.amount), color: '#fff' })
      if (r.type === 'income') out.push({ card: 'money', text: '+' + money(r.amount), color: '#fff' })
      if (r.type === 'workout') { out.push({ card: 'move', text: '+' + r.minutes + ' 分钟', color: 'var(--move-ink)' }); out.push({ card: 'energy', text: '额度 +' + num(r.kcal), color: 'var(--move-ink)' }) }
      if (r.type === 'sleep') out.push({ card: 'sleep', text: fmtHM(r.hours), color: '#fff' })
      if (r.type === 'weight') out.push({ card: 'body', text: r.kg + ' kg', color: '#0E6E6E' })
    })
    return out
  }
  // 撒花：在某个位置炸开一小簇彩色纸屑
  const [bursts, setBursts] = useState([])
  const celebrate = useCallback((x, y, big) => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const colors = ['#F2994A', '#7C5CE0', '#1E9E6A', '#3D4FB8', '#0E8A8A', '#E5484D', '#F7C948']
    const n = big ? 46 : 18
    const parts = Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.6
      const d = (big ? 120 : 52) + Math.random() * (big ? 120 : 40)
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - (big ? 60 : 24), r: Math.random() * 540 - 270, c: colors[i % colors.length], w: 5 + Math.random() * 5, round: Math.random() > 0.6, delay: Math.random() * 0.08 }
    })
    const b = { id: Date.now() + Math.random(), x, y, parts, big }
    setBursts((cur) => cur.concat(b))
    setTimeout(() => setBursts((cur) => cur.filter((z) => z !== b)), big ? 1600 : 1100)
  }, [])

  const commit = useCallback((newRecords, cards, removeIds) => {
    setDb((d) => ({ ...d, records: d.records.filter((r) => !(removeIds || []).includes(r.id)).concat(newRecords) }))
    const src = inputRef.current
    const lines = [...cards].map((c) => ({ id: c, d: pathBetween(src, refs.current[c]), color: CARD_COLOR[c] === '#F4F5F1' ? C.food : CARD_COLOR[c] })).filter((l) => l.d)
    const stamp = Date.now()
    setThreads({ stamp, lines })
    setTimeout(() => setThreads((t) => (t && t.stamp === stamp ? null : t)), 1900)
    setTimeout(() => setFlash((f) => { const n = { ...f }; cards.forEach((c, i) => { n[c] = stamp + i }); return n }), 420)
    addFloats(floatsFor(newRecords))
  }, [pathBetween, addFloats])

  const say = (msg, ms = 2600) => { setToast(msg); setTimeout(() => setToast((t) => (t === msg ? null : t)), ms) }
  const submit = async (e) => {
    e && e.preventDefault()
    const key = text.trim()
    if (!key || busy) return
    let p = settled === key && aiFor !== 'loading' ? preview : parse(text, Date.now(), mine)
    // 这句话 AI 还没给结果：等它（最多 8 秒），等不到就用本地规则
    if (settled !== key || (aiFor !== 'done' && aiFor !== 'error')) {
      setBusy(true)
      const v = await Promise.race([runAI(key), new Promise((r) => setTimeout(() => r({ status: 'timeout' }), 8000))])
      setBusy(false)
      if (v.status === 'done') {
        p = fromAI(v.result, text, Date.now())
        if (!p.records.length) p = parse(text, Date.now(), mine)
      }
    }
    if (!p.records.length) { say('没听懂这句。换个说法试试，比如「早饭 两个麻团 一杯豆浆 8」', 3600); return }
    commit(p.records, cardsFor(p.records))
    say(summaryOf(p.records))
    setText('')
  }
  const removeGroup = (g) => {
    const ids = g.items.map((r) => r.id)
    commit([], cardsFor(g.items), ids)
  }
  const doneEvent = (ev) => {
    const w = completeEvent(ev, Date.now())
    setDb((d) => ({ ...d, records: d.records.map((r) => (r.id === ev.id ? { ...r, done: true } : r)) }))
    commit([w], new Set([...cardsFor([w]), 'next', 'week']))
  }
  const [allDoneAt, setAllDoneAt] = useState(null)
  const toggleTodo = (t, ev) => {
    if (t.done) setAllDoneAt(null)
    const flip = (d) => d.records.map((r) => (r.id === t.id ? { ...r, done: !r.done, doneAt: r.done ? undefined : Date.now() } : r))
    if (!t.done) {
      const box = ev && ev.currentTarget && ev.currentTarget.querySelector('.lf-check')
      const r = box ? box.getBoundingClientRect() : null
      const left = S.todos.filter((x) => !x.done && x.id !== t.id).length
      if (r) celebrate(r.left + r.width / 2, r.top + r.height / 2, false)
      if (left === 0) setAllDoneAt(Date.now())
      if (t.amount) addFloats([{ card: 'money', text: '−' + money(t.amount), color: '#fff' }])
    }
    if (!t.done && t.amount) {
      const ex = todoToExpense(t, Date.now())
      setDb((d) => ({ ...d, records: flip(d).concat([ex]) }))
      commit([], new Set(['todos', 'money', 'insights']))
    } else if (t.done && t.amount) {
      setDb((d) => ({ ...d, records: flip(d).filter((r) => r.from !== t.id) }))
      commit([], new Set(['todos', 'money', 'insights']))
    } else setDb((d) => ({ ...d, records: flip(d) }))
  }
  // 会抹掉数据的操作：先确认，做完还能撤销
  const [confirm, setConfirm] = useState(null)
  const [undo, setUndo] = useState(null)
  useEffect(() => { if (!confirm) return; const t = setTimeout(() => setConfirm(null), 6000); return () => clearTimeout(t) }, [confirm])
  useEffect(() => { if (!undo) return; const t = setTimeout(() => setUndo(null), 10000); return () => clearTimeout(t) }, [undo])
  const realCount = db.records.filter((r) => !r.sample).length
  const replaceAll = (next, label) => {
    setUndo({ prev: db, label })
    setDb(next); setConfirm(null)
  }
  const clearSample = () => replaceAll({ records: [], sample: false }, db.sample ? '已清空示例数据' : '已清空 ' + db.records.length + ' 条记录')
  const restoreSample = () => replaceAll({ records: seed(Date.now()), sample: true }, '已换成示例数据')
  // 清掉已完成：点了先不动手，按钮原地变成 5 秒倒计时，这期间点一下就反悔；数到 0 才一件件扫出去、收进归档
  const [sweeping, setSweeping] = useState(false)
  const [pend, setPend] = useState(null)         // { ids, end }
  const [, setTick] = useState(0)
  const PEND_S = 5
  useEffect(() => {
    if (!pend) return
    const iv = setInterval(() => setTick((x) => x + 1), 200)
    const t = setTimeout(() => {
      const ids = pend.ids
      setPend(null); setSweeping(true)
      setTimeout(() => {
        setDb((d) => ({ ...d, records: d.records.map((r) => (ids.includes(r.id) ? { ...r, archived: true } : r)) }))
        setSweeping(false)
      }, 420 + ids.length * 70)
    }, Math.max(0, pend.end - Date.now()))
    return () => { clearInterval(iv); clearTimeout(t) }
  }, [pend])
  const clearDone = () => {
    if (pend) { setPend(null); return }          // 倒计时中再点：反悔
    const ids = S.todos.filter((t) => t.done).map((t) => t.id)
    if (!ids.length || sweeping) return
    setAllDoneAt(null)
    setPend({ ids, end: Date.now() + PEND_S * 1000 })
  }
  // 单件：改字、删除（删除先化成碎屑飞走，原地留 4 秒撤销，再收起）
  const editTodo = (t, raw) => {
    const m = String(raw).trim().match(/^(.*?)\s*[¥￥]?\s*(\d+(?:\.\d+)?)\s*(?:元|块)?$/)
    const title = (m && m[1] ? m[1] : String(raw)).trim().slice(0, 40)
    const amount = m && m[1] ? +m[2] : null
    if (!title) return
    setDb((d) => ({ ...d, records: d.records.map((r) => r.id === t.id ? { ...r, title, amount, cat: amount ? (r.cat || null) : null }
      : r.from === t.id && r.type === 'expense' ? (amount ? { ...r, title, amount } : r) : r) }))
  }
  const [dying, setDying] = useState({})        // id → { end, phase }
  const dieTimers = useRef({})
  const deleteTodo = (t) => {
    const end = Date.now() + 650 + 4000
    setDying((d) => ({ ...d, [t.id]: { end, phase: 'dust' } }))
    const T = dieTimers.current
    T[t.id] = [
      setTimeout(() => setDying((d) => (d[t.id] ? { ...d, [t.id]: { ...d[t.id], phase: 'undo' } } : d)), 650),
      setTimeout(() => setDying((d) => (d[t.id] ? { ...d, [t.id]: { ...d[t.id], phase: 'gone' } } : d)), end - Date.now()),
      setTimeout(() => { setDb((d) => ({ ...d, records: d.records.filter((r) => r.id !== t.id) })); setDying((d) => { const n = { ...d }; delete n[t.id]; return n }); delete T[t.id] }, end - Date.now() + 360),
    ]
  }
  const restoreTodo = (t) => {
    ;(dieTimers.current[t.id] || []).forEach(clearTimeout); delete dieTimers.current[t.id]
    setDying((d) => ({ ...d, [t.id]: { phase: 'back' } }))
    setTimeout(() => setDying((d) => { const n = { ...d }; if (n[t.id] && n[t.id].phase === 'back') delete n[t.id]; return n }), 700)
  }
  // 从背面的归档里放回列表：按「今天刚做完」放回来，想重做就再取消勾选
  // 放回去 = 这件事还没做完：取消完成；当时勾掉记下的那笔账也一起撤掉
  // 背面可以连着放回好几件；翻回正面时，它们一件接一件飘落回列表
  const [printOpen, setPrintOpen] = useState(false)
  const [arrivals, setArrivals] = useState([])
  const unarchiveTodo = (t) => {
    setDb((d) => ({ ...d, records: d.records.filter((r) => !(r.from === t.id && r.type === 'expense')).map((r) => (r.id === t.id ? { ...r, archived: false, done: false, doneAt: undefined } : r)) }))
    if (t.amount && t.done) addFloats([{ card: 'money', text: '+' + money(t.amount), color: '#fff' }])
    setArrivals((a) => a.concat(t.id))
  }
  const landed = (id) => setArrivals((a) => a.filter((x) => x !== id))
  const pendLeft = pend ? Math.max(1, Math.ceil((pend.end - Date.now()) / 1000)) : 0
  const doUndo = () => { if (!undo) return; setDb(undo.prev); setUndo(null); say('已恢复') }

  // 预览线 & 洞察连线
  const [preLines, setPreLines] = useState([])
  useLayoutEffect(() => {
    if (!text || !armedCards.size) { setPreLines([]); return }
    setPreLines([...armedCards].map((c) => ({ id: c, d: pathBetween(inputRef.current, refs.current[c]), color: CARD_COLOR[c] === '#F4F5F1' ? C.food : CARD_COLOR[c] })).filter((l) => l.d))
  }, [text, armedCards, geo, pathBetween])

  // ===== 小组件布局 =====
  const [layout, setLayout] = useState(loadLayout)
  const [active, setActive] = useState(null), [resizing, setResizing] = useState(null)
  const gridRef = useRef(null), flipFrom = useRef(null), dragRef = useRef(null)
  useEffect(() => { try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)) } catch (e) {} }, [layout])
  const gridW = Math.max(0, (geo.w || 1200) - 48)
  const cols = gridW >= 980 ? 12 : gridW >= 620 ? 6 : 1
  const sizeOf = (id) => { const d = WIDGETS[id], v = layout.size[id] || {}; return { w: clamp(v.w || d.w, d.minW, 12), h: clamp(v.h || d.h, d.minH, 8) } }
  const place = (id) => {
    const { w, h } = sizeOf(id)
    const span = cols === 12 ? w : cols === 6 ? clamp(Math.ceil(w / 2), 3, 6) : 1
    return { w, h, span, order: layout.order.indexOf(id) }
  }
  // 布局变化前记下每张卡的位置，变化后从旧位置滑到新位置
  const snapshot = () => {
    const m = {}
    Object.keys(WIDGETS).forEach((id) => { const n = refs.current[id]; if (n) m[id] = n.getBoundingClientRect() })
    flipFrom.current = m
  }
  useLayoutEffect(() => {
    const from = flipFrom.current; flipFrom.current = null
    if (!from) return
    Object.keys(from).forEach((id) => {
      const n = refs.current[id]; if (!n || id === (dragRef.current && dragRef.current.id)) return
      const a = from[id], b = n.getBoundingClientRect()
      const dx = a.left - b.left, dy = a.top - b.top
      if (!dx && !dy && a.width === b.width && a.height === b.height) return
      n.style.transition = 'none'
      n.style.transform = `translate(${dx}px, ${dy}px)`
      void n.offsetWidth
      n.style.transition = 'transform .32s cubic-bezier(.2,.8,.2,1)'
      n.style.transform = ''
      setTimeout(() => { n.style.transition = '' }, 340)
    })
  }, [layout, cols])

  const startDrag = (id, e) => {
    if (e.button !== 0) return
    e.preventDefault()
    const n = refs.current[id]; if (!n) return
    const r = n.getBoundingClientRect()
    dragRef.current = { id, kind: 'move', gx: e.clientX - r.left, gy: e.clientY - r.top, last: null }
    setActive(id)
    n.style.transition = 'none'
    document.body.style.userSelect = 'none'
    const move = (ev) => {
      const d = dragRef.current; if (!d) return
      const el = refs.current[id]
      el.style.transform = ''
      const slot = el.getBoundingClientRect()
      el.style.transform = `translate(${ev.clientX - d.gx - slot.left}px, ${ev.clientY - d.gy - slot.top}px)`
      // 指针压在哪张卡上，就把自己挪到那张卡的位置
      let target = null
      for (const other of layout_order_ref.current) {
        if (other === id) continue
        const on = refs.current[other]; if (!on) continue
        const q = on.getBoundingClientRect()
        if (ev.clientX >= q.left && ev.clientX <= q.right && ev.clientY >= q.top && ev.clientY <= q.bottom) { target = other; break }
      }
      if (target && target !== d.last) {
        d.last = target
        snapshot()
        setLayout((L0) => {
          const o = L0.order.filter((x) => x !== id), at = o.indexOf(target)
          const ti = L0.order.indexOf(target), si = L0.order.indexOf(id)
          o.splice(si < ti ? at + 1 : at, 0, id)
          return { ...L0, order: o }
        })
      } else if (!target) d.last = null
    }
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up)
      document.body.style.userSelect = ''
      const el = refs.current[id]
      if (el) {
        const cur = el.getBoundingClientRect(); el.style.transform = ''; const slot = el.getBoundingClientRect()
        el.style.transform = `translate(${cur.left - slot.left}px, ${cur.top - slot.top}px)`
        void el.offsetWidth
        el.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s'
        el.style.transform = ''
        setTimeout(() => { el.style.transition = '' }, 320)
      }
      dragRef.current = null
      setActive(null)
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
  }
  const layout_order_ref = useRef(layout.order)
  layout_order_ref.current = layout.order

  const startResize = (id, e) => {
    if (e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const n = refs.current[id], g = gridRef.current; if (!n || !g) return
    const top = n.getBoundingClientRect(), gw = g.getBoundingClientRect().width
    const colW = (gw - GAP * (cols - 1)) / cols
    const d = WIDGETS[id]
    setResizing(id); setActive(id)
    document.body.style.userSelect = 'none'
    let lastKey = ''
    const move = (ev) => {
      const span = clamp(Math.round((ev.clientX - top.left + GAP) / (colW + GAP)), 1, cols)
      const w = clamp(cols === 12 ? span : cols === 6 ? span * 2 : sizeOf(id).w, d.minW, 12)
      const h = clamp(Math.round((ev.clientY - top.top + GAP) / (ROW_H + GAP)), d.minH, 8)
      const key = w + 'x' + h
      if (key === lastKey) return
      lastKey = key
      snapshot()
      setLayout((L0) => ({ ...L0, size: { ...L0.size, [id]: { w, h } } }))
    }
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up)
      document.body.style.userSelect = ''
      setResizing(null); setActive(null)
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
  }
  const keyMove = (id, e) => {
    const k = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key]; if (!k) return
    e.preventDefault(); snapshot()
    setLayout((L0) => { const o = L0.order.slice(), i = o.indexOf(id), j = clamp(i + k, 0, o.length - 1); o.splice(i, 1); o.splice(j, 0, id); return { ...L0, order: o } })
  }
  const keyResize = (id, e) => {
    const dw = { ArrowLeft: -1, ArrowRight: 1 }[e.key] || 0, dh = { ArrowUp: -1, ArrowDown: 1 }[e.key] || 0
    if (!dw && !dh) return
    e.preventDefault(); snapshot()
    const d = WIDGETS[id], cur = sizeOf(id)
    setLayout((L0) => ({ ...L0, size: { ...L0.size, [id]: { w: clamp(cur.w + dw, d.minW, 12), h: clamp(cur.h + dh, d.minH, 8) } } }))
  }
  const resetLayout = () => { snapshot(); setLayout(DEFAULT_LAYOUT) }
  const layoutApi = { place, active, resizing, startDrag, startResize, keyMove, keyResize }
  const customized = JSON.stringify(layout) !== JSON.stringify(DEFAULT_LAYOUT)

  // ===== 关系：从句子出发，先到「原因」那个数字，再流向「结果」那个数字 =====
  const [pinned, setPinned] = useState(null)
  const shownInsight = focusInsight || pinned
  const [link, setLink] = useState(null)
  useEffect(() => { const k = (e) => { if (e.key === 'Escape') setPinned(null) }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  // 钉住后点任何别的地方都取消（点提示条/关系条目本身由它们自己的 onClick 切换）
  useEffect(() => {
    if (!pinned) return
    const k = (e) => { if (!(e.target.closest && e.target.closest('.lf-tip, .lf-insight'))) setPinned(null) }
    document.addEventListener('pointerdown', k, true); return () => document.removeEventListener('pointerdown', k, true)
  }, [pinned])
  useLayoutEffect(() => {
    const root = rootRef.current, it = shownInsight
    document.querySelectorAll('.lf-ev-on').forEach((n) => { n.classList.remove('lf-ev-on'); n.style.removeProperty('--ev') })
    if (!it || !root) { setLink(null); return }
    const R = root.getBoundingClientRect()
    const box = (n) => { const r = n.getBoundingClientRect(); return { l: r.left - R.left, t: r.top - R.top, r: r.right - R.left, b: r.bottom - R.top, cx: (r.left + r.right) / 2 - R.left, cy: (r.top + r.bottom) / 2 - R.top } }
    const q = (k) => root.querySelector('[data-ev="' + k + '"]')
    const start = q('insight.' + it.id), cause = q(it.ev[0]), effect = q(it.ev[1])
    if (!start) { setLink(null); return }
    // 线落在矩形边上离对方最近的点，再往外让出一点
    const edge = (b, tx, ty, pad = 5) => {
      const dx = tx - b.cx, dy = ty - b.cy, hw = (b.r - b.l) / 2 + pad, hh = (b.b - b.t) / 2 + pad
      const k = Math.min(Math.abs(dx) > 0.01 ? hw / Math.abs(dx) : 1e9, Math.abs(dy) > 0.01 ? hh / Math.abs(dy) : 1e9)
      return [b.cx + dx * k, b.cy + dy * k]
    }
    const curve = (a, b) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1
      const bend = Math.min(90, d * 0.22), nx = (-dy / d) * bend, ny = (dx / d) * bend
      const flip = ny > 0 ? -1 : 1
      return `C${a[0] + dx * 0.3 + nx * flip} ${a[1] + dy * 0.3 + ny * flip}, ${a[0] + dx * 0.7 + nx * flip} ${a[1] + dy * 0.7 + ny * flip}, ${b[0]} ${b[1]}`
    }
    const sb = box(start), segs = []
    const fromC = C[it.from], toC = C[it.to] === '#1F2328' ? '#7C5CE0' : C[it.to]
    let tail = [sb.cx, sb.cy], tailBox = sb
    const hop = (n, color, isEnd) => {
      if (!n) return
      const b = box(n)
      const a = edge(tailBox, b.cx, b.cy, 3), z = edge(b, tailBox.cx, tailBox.cy, 7)
      segs.push({ a, z, d: `M${a[0]} ${a[1]} ` + curve(a, z), c1: segs.length ? fromC : '#B4B8B0', c2: color, end: isEnd })
      n.classList.add('lf-ev-on'); n.style.setProperty('--ev', color)
      tail = z; tailBox = b
    }
    hop(cause, fromC, !effect)
    if (effect && effect !== cause) hop(effect, toC, true)
    setLink(segs.length ? { id: it.id + ':' + Date.now(), segs, full: segs.map((g) => g.d).join(' ').replace(/ M/g, ' L'), color: toC } : null)
  }, [shownInsight, geo, layout])
  const hlCards = shownInsight ? new Set(['insights', ...shownInsight.ev.map((k) => { const n = rootRef.current && rootRef.current.querySelector('[data-ev="' + k + '"]'); const c = n && n.closest('[data-card]'); return c ? c.dataset.card : null }).filter(Boolean)]) : null
  // 天气 + 正在进行的日程 → 顶部大卡片的背景
  const weather = useWeather()
  const heroTone = S.nowEvent ? { key: eventTone(S.nowEvent), e: S.nowEvent } : null
  // 白天：整页是当天的天空，卡片投影跟着太阳；雨雪只在进来时下一阵
  const dskyRef = useRef(null), dfxRef = useRef(null), dayApi = useRef(null)
  useEffect(() => {
    if (!rootRef.current || !dskyRef.current || !dfxRef.current) return
    const api = rgDaySky(rootRef.current, dskyRef.current, dfxRef.current); dayApi.current = api
    return () => api.stop()
  }, [])
  useEffect(() => { dayApi.current && dayApi.current.update({ w: weather.w, dark: isDark }) }, [weather.w && weather.w.at, weather.w && weather.w.code, now, isDark])
  const todoEls = useRef({})
  const todoOrder = useDisplayOrder(S.todos.map((t) => t.id), 520)
  const shownTodos = todoOrder.map((id) => S.todos.find((t) => t.id === id)).filter(Boolean)
  useFlipList(todoEls, todoOrder)
  const allDone = S.todos.length > 0 && S.todos.every((x) => x.done)
  const finale = allDone && allDoneAt && Date.now() - allDoneAt < 6000
  const finaleAt = 0.7 + S.todos.length * 0.09 + 0.25
  const rain = useMemo(() => {
    const colors = ['#F2994A', '#7C5CE0', '#1E9E6A', '#3D4FB8', '#0E8A8A', '#E5484D', '#F7C948']
    return Array.from({ length: 40 }, (_, i) => ({ x: Math.random() * 100, c: colors[i % colors.length], w: 5 + Math.random() * 5, round: Math.random() > 0.6, sx: (Math.random() - 0.5) * 80, r: Math.random() * 720 - 360, dur: 1.6 + Math.random() * 1.2, d: Math.random() * 0.6 }))
  }, [allDoneAt])
  useEffect(() => { if (!allDoneAt) return; const t = setTimeout(() => setAllDoneAt((x) => (x ? x - 10000 : x)), 6100); return () => clearTimeout(t) }, [allDoneAt])

  const P = (id, idx, extra) => ({ id, idx, refs, floats: floats.filter((f) => f.card === id), flash: flash[id], armed: !!settled && !typing && armedCards.has(id), hl: hlCards && hlCards.has(id), dim: hlCards && !hlCards.has(id), ...extra })
  const h = new Date(S.now).getHours()
  // 称呼：点一下问候语就能改，存在本机
  const [userName, setUserName] = useState(() => { try { return localStorage.getItem('dsh-rigui:name') || '' } catch (e) { return '' } })
  const [editName, setEditName] = useState(false)
  const saveName = (v) => { const n = String(v || '').trim().slice(0, 16); setUserName(n); setEditName(false); try { localStorage.setItem('dsh-rigui:name', n) } catch (e) {} }
  const hello = h < 5 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好'
  const dateStr = (() => { const d = new Date(S.now); return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日，周' + '日一二三四五六'[d.getDay()] })()

  return (
    <div className="lf-root" data-theme={isDark ? 'dark' : 'light'} ref={rootRef}>
      <style>{CSS + GOALS_CSS + CARDS_CSS + FOG_CSS + RECEIPT_CSS + WEATHER_CSS}</style>
      <div className="lf-dsky" ref={dskyRef} aria-hidden="true" />
      <div className="lf-nsky" ref={skyRef} aria-hidden="true"><canvas /></div>
      <div className="lf-dfx" ref={dfxRef} aria-hidden="true" />
      <LayoutCtx.Provider value={layoutApi}>
      <div className="lf-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: GAP }}>

          {/* 头部：一句话 + 表盘 */}
          <Card {...P('hero', 0)} cls="s12" bg="#3B6FA8" color="#F4F5F1" style={{ padding: '32px 36px' }}>
            <HeroSky w={weather.w} now={now} tone={heroTone} />
            <WeatherBadge weather={weather} tone={heroTone} now={now} onFlip={(e) => { e.stopPropagation(); toggleWx(e.currentTarget.closest('[data-card=hero]')) }} />
            <div className="lf-theme" ref={themeRef} title={isDark ? '切回日间' : '切到夜间'} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              <RgSwitch on={isDark} onChange={setDark} />
              <span className="lf-theme-tip" aria-hidden="true">{isDark ? '夜间' : '日间'}</span>
            </div>
            <div className="lf-wxback" aria-hidden="true"><WeekWeather weather={weather} /></div>
            <div className="lf-hero lf-hero-sky lf-glassy">
              <div className="lf-hero-left" style={{ display: 'flex', flexDirection: 'column', gap: 44, alignSelf: 'stretch', justifyContent: 'center', padding: '4px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(34px, 4.4cqi, 52px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                    {hello}{editName ? (
                      <>，<input autoFocus className="lf-name-input" defaultValue={userName} maxLength={16} aria-label="怎么称呼你"
                        onBlur={(e) => saveName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditName(false) }} /></>
                    ) : (
                      <button type="button" className="lf-name" onClick={() => setEditName(true)} title={userName ? '改称呼' : '告诉我怎么称呼你'}>{userName ? '，' + userName : <span className="lf-name-add">，怎么称呼你？</span>}</button>
                    )}
                  </h1>
                </div>
                <div className="lf-sayrow">
                <form onSubmit={submit} className="lf-sayform" style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <label htmlFor="lf-say" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>说一句来记录</label>
                  <input id="lf-say" ref={inputRef} className="lf-input" value={text} autoComplete="off" spellCheck={false}
                    placeholder={sayHint} onChange={(e) => setText(e.target.value)} onFocus={() => setSayFocus(true)} onBlur={() => setSayFocus(false)}
                    onCompositionStart={() => { composing.current = true }}
                    onCompositionEnd={() => { composing.current = false; setCompTick((x) => x + 1) }}
                    onKeyDown={(e) => { if (e.key === 'Escape') setText('') }} />
                  <button type="submit" className="lf-send" disabled={!text.trim() || busy} aria-label="记下">{busy ? <span className="lf-spin" /> : Icon.send}</button>
                </form>
                <GoalsButton goals={goals} suggestions={suggestions} onClick={openGoals} />
                </div>
                <div className="lf-below" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 10, minHeight: 100, marginTop: -12 }}>
                  {text.trim() && !settled ? (
                    <span style={{ fontSize: 13, color: 'rgba(244,245,241,.45)', minHeight: 20 }}>说完停一下，我来理解这句话</span>
                  ) : text.trim() ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: typing ? 0.4 : 1, transition: 'opacity .25s' }}>
                      <div className="lf-row" style={{ gap: 10, fontSize: 13, color: 'rgba(244,245,241,.55)', minHeight: 20 }}>
                        {typing ? <span>输入中，停一下就重新识别</span> : <AiBadge status={aiFor} model={ai.model} error={ai.error} />}
                        {!typing && aiFor !== 'loading' && preview.records.length > 0 && <span>· 会影响 {armedCards.size} 张卡</span>}
                      </div>
                      {aiFor === 'loading' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <span className="lf-skel" style={{ width: '62%' }} /><span className="lf-skel" style={{ width: '40%' }} />
                        </div>
                      ) : preview.records.length > 0 ? (
                        <>
                          <div style={{ fontSize: 15, lineHeight: 1.7 }}>{highlight(settled, preview.tokens)}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {preview.records.map((r) => r.type === 'meal' && r.items ? (
                              <div key={r.id} className="lf-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                                <span className="lf-chip" style={{ background: 'rgba(242,153,74,.18)', color: '#F8C08B' }}><span className="lf-dot" style={{ background: C.food }} />{MEAL_NAME[r.meal]} · 共 {r.kcal} 千卡</span>
                                {r.items.map((it, k) => (
                                  <label key={k} className="lf-chip" style={{ background: 'rgba(255,255,255,.08)', gap: 6, paddingRight: 6 }} title="热量不对就改，下次会记住">
                                    <span>{it.name}{it.qty !== 1 ? ' ×' + it.qty : ''}</span>
                                    <input type="number" min="0" step="10" value={it.kcal} onChange={(ev) => editKcal(it, ev.target.value)} aria-label={it.name + ' 的热量'}
                                      style={{ width: 54, height: 22, border: 0, borderRadius: 6, background: it.source === 'mine' ? 'rgba(30,158,106,.35)' : 'rgba(255,255,255,.1)', color: '#F4F5F1', font: 'inherit', fontSize: 12.5, textAlign: 'right', padding: '0 6px' }} />
                                    <span style={{ opacity: 0.6 }}>千卡</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <div key={r.id} className="lf-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                                <span className="lf-chip" style={{ background: 'rgba(255,255,255,.1)' }}><span className="lf-dot" style={{ background: C[domainOf(r)] }} />{whenOf(r)}{labelOf(r)}</span>
                                {r.title && r.type !== 'workout' && r.type !== 'sleep' && r.type !== 'weight' && <span style={{ fontSize: 13, color: 'rgba(244,245,241,.6)' }}>{r.title}</span>}
                              </div>
                            ))}
                          </div>
                          {preview.note ? <span style={{ fontSize: 12.5, color: 'rgba(244,245,241,.5)' }}>{preview.note}</span> : null}
                        </>
                      ) : (
                        <span style={{ fontSize: 14, color: 'rgba(244,245,241,.55)' }}>还没听懂这句，换个说法试试</span>
                      )}
                    </div>
                  ) : (
                    <div className={'lf-idle-stack' + (sayFocus ? ' focus' : '')}>
                      {/* 平时：愿景或今日小结 + 关系提示；点进输入框就退场，让位给建议 */}
                      <div className="lf-idle">
                        {goals.adopted.vision && goals.texts.vision
                          ? <span key={goals.texts.vision} className="lf-vision"><i />{goals.texts.vision}</span>
                          : <p className="lf-story">{storyOf(S)}</p>}
                        <TodayNudges part="tip" S={S} ghosts={ghosts} usual={usual} focused={sayFocus} onPick={() => {}} onInsight={(it) => setPinned((p0) => (p0 && p0.id === it.id ? null : it))} pinned={pinned} />
                      </div>
                      <TodayNudges part="sugs" S={S} ghosts={ghosts} usual={usual} focused={sayFocus} onPick={(u) => { setText(u); inputRef.current && inputRef.current.focus() }} onInsight={(it) => setPinned((p0) => (p0 && p0.id === it.id ? null : it))} pinned={pinned} />
                    </div>
                  )}
                </div>
              </div>
              <div ref={(el) => { refs.current.dial = el }} data-ev="dial" style={{ display: 'grid' }}>
                <Dial S={S} hover={hover} setHover={setHover} />
              </div>
            </div>
          </Card>
        </div>
        <div className="lf-widgets" ref={gridRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: ROW_H + 'px', gridAutoFlow: 'dense', gap: GAP }}>

          {/* 能量 */}
          <Card {...P('energy', 1)} cls="s4" back={<BackEnergy S={S} />}>
            <div className="lf-row" style={{ justifyContent: 'space-between' }}>
              <h2 className="lf-h">今天还能吃</h2>
              <span className="lf-sub">目标 {num(GOALS.kcal)} 千卡</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '14px 0 16px' }}>
              <span key={pulse.shake} data-ev="energy.num" className={pulse.shake ? 'lf-shake' : ''} style={{ display: 'inline-block' }}><Num value={Math.abs(S.allowance)} style={{ fontSize: 52, fontWeight: 500, lineHeight: 1, color: S.allowance < 0 ? C.link : C.ink }} className="lf-num" /></span>
              <span className="lf-sub">{S.allowance < 0 ? '千卡，已超出' : '千卡'}</span>
            </div>
            <EnergyTaste S={S} pour={pulse.pour} />
          </Card>

          {/* 钱 */}
          <Card {...P('money', 2)} cls="s4" bg={C.money} color="#fff" back={<BackMoney S={S} />}>
            <div className="lf-row" style={{ justifyContent: 'space-between' }}>
              <h2 className="lf-h">{S.remaining < 0 ? '这个月已超支' : '这个月还能花'}</h2>
              <span className="lf-row" style={{ gap: 8 }}>
                <span style={{ fontSize: 13, opacity: 0.8 }}>还剩 {S.daysLeft} 天</span>
                <button type="button" className={'lf-printbtn' + (printOpen ? ' on' : '')} onClick={() => setPrintOpen((v) => !v)} aria-label={printOpen ? '收起小票' : '打印今天的花销小票'} title="打印小票">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /><path d="M17.5 12h.01" /></svg>
                </button>
              </span>
            </div>
            <div style={{ margin: '14px 0 16px' }}><span data-ev="money.num" style={{ display: 'inline-block' }}><Num value={Math.abs(S.remaining)} format={money} style={{ fontSize: 52, fontWeight: 500, lineHeight: 1 }} /></span></div>
            <MoneyStrip S={S} coin={pulse.coin} />
          </Card>

          {/* 下一件 */}
          <NextCard P={P} S={S} onDone={doneEvent} />

          {/* 时间线 */}
          <Card {...P('timeline', 4)} cls="s5 r2" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="lf-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 className="lf-h">今天记下的</h2>
              <span className="lf-sub">{S.timeline.length ? S.timeline.length + ' 件' : '还空着'}{ghosts.filter((g) => S.today + g.h * 3600000 <= S.now).length ? ' · ' + ghosts.filter((g) => S.today + g.h * 3600000 <= S.now).length + ' 件没记' : ''}</span>
            </div>
            <TodayList S={S} ghosts={ghosts} onFill={fillFrom} onRemove={removeGroup} />
          </Card>

          {/* 睡眠 */}
          <Card {...P('sleep', 5)} cls="s4" bg={C.sleep} color="#fff" back={<BackSleep S={S} />}>
            <SleepSky />
            <SleepBody S={S} />
          </Card>

          {/* 运动 */}
          <Card {...P('move', 6)} cls="s3" back={<BackMove S={S} workouts={db.records.filter((r) => r.type === 'workout' && r.t >= S.today - 6 * 86400000).sort((a, b) => b.t - a.t)} />}>
            <h2 className="lf-h">这周练了</h2>
            <div data-ev="move.count" style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '12px 0 10px', alignSelf: 'flex-start' }}>
              <Num value={S.weekWorkouts} style={{ fontSize: 44, fontWeight: 500, lineHeight: 1 }} />
              <span className="lf-sub">/ {GOALS.workoutsPerWeek} 次 · <Num value={S.weekMinutes} /> 分钟</span>
            </div>
            <MoveBars S={S} />
          </Card>

          {/* 关联 */}
          <Card {...P('insights', 7)} cls="s4">
            <div className="lf-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <h2 className="lf-h">它们之间的关系</h2>
              <span className="lf-sub">{pinned ? '已钉住 · 点别处或按 Esc 取消' : '悬停看因果，点一下钉住'}</span>
            </div>
            {S.insights.length === 0 ? <p className="lf-sub" style={{ margin: '12px 0' }}>多记几天，这里会找出睡眠、吃饭、花钱之间的规律。</p> : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {S.insights.slice(0, 4).map((it, i) => (
                  <div key={it.id} tabIndex={0} role="button" aria-pressed={!!pinned && pinned.id === it.id}
                    onMouseMove={() => setFocusInsight((f) => (f && f.id === it.id ? f : it))} onMouseLeave={() => setFocusInsight(null)} onFocus={() => setFocusInsight(it)} onBlur={() => setFocusInsight(null)}
                    onClick={() => setPinned((p0) => (p0 && p0.id === it.id ? null : it))} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPinned((p0) => (p0 && p0.id === it.id ? null : it)) } }}
                    className={'lf-tl-item lf-insight' + (shownInsight && shownInsight.id === it.id ? ' on' : '') + (pinned && pinned.id === it.id ? ' pinned' : '')} style={{ display: 'flex', gap: 12, padding: '11px 8px', margin: '0 -8px', borderTop: i ? '1px solid var(--rule)' : 0, cursor: 'pointer', animationDelay: i * 0.06 + 's' }}>
                    <span data-ev={'insight.' + it.id} style={{ display: 'flex', alignItems: 'center', paddingTop: 4, flex: 'none', alignSelf: 'flex-start' }}>
                      <span className="lf-dot" style={{ background: it.from === 'time' ? 'var(--ink)' : C[it.from], width: 10, height: 10, borderRadius: 5 }} />
                      <span style={{ width: 12, height: 2, background: 'var(--line)' }} />
                      <span className="lf-dot" style={{ background: it.to === 'time' ? 'var(--ink)' : C[it.to], width: 10, height: 10, borderRadius: 5 }} />
                    </span>
                    <span style={{ fontSize: 14, lineHeight: 1.55, color: it.tone === 'warn' ? 'var(--warn-ink)' : C.ink }}>{it.text}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 身体 */}
          <Card {...P('body', 8)} cls="s3" back={<><BackBody S={S} monthWeight={goals.adopted.monthWeight ? goals.monthWeight : null} />{S.wNow != null && <WeightFog />}</>}>
            {S.wNow != null && <WeightFog />}
            <h2 className="lf-h">体重</h2>
            <div data-ev="body.num" style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '12px 0 8px', alignSelf: 'flex-start' }}>
              {S.wNow != null ? <Num value={S.wNow} format={(v) => v.toFixed(1)} style={{ fontSize: 44, fontWeight: 500, lineHeight: 1 }} /> : <span style={{ fontSize: 28, fontWeight: 500 }}>—</span>}
              <span className="lf-sub">kg</span>
            </div>
            <div data-ev="body.line" style={{ flex: 1, minHeight: 56, margin: '4px 0 8px' }}><WeightScrub weights={S.weights} now={S.now}><WeightLine weights={S.weights} now={S.now} /></WeightScrub></div>
            <span style={{ fontSize: 13, color: S.wDelta != null && S.wDelta <= 0 ? 'var(--move-ink)' : 'var(--ink2)' }}>
              {goals.adopted.monthWeight && S.wNow != null ? 'Boss 战：30 天到 ' + goals.monthWeight + ' kg，' + (S.wNow <= goals.monthWeight ? '已经打赢了' : '还差 ' + (S.wNow - goals.monthWeight).toFixed(1) + ' kg') : S.wDelta == null ? (S.wNow != null ? '记满一周就能看到变化' : '说「体重 68.2」开始记录') : '一周 ' + (S.wDelta <= 0 ? '−' : '+') + Math.abs(S.wDelta).toFixed(1) + ' kg'}
            </span>
          </Card>

          {/* 这周 */}
          <Card {...P('week', 9)} cls="s8">
            <WeekBoard S={S} />
          </Card>

          {/* 待办 */}
          <Card {...P('todos', 10)} cls="s4" back={<BackTodos records={db.records} today={S.today} onRestore={unarchiveTodo} />}>
            <div className="lf-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <h2 className="lf-h">要做的事</h2>
              {S.todos.some((x) => x.done) || pend ? (
                <span className="lf-row" style={{ gap: 10 }}>
                  {!pend && <span className="lf-sub">{S.todos.filter((x) => x.done).length} / {S.todos.length} 完成</span>}
                  <button type="button" className={'lf-sweep-btn' + (pend ? ' pending' : '')} onClick={clearDone} disabled={sweeping}
                    aria-label={pend ? '撤销清理，还剩 ' + pendLeft + ' 秒' : '清掉已完成的事'} style={pend ? { '--dur': PEND_S + 's' } : null}>
                    {pend ? (
                      <>
                        <span key={'p' + pend.end} className="lf-sweep-glow" />
                        <span className="lf-sweep-num"><span key={pendLeft} className="lf-roll">{pendLeft}</span></span>
                        <span className="lf-sweep-label">清理中</span>
                        <span className="lf-sweep-undo">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4l6 6" /><path d="M17 7l-7.5 7.5" /><path d="M9.5 14.5L4 20h6l3.5-3.5" /></svg>
                        <span className="lf-sweep-label">清掉已完成</span>
                      </>
                    )}
                  </button>
                </span>
              ) : <span className="lf-sub">带金额的，勾掉就记账</span>}
            </div>
            {S.todos.length === 0 ? <p className="lf-sub">说「记得 交水电费 180」就会出现在这里。</p> : <div className="lf-todo-list lf-inner-scroll">{shownTodos.map((t, i) => (
              <TodoRow key={t.id} rowRef={(n) => { todoEls.current[t.id] = n }} t={t} i={i} arrived={arrivals.indexOf(t.id)} onLanded={landed} onToggle={toggleTodo} onEdit={editTodo} onDelete={deleteTodo} onRestore={restoreTodo} dying={dying[t.id]}
                cls={(finale ? ' lf-cascade' : '') + (sweeping && t.done ? ' lf-swept' : '') + (pend && pend.ids.includes(t.id) ? ' lf-pend' : '')}
                delay={finale ? (0.7 + i * 0.09) + 's' : sweeping && t.done ? S.todos.filter((x) => x.done).indexOf(t) * 0.07 + 's' : undefined}
                evAmount={!t.done && t.id === (S.todos.find((x) => !x.done && x.amount) || {}).id} />
            ))}</div>}
            {allDone && !sweeping && (
              <div key={allDoneAt || 'static'} className={'lf-alldone' + (finale ? ' play' : '')} style={{ '--delay': finaleAt + 's' }}>
                <svg className="lf-ad-badge" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="30" style={{ fill: 'color-mix(in srgb,#1E9E6A 14%,var(--card))' }} />
                  <circle cx="32" cy="32" r="22" fill="#1E9E6A" />
                  <path className="lf-ad-check" d="M22 32.5l7 7L42.5 25" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
                </svg>
                <div className="lf-ad-text">
                  <div style={{ fontSize: 17, fontWeight: 600 }}>全部完成</div>
                  <div className="lf-sub">今天 {S.todos.length} 件事都做完了</div>
                </div>
              </div>
            )}
            {finale && (
              <div className="lf-rain" aria-hidden="true">
                {rain.map((q, k) => <i key={k} style={{ left: q.x + '%', background: q.c, width: q.w, height: q.round ? q.w : q.w * 0.42, borderRadius: q.round ? '50%' : 2, '--sx': q.sx + 'px', '--r': q.r + 'deg', '--dur': q.dur + 's', '--d': (finaleAt + q.d) + 's' }} />)}
              </div>
            )}

          </Card>
        </div>

        <footer className="lf-row" style={{ justifyContent: 'space-between', marginTop: 18, padding: '0 6px', fontSize: 13, color: 'var(--ink2)', flexWrap: 'wrap' }}>
          <span>数据存在这台电脑上 · ⌘K 随时记一句 · 按住卡片顶部的小横条换位置，拖右下角放大缩小</span>
          <span className="lf-row" style={{ gap: 6 }}>
            {customized && <button className="lf-btn" onClick={resetLayout}>恢复默认布局</button>}
            {confirm === 'clear' ? (
              <span className="lf-row lf-confirm" role="alert" style={{ gap: 8 }}>
                <span style={{ color: 'var(--warn-ink)' }}>{db.sample ? '清空示例数据' : '删除全部 ' + db.records.length + ' 条记录'}{realCount > 0 && db.sample ? '（含你自己记的 ' + realCount + ' 条）' : ''}，确定吗？</span>
                <button className="lf-btn" onClick={() => setConfirm(null)}>取消</button>
                <button className="lf-btn" autoFocus onClick={clearSample} style={{ background: '#E5484D', color: '#fff' }}>确定清空</button>
              </span>
            ) : confirm === 'sample' ? (
              <span className="lf-row lf-confirm" role="alert" style={{ gap: 8 }}>
                <span style={{ color: 'var(--warn-ink)' }}>示例数据会替换掉你现在的 {db.records.length} 条记录，确定吗？</span>
                <button className="lf-btn" onClick={() => setConfirm(null)}>取消</button>
                <button className="lf-btn" autoFocus onClick={restoreSample} style={{ background: '#E5484D', color: '#fff' }}>确定替换</button>
              </span>
            ) : db.sample ? (
              <><span>现在是示例数据</span><button className="lf-btn" onClick={() => setConfirm('clear')}>清空，开始用</button></>
            ) : (
              <>
                {db.records.length > 0 && <button className="lf-btn" onClick={() => setConfirm('clear')}>清空全部记录</button>}
                <button className="lf-btn" onClick={() => (db.records.length ? setConfirm('sample') : restoreSample())}>看示例数据</button>
              </>
            )}
          </span>
        </footer>
      </div>
      </LayoutCtx.Provider>

      {/* 连线层 */}
      <svg aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: geo.w || '100%', height: geo.h || '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
        {threads && threads.lines.map((l, i) => (
          <g key={threads.stamp + l.id}>
            <path d={l.d} className="lf-thread" stroke={l.color} pathLength="1" style={{ animationDelay: i * 0.05 + 's, ' + (1.2 + i * 0.05) + 's' }} />
            <circle r="5" fill={l.color} opacity="0">
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="0.9s" begin={i * 0.05 + 's'} fill="freeze" />
              <animateMotion path={l.d} dur="0.75s" begin={i * 0.05 + 's'} fill="freeze" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
            </circle>
          </g>
        ))}
        {link && (
          <g key={link.id}>
            <defs>
              {link.segs.map((g, i) => (
                <linearGradient key={i} id={'lfg-' + i} gradientUnits="userSpaceOnUse" x1={g.a[0]} y1={g.a[1]} x2={g.z[0]} y2={g.z[1]}>
                  <stop offset="0" stopColor={g.c1} /><stop offset="1" stopColor={g.c2} />
                </linearGradient>
              ))}
              <marker id="lf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0L10 5L0 10z" fill={link.color} />
              </marker>
              <filter id="lf-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>
            {link.segs.map((g, i) => (
              <path key={i} d={g.d} className="lf-cause" stroke={'url(#lfg-' + i + ')'} pathLength="1" markerEnd={g.end ? 'url(#lf-arrow)' : undefined}
                style={{ animationDelay: i * 0.35 + 's' }} />
            ))}
            {link.segs.map((g, i) => (
              <circle key={'r' + i} cx={g.z[0]} cy={g.z[1]} r="6" fill="none" stroke={g.c2} strokeWidth="2" className="lf-arrive" style={{ animationDelay: 0.35 + i * 0.35 + 's' }} />
            ))}
            <circle r="9" fill={link.color} opacity=".35" filter="url(#lf-glow)">
              <animateMotion dur="1.8s" begin="0.7s" repeatCount="indefinite" path={link.full} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.25 1" />
            </circle>
            <circle r="4" fill="#fff" stroke={link.color} strokeWidth="2">
              <animateMotion dur="1.8s" begin="0.7s" repeatCount="indefinite" path={link.full} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.25 1" />
            </circle>
          </g>
        )}
      </svg>

      <ReceiptPrinter open={printOpen} onClose={() => setPrintOpen(false)} records={db.records} S={S} cardEl={refs.current.money} rootEl={rootRef.current} />
      <GoalsPanel open={goalsOpen} onClose={() => setGoalsOpen(false)} rootRect={rootRect} suggestions={suggestions} goals={goals} onAdopt={adoptGoal} onUndo={undoGoal} celebrate={celebrate} />
      {bursts.map((b) => (
        <div key={b.id} aria-hidden="true" style={{ position: 'fixed', left: b.x, top: b.y, width: 0, height: 0, zIndex: 40, pointerEvents: 'none' }}>
          {b.big && <span className="lf-ring" />}
          {b.parts.map((q, i) => (
            <i key={i} className="lf-confetti" style={{ '--dx': q.dx + 'px', '--dy': q.dy + 'px', '--r': q.r + 'deg', background: q.c, width: q.w, height: q.round ? q.w : q.w * 0.45, borderRadius: q.round ? '50%' : 2, animationDelay: q.delay + 's', animationDuration: (b.big ? 1.3 : 0.9) + 's' }} />
          ))}
        </div>
      ))}
      {undo && (
        <div role="status" className="lf-row" style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 21, gap: 14, background: '#1F2328', color: '#F4F5F1', borderRadius: 24, padding: '8px 8px 8px 20px', fontSize: 14, boxShadow: '0 12px 32px rgba(31,35,40,.25)', animation: 'lf-rise .35s cubic-bezier(.2,.8,.2,1)' }}>
          <span>{undo.label}</span>
          <button onClick={doUndo} style={{ height: 34, padding: '0 16px', borderRadius: 17, border: 0, background: '#F2994A', color: '#1F2328', fontWeight: 600, fontSize: 14 }}>撤销</button>
        </div>
      )}
      {toast && !undo && (
        <div role="status" style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 20, background: '#1F2328', color: '#F4F5F1', borderRadius: 22, padding: '12px 20px', fontSize: 14, boxShadow: '0 12px 32px rgba(31,35,40,.25)', animation: 'lf-rise .35s cubic-bezier(.2,.8,.2,1)' }}>{toast}</div>
      )}
    </div>
  )
}

// ---------- 今天：真实记录 + 还没填的空位 + 现在 ----------
function TodayList({ S, ghosts, onFill, onRemove }) {
  const entries = [
    ...S.timeline.map((g) => ({ kind: 'real', t: Math.min(g.t, S.now), key: g.key, g })),
    ...ghosts.map((s) => ({ kind: 'ghost', t: S.today + s.h * 3600000, key: 'ghost-' + s.key, s })),
  ].sort((a, b) => b.t - a.t)
  const cut = entries.findIndex((e) => e.t <= S.now)
  entries.splice(cut < 0 ? entries.length : cut, 0, { kind: 'now', key: 'now', t: S.now })
  const hm = (h) => { const m = Math.round(h * 60); return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {S.timeline.length === 0 && (
        <p className="lf-enter" style={{ margin: '2px 0 10px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink2)' }}>
          今天还没记。按你平时的习惯，先把今天的空位摆出来了，点一个就能补上。
        </p>
      )}
      {entries.map((e, i) => {
        const prev = entries[i - 1]
        if (e.kind === 'now') return (
          <div key="now" className="lf-now" aria-label={'现在 ' + fmtTime(S.now)}>
            <span className="lf-now-dot" /><span className="lf-num">现在 {fmtTime(S.now)}</span><span className="lf-now-line" />
          </div>
        )
        if (e.kind === 'ghost') {
          const s = e.s, future = e.t > S.now
          return (
            <button key={e.key} type="button" data-ev={'slot.' + s.key} className={'lf-ghost lf-enter ' + (future ? 'future' : 'due')} style={{ '--g': C[s.domain], animationDelay: 0.25 + i * 0.06 + 's' }}
              onClick={() => onFill(s.phrase)} aria-label={(future ? '待会儿：' : '还没记：') + s.title + '，' + s.hint + '，点一下填进输入框'}>
              <span className="lf-num lf-ghost-time">{hm(s.h)}</span>
              <span className="lf-ghost-box">
                <span className="lf-ghost-title">{s.title}</span>
                <span className="lf-ghost-hint">{s.hint}</span>
                <span className="lf-ghost-cta">{future ? '待会儿' : '还没记'}<span className="lf-ghost-plus" aria-hidden="true">+</span></span>
              </span>
            </button>
          )
        }
        const g = e.g
        return (
          <div key={e.key} className="lf-tl-item" style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: prev && prev.kind === 'real' ? '1px solid var(--rule)' : 0, alignItems: 'flex-start' }}>
            <span className="lf-num" style={{ width: 44, fontSize: 13, color: 'var(--ink2)', paddingTop: 3, flex: 'none' }}>{fmtTime(g.t)}</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{g.wake ? '醒来' : g.items[0].type === 'weight' ? <Private>{g.items[0].title || labelOf(g.items[0])}</Private> : g.items[0].title || labelOf(g.items[0])}</span>
              <div className="lf-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                {g.items.map((r, j) => (
                  <React.Fragment key={r.id}>
                    {j > 0 && <span style={{ color: '#B4B8B0', display: 'inline-flex' }}>{Icon.arrow}</span>}
                    <span className="lf-chip" style={{ background: DOMAIN[domainOf(r)].soft, color: 'var(--ink)', height: 24 }}><span className="lf-dot" style={{ background: C[domainOf(r)] }} />{r.type === 'weight' ? <Private>{labelOf(r)}</Private> : labelOf(r)}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            {!g.wake && <button className="lf-icon" aria-label={'删除 ' + (g.items[0].title || '')} onClick={() => onRemove(g)}>{Icon.x}</button>}
          </div>
        )
      })}
    </div>
  )
}

// ---------- 子卡 ----------
function NextCard({ P, S, onDone }) {
  const n = S.next
  if (!n) return (
    <Card {...P('next', 3)} cls="s4" bg="var(--sheet)">
      <h2 className="lf-h">接下来</h2>
      <p style={{ fontSize: 22, fontWeight: 600, margin: '18px 0 6px' }}>后面没有安排了</p>
      <span className="lf-sub">说「明天 19:30 跑步」加一项。</span>
    </Card>
  )
  const isMove = n.domain === 'move', toneBg = TONES[eventTone(n)]
  const mins = Math.round((n.t - S.now) / 60000)
  const when = mins <= 0 ? '进行中' : mins < 60 ? mins + ' 分钟后' : mins < 24 * 60 ? Math.floor(mins / 60) + ' 小时 ' + (mins % 60) + ' 分后' : '明天 ' + fmtTime(n.t)
  return (
    <Card {...P('next', 3)} cls="s4" bg={toneBg} color="#fff" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
      <div className="lf-row" style={{ justifyContent: 'space-between' }}>
        <h2 className="lf-h" style={{ fontWeight: 500, opacity: 0.85, fontSize: 14 }}>接下来</h2>
        <span className="lf-chip" style={{ background: 'rgba(255,255,255,.18)' }}>{when}</span>
      </div>
      <div>
        <div data-ev="next.title" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, display: 'inline-block' }}>{n.title}</div>
        <div className="lf-num" style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>{fmtTime(n.t)} – {fmtTime(n.end || n.t + 3600000)}</div>
      </div>
      {S.nextAdvice && <div style={{ fontSize: 13.5, lineHeight: 1.5, background: 'rgba(255,255,255,.14)', borderRadius: 14, padding: '9px 12px' }}>{S.nextAdvice}</div>}
      {isMove && <button onClick={() => onDone(n)} style={{ alignSelf: 'flex-start', height: 40, padding: '0 18px', borderRadius: 20, border: 0, background: 'var(--card)', color: C.move, fontWeight: 600, fontSize: 14 }}>练完了，记下</button>}
    </Card>
  )
}

function EnergyBar({ S, pour }) {
  const cap = Math.max(GOALS.kcal + S.burned, S.kcalIn) * 1.05
  const pct = (v) => (v / cap) * 100 + '%'
  let acc = 0
  return (
    <div style={{ position: 'relative', height: 26 }}>
      <div style={{ position: 'absolute', inset: '7px 0', borderRadius: 6, background: 'var(--fill)' }} />
      <div style={{ position: 'absolute', top: 7, height: 12, left: 0, width: pct(GOALS.kcal), borderRadius: 6, background: 'var(--fill2)', transition: 'width .8s' }} />
      {S.burned > 0 && <div style={{ position: 'absolute', top: 7, height: 12, left: pct(GOALS.kcal), width: pct(S.burned), borderRadius: '0 6px 6px 0', background: 'repeating-linear-gradient(135deg, #BFE6D3 0 4px, #DDF2E8 4px 8px)', transition: 'all .8s cubic-bezier(.2,.8,.2,1)' }} />}
      {S.meals.map((m, i) => { const l = acc; acc += m.kcal; return <div key={m.id} title={m.title + ' ' + m.kcal} style={{ position: 'absolute', top: 7, height: 12, left: pct(l), width: `calc(${pct(m.kcal)} - 2px)`, borderRadius: 4, background: i % 2 ? '#F8C08B' : C.food, transition: 'all .8s cubic-bezier(.2,.8,.2,1)' }} /> })}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(GOALS.kcal + S.burned), width: 2, borderRadius: 1, background: C.ink, transition: 'left .8s cubic-bezier(.2,.8,.2,1)' }} />
      {pour ? <div key={pour} className="lf-pour" style={{ position: 'absolute', top: 7, height: 12, left: 0, width: pct(Math.min(S.kcalIn, cap)), borderRadius: 6, overflow: 'hidden', pointerEvents: 'none' }}><span /></div> : null}
    </div>
  )
}

// 粒子：每个字一组随机的飞行方向（按 id 固定，撤销后重来也一样）
function dustOf(id, n) {
  let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const r = () => ((h = (h * 1103515245 + 12345) >>> 0) / 4294967296)
  return Array.from({ length: n }, () => ({ x: 30 + r() * 70, y: -26 + r() * 40, rot: -60 + r() * 120, s: 0.3 + r() * 0.5 }))
}
// 列表换位：先让勾选的动效演完，再换顺序；换顺序时用 FLIP 让每一行从旧位置滑到新位置
function useDisplayOrder(ids, delay) {
  const [disp, setDisp] = useState(ids)
  const key = ids.join(','), dk = disp.join(',')
  useEffect(() => {
    if (key === dk) return
    const same = ids.length === disp.length && ids.every((x) => disp.includes(x))
    if (!same) { setDisp(ids); return }
    const t = setTimeout(() => setDisp(ids), delay)
    return () => clearTimeout(t)
  }, [key, dk])
  return disp
}
function useFlipList(els, order) {
  const prev = useRef({})
  useLayoutEffect(() => {
    const now = {}
    order.forEach((id) => { const n = els.current[id]; if (n) now[id] = n.offsetTop })   // offsetTop 不受卡片倾斜影响
    const old = prev.current
    const moved = order.filter((id) => old[id] != null && now[id] != null && Math.abs(old[id] - now[id]) > 2)
    if (moved.length && !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      // 移动最远的那一行是「主角」：往下沉的走一道向右的弧线、落地压扁一下；往上浮的像气泡一样晃上去
      const hero = moved.reduce((a, b) => (Math.abs(old[b] - now[b]) > Math.abs(old[a] - now[a]) ? b : a))
      let k = 0
      moved.forEach((id) => {
        const n = els.current[id], dy = old[id] - now[id]
        if (id === hero) {
          const down = dy < 0
          n.style.zIndex = 2
          const a = n.animate(down ? [
            { transform: `translateY(${dy}px)`, boxShadow: '0 0 0 rgba(0,0,0,0)', background: 'rgba(255,255,255,0)' },
            { transform: `translate(14px, ${dy * 0.55}px) rotate(1.8deg) scale(1.03)`, boxShadow: '0 14px 28px -12px rgba(31,35,40,.3)', background: 'var(--card)', offset: 0.42 },
            { transform: 'translate(2px, 4px) scale(1.015, .94)', boxShadow: '0 4px 10px -6px rgba(31,35,40,.2)', background: 'var(--card)', offset: 0.78 },
            { transform: 'translateY(-2px) scale(.995, 1.02)', offset: 0.9 },
            { transform: 'none', boxShadow: '0 0 0 rgba(0,0,0,0)', background: 'rgba(255,255,255,0)' },
          ] : [
            { transform: `translateY(${dy}px)`, background: 'rgba(255,255,255,0)' },
            { transform: `translate(-10px, ${dy * 0.5}px) rotate(-1.5deg) scale(1.03)`, background: 'var(--card)', boxShadow: '0 12px 24px -12px rgba(30,158,106,.35)', offset: 0.45 },
            { transform: 'translateY(-5px) scale(1.01)', offset: 0.75 },
            { transform: 'none', background: 'rgba(255,255,255,0)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
          ], { duration: 640, easing: 'cubic-bezier(.3,.7,.35,1)' })
          a.onfinish = a.oncancel = () => { n.style.zIndex = '' }
        } else {
          n.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 460, delay: 40 + k++ * 35, easing: 'cubic-bezier(.25,1.25,.4,1)', fill: 'backwards' })
        }
      })
    }
    prev.current = now
  })
}

function TodoRow({ arrived = -1, onLanded, rowRef, t, i, onToggle, onEdit, onDelete, onRestore, dying, cls, delay, evAmount }) {
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(0)
  const inp = useRef(null)
  useEffect(() => { if (edit && inp.current) { inp.current.focus(); inp.current.select() } }, [edit])
  const startEdit = () => { setDraft(t.title + (t.amount ? ' ' + t.amount : '')); setEdit(true) }
  const save = () => { if (!edit) return; setEdit(false); const v = draft.trim(); if (v && v !== t.title + (t.amount ? ' ' + t.amount : '')) { onEdit(t, v); setSaved(Date.now()) } }
  const phase = dying && dying.phase
  const chars = [...t.title], dust = dustOf(t.id, chars.length)
  const [, tick] = useState(0)
  useEffect(() => { if (phase !== 'undo') return; const iv = setInterval(() => tick((x) => x + 1), 250); return () => clearInterval(iv) }, [phase])
  const left = dying && dying.end ? Math.max(1, Math.ceil((dying.end - Date.now()) / 1000)) : 0
  const base = { borderTop: i ? '1px solid var(--rule)' : 0, animationDelay: delay }
  if (phase === 'undo' || phase === 'gone') {
    return (
      <div ref={rowRef} className={'lf-row lf-todo lf-todo-undo' + (phase === 'gone' ? ' gone' : '')} style={base} role="status">
        <span className="lf-todo-ghost">已删除 <s>{t.title}</s></span>
        <button type="button" className="lf-sweep-btn pending" onClick={() => onRestore(t)} style={{ '--dur': '4s' }} aria-label={'撤销删除，还剩 ' + left + ' 秒'}>
          <span className="lf-sweep-glow" />
          <span className="lf-sweep-num"><span key={left} className="lf-roll">{left}</span></span>
          <span className="lf-sweep-label">撤销</span>
          <span className="lf-sweep-undo"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg></span>
        </button>
      </div>
    )
  }
  const dustOn = phase === 'dust', back = phase === 'back'
  return (
    <div className={'lf-row lf-todo' + (t.done ? ' done' : '') + cls + (dustOn ? ' dust' : '') + (back ? ' back' : '') + (edit ? ' editing' : '') + (saved && Date.now() - saved < 1200 ? ' saved' : '') + (arrived >= 0 ? ' lf-arrive' : '')} style={arrived >= 0 ? { ...base, '--ad': 0.5 + arrived * 0.16 + 's' } : base} ref={rowRef}
      onAnimationEnd={(e) => { if (arrived >= 0 && e.animationName === 'lf-arrive' && e.target === e.currentTarget) onLanded && onLanded(t.id) }}>
      {edit ? (
        <>
          <span className={'lf-check' + (t.done ? ' on' : '')} aria-hidden="true">{t.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}</span>
          <input ref={inp} className="lf-todo-input" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save() } else if (e.key === 'Escape') { e.preventDefault(); setEdit(false) } }}
            aria-label="改这件事，末尾写数字就是金额" placeholder="比如：交水电费 180" />
          <span className="lf-todo-hint">回车保存 · Esc 取消</span>
        </>
      ) : (
        <>
          <button type="button" className="lf-todo-hit" onClick={(ev) => !dying && onToggle(t, ev)} aria-pressed={t.done} disabled={!!dustOn}>
            <span className={'lf-check' + (t.done ? ' on' : '')}>{t.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path className="lf-tick" d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" /></svg>}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 15, color: t.done ? 'var(--ink3)' : C.ink, transition: 'color .3s' }}>
              <span className="lf-strike">{chars.map((c, k) => <span key={k} className="lf-ch" style={{ '--dx': dust[k].x + 'px', '--dy': dust[k].y + 'px', '--rot': dust[k].rot + 'deg', '--s': dust[k].s, '--i': k }}>{c}</span>)}</span>
            </span>
          </button>
          {t.amount ? <span className="lf-chip lf-todo-amt" data-ev={evAmount ? 'todos.amount' : undefined} style={{ background: t.done ? 'var(--fill)' : DOMAIN.money.soft, color: t.done ? 'var(--ink3)' : 'var(--money-ink)', height: 24 }}>{money(t.amount)}</span> : null}
          <span className="lf-todo-acts">
            <button type="button" className="lf-todo-act" onClick={startEdit} aria-label={'改「' + t.title + '」'} title="改一下">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>
            </button>
            <button type="button" className="lf-todo-act del" onClick={() => onDelete(t)} aria-label={'删除「' + t.title + '」'} title="删掉">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 7h14" /><path d="M10 7V5h4v2" /><path d="M7 7l1 12h8l1-12" /></svg>
            </button>
          </span>
        </>
      )}
    </div>
  )
}

// 顶部左下：今天接下来该记的（点一下就填进输入框）＋ 一条会滚动的「关系」小纸条 ＋ 常记
// 「要做的事」背面：做完收起来的，按天分组，可以放回去
function BackTodos({ records, today, onRestore }) {
  const list = records.filter((r) => r.type === 'todo' && (r.archived || (r.done && r.doneAt && r.doneAt < today))).sort((a, b) => (b.doneAt || b.t) - (a.doneAt || a.t))
  const groups = []
  list.forEach((t) => {
    const d = startOfDay(t.doneAt || t.t), days = Math.round((today - d) / 86400000)
    const label = days <= 0 ? '今天' : days === 1 ? '昨天' : days === 2 ? '前天' : (new Date(d).getMonth() + 1) + '月' + new Date(d).getDate() + '日'
    const g = groups[groups.length - 1]
    if (g && g.label === label) g.items.push(t); else groups.push({ label, items: [t] })
  })
  const [back, setBack] = useState({})
  // 放回去：这一条轻轻飘起、飞走，空位收拢；可以连着放好几件，翻回正面时再一起落下来
  const putBack = (t) => {
    if (back[t.id]) return
    setBack((b) => ({ ...b, [t.id]: true }))
    setTimeout(() => onRestore(t), 520)
  }
  return (
    <div className="lf-back">
      <div className="lf-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="lf-h">做完收起来的</h2>
        <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{list.length ? '共 ' + list.length + ' 件 · ' : ''}点空白处翻回去</span>
      </div>
      {list.length === 0 ? <p className="lf-sub" style={{ margin: '8px 0' }}>还没有收起来的事。清掉已完成的、或者前一天做完的，都会到这里。</p> : (
        <div className="lf-archive lf-inner-scroll">
          {groups.map((g) => (
            <div key={g.label} className="lf-archive-group">
              <div className="lf-archive-day">{g.label}</div>
              {g.items.map((t, i) => (
                <div key={t.id} className={'lf-archive-item' + (back[t.id] ? ' out' : '')} style={{ animationDelay: Math.min(i, 8) * 0.04 + 's' }}>
                  <span className="lf-archive-tick"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                  <span className="lf-archive-title">{t.title}</span>
                  {t.amount ? <span className="lf-archive-amt">{money(t.amount)}</span> : null}
                  <button type="button" className="lf-archive-back" onClick={() => putBack(t)} title="放回「要做的事」，重新变成没做完">放回去</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TodayNudges({ part, S, ghosts, usual, focused, onPick, onInsight, pinned }) {
  const slots = ghosts.slice().sort((a, b) => a.h - b.h).slice(0, 3)
  const tips = S.insights.slice(0, 4)
  const [ti, setTi] = useState(0)
  const [hold, setHold] = useState(false)
  useEffect(() => { if (hold || tips.length < 2) return; const iv = setInterval(() => setTi((x) => x + 1), 5200); return () => clearInterval(iv) }, [hold, tips.length])
  const tip = tips.length ? tips[ti % tips.length] : null
  const nowH = (S.now - S.today) / 3600000
  const fmtH = (h) => String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0')
  const tone = (d) => (C[d] && C[d] !== '#1F2328' ? C[d] : '#F4F5F1')
  // 点进输入框才出现：该记的和常记的，都是输入的“下拉建议”，平时不占地方
  const sugs = [
    ...slots.map((g) => ({ key: 'g' + g.key, text: g.title.replace('吃了什么', ''), sub: g.h <= nowH ? '该记了' : fmtH(g.h), due: g.h <= nowH, phrase: g.phrase, c: tone(g.domain) })),
    ...usual.slice(0, 4).map((u) => ({ key: 'u' + u, text: u, phrase: u })),
  ]
  const keep = (e) => e.preventDefault()
  return (
    <div className={'lf-nudges' + (focused ? ' focus' : '')}>
      {part === 'sugs' && <div className={'lf-sugs' + (focused && sugs.length ? ' on' : '')} aria-hidden={!focused}>
        {sugs.map((g, i) => (
          <button key={g.key} type="button" tabIndex={focused ? 0 : -1} className={'lf-sug' + (g.due ? ' due' : '')} style={{ '--c': g.c || 'rgba(244,245,241,.5)', transitionDelay: (focused ? i * 0.03 : 0) + 's' }}
            onMouseDown={keep} onClick={() => onPick(g.phrase)}>
            {g.c && <span className="lf-sug-dot" />}{g.text}{g.sub && <em>{g.sub}</em>}
          </button>
        ))}
      </div>}
      {part === 'tip' && tip && (
        <button type="button" className={'lf-tip' + (pinned && pinned.id === tip.id ? ' on' : '')} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onClick={() => onInsight(tip)} title="点一下，在下面的卡片上看它们怎么连起来">
          <span className="lf-tip-dots"><i style={{ background: tone(tip.from) }} /><b /><i style={{ background: tone(tip.to) }} /></span>
          <span className="lf-tip-win"><span key={tip.id + ti} className="lf-tip-text">{tip.text}</span></span>
          {tips.length > 1 && <span className="lf-tip-pager">{tips.map((_, k) => <i key={k} className={k === ti % tips.length ? 'on' : ''} />)}</span>}
        </button>
      )}
    </div>
  )
}

function EnergyTaste({ S, pour }) {
  const ref = useRef(null)
  const t = useTaste(ref, S)
  const cap = Math.max(GOALS.kcal + S.burned, S.kcalIn) * 1.05
  const pct = (v) => (v / cap) * 100 + '%'
  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        <LiquidBar eaten={S.kcalIn} goal={GOALS.kcal} burned={S.burned} cap={cap} meals={S.meals} preview={t && t.mode === 'taste' ? t.k : null} pour={pour} />
        {t && t.mode === 'taste' && t.more > 0 && (
          <div className="lf-taste-tip" style={{ left: `clamp(20px, ${pct(t.k)}, calc(100% - 20px))`, color: t.left < 0 ? '#C8373C' : undefined }}>+{num(t.more)}</div>
        )}
      </div>
      <div className="lf-row" style={{ justifyContent: 'space-between', marginTop: 12, fontSize: 13, color: 'var(--ink2)', minHeight: 18 }}>
        {!t ? (
          <>
            <span className="lf-row" data-ev="energy.eaten" style={{ gap: 6 }}><span className="lf-dot" style={{ background: C.food }} />吃了 <Num value={S.kcalIn} /></span>
            <span className="lf-row" style={{ gap: 6 }}><span className="lf-dot" style={{ background: C.move }} />练掉 <Num value={S.burned} /></span>
          </>
        ) : t.mode === 'meal' ? (
          <span key="meal" className="lf-swap lf-tab" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.meal ? fmtTime(t.meal.t) + ' ' + (MEAL_NAME[t.meal.meal] || '') + ' · ' + t.meal.title + ' · ' + num(t.meal.kcal) + ' 千卡' : '今天还没吃东西'}</span>
        ) : (
          <>
            <span className="lf-swap lf-tab" key="t1">要是再吃 <b style={{ color: 'var(--food-ink)' }}>{num(t.more)}</b> 千卡</span>
            <span className="lf-swap lf-tab" key="t2" style={{ color: t.left < 0 ? C.link : undefined }}>{t.left < 0 ? '会超出 ' + num(-t.left) : '还剩 ' + num(t.left)}</span>
          </>
        )}
      </div>
    </>
  )
}

function SleepBody({ S }) {
  const ref = useRef(null)
  const row = useSleepRow(ref, 7)
  const d = row != null ? S.week[row] : null
  return (
    <div className={'lf-sleep-body' + (d ? ' scan' : '')}>
      <div className="lf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="lf-h" style={{ opacity: 0.85, fontWeight: 500, fontSize: 14 }}>这周平均每晚</h2>
          <Num value={S.sleepAvg} format={(v) => fmtHM(v)} style={{ fontSize: 44, fontWeight: 500, lineHeight: 1.05 }} />
        </div>
        {d ? (
          <span key="scan" className="lf-swap lf-tab" style={{ fontSize: 13, opacity: 0.9, textAlign: 'right' }}>周{d.label}{d.today ? '（昨晚）' : ''}<br /><b style={{ fontSize: 16 }}>{d.sleep ? fmtHM(d.sleep.bed % 24) + ' → ' + fmtHM((d.sleep.bed + d.sleep.hours) % 24) : '没记'}</b></span>
        ) : (
          <span style={{ fontSize: 13, opacity: 0.8, textAlign: 'right' }}>昨晚<br /><b data-ev="sleep.last" style={{ fontSize: 16, display: 'inline-block' }}>{S.lastNight ? fmtHM(S.lastNight.hours) : '没记'}</b></span>
        )}
      </div>
      <SleepBars week={S.week} rowsRef={ref} on={row} />
    </div>
  )
}

function SleepBars({ week, rowsRef, on }) {
  const span = 12
  return (
    <div data-ev="sleep.bars" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6, marginTop: 16, flex: 1 }}>
      <div ref={rowsRef} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6, flex: 1 }}>
      {week.map((d, i) => (
        <div key={d.day} className={'lf-row lf-sleep-row' + (on === i ? ' on' : '')} style={{ gap: 10 }}>
          <span style={{ width: 14, fontSize: 12, opacity: d.today ? 1 : 0.7, fontWeight: d.today ? 700 : 400 }}>{d.label}</span>
          <div style={{ position: 'relative', flex: 1, height: 12 }}>
            {d.sleep && <div key={d.day + '-' + d.sleep.hours} className="lf-growx" title={fmtHM(d.sleep.hours)} style={{ position: 'absolute', top: 0, height: 12, borderRadius: 6, left: ((d.sleep.bed - 22) / span) * 100 + '%', width: (d.sleep.hours / span) * 100 + '%', background: d.today || on === i ? '#fff' : 'rgba(255,255,255,.4)', boxShadow: on === i ? '0 0 12px rgba(255,255,255,.6)' : 'none', transition: 'all .7s cubic-bezier(.2,.8,.2,1), box-shadow .2s, background .2s' }} />}
          </div>
        </div>
      ))}
      </div>
      <div className="lf-row lf-num" style={{ justifyContent: 'space-between', paddingLeft: 24, fontSize: 11.5, opacity: 0.75 }}>
        {[22, 0, 2, 4, 6, 8, 10].map((x) => <span key={x}>{x}</span>)}
      </div>
    </div>
  )
}

function WeightLine({ weights, now }) {
  const pts = weights.filter((w) => w.t > now - 30 * 86400000)
  if (pts.length < 2) return <div style={{ height: '100%' }} />
  const W = 220, H = 64, min = Math.min(...pts.map((p) => p.kg)) - 0.2, max = Math.max(...pts.map((p) => p.kg)) + 0.2
  const x = (t) => ((t - pts[0].t) / (pts[pts.length - 1].t - pts[0].t || 1)) * (W - 8) + 4
  const y = (k) => H - 6 - ((k - min) / (max - min || 1)) * (H - 12)
  const d = pts.map((p, i) => (i ? 'L' : 'M') + x(p.t).toFixed(1) + ' ' + y(p.kg).toFixed(1)).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }} role="img" aria-label={'30 天体重从 ' + pts[0].kg + ' 到 ' + last.kg}>
      <path d={d + ` L${x(last.t)} ${H} L4 ${H} Z`} style={{ fill: 'color-mix(in srgb,#0E8A8A 16%,var(--card))' }} />
      <path d={d} fill="none" stroke={C.body} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="lf-fadein" />
    </svg>
  )
}

function WeekBoard({ S }) {
  const nextMove = S.events.find((e) => e.domain === 'move' && !e.done && e.t > S.now)
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = S.today + i * 86400000
    const evs = S.events.filter((e) => e.t >= day && e.t < day + 86400000)
    const clash = evs.filter((a) => evs.some((b) => b !== a && a.t < (b.end || b.t) && b.t < (a.end || a.t)))
    days.push({ day, evs, clash: new Set(clash.map((c) => c.id)), label: i === 0 ? '今天' : i === 1 ? '明天' : '周' + '日一二三四五六'[new Date(day).getDay()], date: new Date(day).getDate() })
  }
  const clashDay = days.find((d) => d.clash.size)
  return (
    <>
      <div className="lf-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className="lf-h">接下来七天</h2>
        <span className="lf-sub" style={{ color: clashDay ? 'var(--warn-ink)' : undefined }}>{clashDay ? clashDay.label + ' 有两个安排撞了' : '没有冲突'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 8 }}>
        {days.map((d, i) => (
          <div key={d.day} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <div className="lf-row" style={{ gap: 6, height: 40, borderRadius: 14, justifyContent: 'center', background: i === 0 ? 'var(--ink)' : 'var(--fill)', color: i === 0 ? 'var(--card)' : C.ink, fontSize: 13 }}>
              <span style={{ opacity: 0.75 }}>{d.label}</span><b className="lf-num">{d.date}</b>
            </div>
            {d.evs.length === 0 && <span style={{ height: 44, borderRadius: 12, border: '1.5px dashed var(--line)' }} />}
            {d.evs.map((e) => {
              const clash = d.clash.has(e.id), move = e.domain === 'move', tc = TONES[eventTone(e)]
              return (
                <div key={e.id} data-ev={nextMove && e.id === nextMove.id ? 'week.move' : undefined} style={{ borderRadius: 12, padding: '7px 9px', minWidth: 0, background: clash ? 'color-mix(in srgb,#E5484D 13%,var(--card))' : move ? (e.done ? 'color-mix(in srgb,#1E9E6A 14%,var(--card))' : C.move) : e.t < S.now ? 'var(--fill)' : tc, color: clash ? 'var(--warn-ink)' : move ? (e.done ? 'var(--move-ink)' : '#fff') : e.t < S.now ? 'var(--ink3)' : '#fff', boxShadow: clash ? 'inset 0 0 0 1.5px #E5484D' : 'none' }}>
                  <div className="lf-num" style={{ fontSize: 11, opacity: 0.8 }}>{fmtTime(e.t)}{e.done ? ' · 已完成' : ''}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- 文案 ----------
function domainOf(r) {
  return { meal: 'food', expense: 'money', income: 'money', workout: 'move', sleep: 'sleep', weight: 'body', todo: 'time' }[r.type] || (r.domain === 'move' ? 'move' : 'time')
}
function labelOf(r) {
  switch (r.type) {
    case 'meal': return MEAL_NAME[r.meal] + ' ' + r.kcal + ' 千卡'
    case 'expense': return r.cat + ' ' + money(r.amount)
    case 'income': return '收入 ' + money(r.amount)
    case 'workout': return r.kind + ' ' + (r.steps ? Math.round(r.steps).toLocaleString('en-US') + ' 步 · 约 ' + r.minutes + ' 分' : r.minutes + ' 分') + ' · −' + r.kcal + ' 千卡'
    case 'sleep': return '睡眠 ' + fmtHM(r.hours)
    case 'weight': return '体重 ' + r.kg + ' kg'
    case 'event': return '日程 ' + fmtTime(r.t)
    case 'todo': return '待办' + (r.amount ? ' ' + money(r.amount) : '')
    default: return r.title
  }
}
// 补记过去某天的：前面带上日期，免得以为没记上（「今天记下的」里看不到它）
function whenOf(r) {
  if (r.type === 'event' || r.type === 'todo') return ''
  const d0 = startOfDay(Date.now())
  if (r.t >= d0) return ''
  const d = new Date(r.t), days = Math.round((d0 - startOfDay(r.t)) / 86400000)
  return (days === 1 ? '昨天' : days === 2 ? '前天' : (d.getMonth() + 1) + '月' + d.getDate() + '日') + ' · '
}
function summaryOf(rs) {
  return '记下了：' + rs.map((r) => whenOf(r) + labelOf(r)).join('，')
}
function highlight(text, tokens) {
  const marks = []
  tokens.forEach((t) => { const i = text.indexOf(t.text); if (i >= 0 && !marks.some((m) => i < m.e && i + t.text.length > m.s)) marks.push({ s: i, e: i + t.text.length, d: t.domain }) })
  marks.sort((a, b) => a.s - b.s)
  const out = []; let p = 0
  marks.forEach((m, k) => {
    if (m.s > p) out.push(<span key={'t' + k}>{text.slice(p, m.s)}</span>)
    const bg = C[m.d] === '#1F2328' ? '#F4F5F1' : C[m.d]
    out.push(<span key={'m' + k} className="lf-token" style={{ background: bg, color: m.d === 'food' || m.d === 'time' ? '#1F2328' : '#fff' }}>{text.slice(m.s, m.e)}</span>)
    p = m.e
  })
  if (p < text.length) out.push(<span key="end">{text.slice(p)}</span>)
  return out
}
function storyOf(S) {
  const bits = []
  if (S.kcalIn) bits.push('吃了 ' + num(S.kcalIn) + ' 千卡')
  if (S.burned) bits.push('练掉 ' + num(S.burned) + ' 千卡')
  if (S.todaySpent) bits.push('花了 ' + money(S.todaySpent))
  const sl = S.lastNight ? '昨晚睡了 ' + fmtHM(S.lastNight.hours) + (S.lastNight.hours < 6.5 ? '，有点少' : '') + '。' : ''
  const s = sl + (bits.length ? '今天' + bits.join('，') + '。' : '')
  const n = S.next ? '接下来是 ' + fmtTime(S.next.t) + ' 的' + S.next.title + '。' : ''
  return s + n
}
