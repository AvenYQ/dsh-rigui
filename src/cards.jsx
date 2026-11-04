// 每张卡片自己的鼠标小把戏 + 卡片背面
import React, { useState, useEffect, useRef } from 'react'
import { GOALS, fmtTime, fmtHM, money, num, MEAL_NAME } from './data.js'

const C = { sleep: '#3D4FB8', move: '#1E9E6A', food: '#F2994A', money: '#7C5CE0', body: '#0E8A8A', ink: '#1F2328' }
const WEEK = '日一二三四五六'
const md = (t) => { const d = new Date(t); return (d.getMonth() + 1) + '月' + d.getDate() + '日' }
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

// 鼠标在整张卡片上的位置，换算成相对 ref 元素的坐标
// 鼠标是否真的落在这块交互区上（上下各留一点余量，好对准）
export const inside = (p, pad = 10) => !!p && p.x >= -2 && p.x <= p.w + 2 && p.y >= -pad && p.y <= p.h + pad
export function useCardPointer(ref) {
  const [p, setP] = useState(null)
  useEffect(() => {
    const n = ref.current; if (!n) return
    const card = n.closest('.lf-card'); if (!card) return
    let raf = 0, last = null
    const move = (e) => {
      if (card.classList.contains('lf-flipping') || card.dataset.face === '1') { if (last) { last = null; setP(null) } return }
      last = e
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0; if (!last) return
        const r = n.getBoundingClientRect(), c = card.getBoundingClientRect()
        setP({ x: last.clientX - r.left, y: last.clientY - r.top, w: r.width, h: r.height, cy: (last.clientY - c.top) / c.height })
      })
    }
    const leave = () => { last = null; setP(null) }
    card.addEventListener('pointermove', move)
    card.addEventListener('pointerleave', leave)
    return () => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf) }
  }, [])
  return p
}

// ---------- 钱：日格子像点阵一样朝鼠标鼓起来 ----------
export function MoneyStrip({ S, coin }) {
  const ref = useRef(null)
  const p = useCardPointer(ref)
  const n = S.daysInMonth
  const monthStart = S.today - (S.dayOfMonth - 1) * 86400000
  const spendOf = (i) => { const day = monthStart + i * 86400000, h = S.heat.find((x) => x.day === day); return h ? h.v : 0 }
  const fi = inside(p, 14) ? Math.max(0, Math.min(n - 1, (p.x / p.w) * n - 0.5)) : null
  const hi = fi == null ? null : Math.round(fi)
  const day = hi == null ? null : monthStart + hi * 86400000
  const past = hi != null && hi < S.dayOfMonth - 1, isToday = hi === S.dayOfMonth - 1
  const v = hi != null && hi <= S.dayOfMonth - 1 ? spendOf(hi) : null
  const planDay = Math.max(1, GOALS.budget / n)
  const allowHi = hi == null ? 0 : past ? planDay : S.perDay + (isToday ? S.todaySpent : 0)
  return (
    <>
      <div ref={ref} style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0,1fr))`, gap: 2, height: 18, alignItems: 'end' }}>
        {Array.from({ length: n }, (_, i) => {
          const g = fi == null ? 0 : Math.exp(-((i - fi) ** 2) / (2 * 1.5 ** 2))
          const ti = S.dayOfMonth - 1
          // 每一格是一天的「小钱罐」：装了多少 = 花了多少 ÷ 那天的额度
          // 过去按计划额度（预算 ÷ 天数），今天按现在算出的「每天可花」，以后的日子是空罐子
          const allow = i < ti ? planDay : Math.max(1, S.perDay + (i === ti ? S.todaySpent : 0))
          const spent = i <= ti ? spendOf(i) : 0
          const r = spent / allow, over = r > 1
          return (
            <span key={i} className={'lf-jar' + (i === ti ? ' today' : '') + (i > ti ? ' future' : '') + (i === hi ? ' on' : '')}
              style={{ transform: `scaleY(${(1 + 0.95 * g).toFixed(3)}) scaleX(${(1 + 0.25 * g).toFixed(3)})` }}>
              <i key={i === ti ? 'f' + coin : 'f'} className={'lf-jar-fill' + (i === ti && coin ? ' pour' : '')} style={{ height: Math.min(1, r) * 100 + '%', background: over ? '#FFB8AE' : undefined }} />
              {over && <b className="lf-jar-over" style={{ height: Math.min(7, 2 + (r - 1) * 4) }} />}
            </span>
          )
        })}
      </div>
      <div className="lf-row" style={{ justifyContent: 'space-between', marginTop: 12, fontSize: 13, opacity: 0.88, minHeight: 18 }}>
        {hi == null ? (
          <>
            <span data-ev="money.today">今天花了 {money(S.todaySpent)}</span>
            <span data-ev="money.perday">每天可花 {money(S.perDay)}</span>
          </>
        ) : (
          <>
            <span key="scan-l" className="lf-swap lf-tab">{isToday ? '今天' : md(day) + ' 周' + WEEK[new Date(day).getDay()]}{v != null ? ' 花了 ' + money(v) : ''}</span>
            <span key="scan-r" className="lf-swap lf-tab">{v == null ? '这天可花 ' + money(S.perDay) : isToday ? (v > allowHi ? '超了 ' + money(v - allowHi) : '还能花 ' + money(allowHi - v)) : v > allowHi ? '超出计划 ' + money(v - allowHi) : v === 0 ? '一分没花' : '计划内，省下 ' + money(allowHi - v)}</span>
          </>
        )}
      </div>
    </>
  )
}

// ---------- 睡眠：鼠标像一盏小灯，照亮附近的星星 ----------
const STARS = (() => { let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; return Array.from({ length: 38 }, () => ({ x: r() * 100, y: r() * 100, z: 0.5 + r() * 1.1, tw: r() * 4 })) })()
export function SleepSky() {
  const ref = useRef(null), dots = useRef([])
  useEffect(() => {
    const n = ref.current; if (!n || reduced()) return
    const card = n.closest('.lf-card'); if (!card) return
    let raf = 0, pt = null
    const paint = () => {
      raf = 0
      const r = n.getBoundingClientRect()
      dots.current.forEach((d, i) => {
        if (!d) return
        const st = STARS[i], sx = (st.x / 100) * r.width, sy = (st.y / 100) * r.height
        let b = 0, dx = 0, dy = 0
        if (pt) { dx = sx - (pt.x - r.left); dy = sy - (pt.y - r.top); b = Math.exp(-(dx * dx + dy * dy) / (2 * 75 * 75)) }
        const dist = Math.hypot(dx, dy) || 1
        d.style.opacity = (0.1 + 0.9 * b).toFixed(3)
        d.style.transform = `translate(${((dx / dist) * b * 7 * st.z).toFixed(1)}px,${((dy / dist) * b * 7 * st.z).toFixed(1)}px) scale(${(0.7 + 1.5 * b * st.z).toFixed(2)})`
      })
    }
    const move = (e) => { pt = { x: e.clientX, y: e.clientY }; if (!raf) raf = requestAnimationFrame(paint) }
    const leave = () => { pt = null; if (!raf) raf = requestAnimationFrame(paint) }
    card.addEventListener('pointermove', move); card.addEventListener('pointerleave', leave)
    return () => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div ref={ref} className="lf-sky" aria-hidden="true">
      {STARS.map((s, i) => <i key={i} ref={(el) => { dots.current[i] = el }} style={{ left: s.x + '%', top: s.y + '%', width: 2.4 * s.z, height: 2.4 * s.z, animationDelay: s.tw + 's' }} />)}
    </div>
  )
}
// 睡眠条：鼠标停在哪一晚，那一晚亮起来，右上角换成那晚的详情
export function useSleepRow(ref, n) {
  const p = useCardPointer(ref)
  if (!inside(p, 0)) return null
  return Math.max(0, Math.min(n - 1, Math.floor((p.y / p.h) * n)))
}

// 消耗换算成吃的，更好理解
const kcalFood = (k) => k >= 500 ? (k / 250).toFixed(1).replace(/\.0$/, '') + ' 碗饭' : k >= 150 ? Math.round(k / 110) + ' 个鸡蛋' : '一根香蕉'
// ---------- 运动：像弹琴，鼠标划过哪天，那根柱子跳一下 ----------
export function MoveBars({ S }) {
  const ref = useRef(null)
  const p = useCardPointer(ref)
  const hi = inside(p, 8) ? Math.max(0, Math.min(6, Math.floor((p.x / p.w) * 7))) : null
  const [hops, setHops] = useState({})
  const last = useRef(null)
  useEffect(() => { if (hi != null && hi !== last.current) setHops((h) => ({ ...h, [hi]: (h[hi] || 0) + 1 })); last.current = hi }, [hi])
  const d = hi != null ? S.week[hi] : null
  return (
    <>
      <div className="lf-sub lf-move-cap" style={{ minHeight: 18, marginTop: -6, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {d ? <span key="scan" className="lf-swap lf-tab">周{d.label}{d.today ? '（今天）' : ''} · {d.workoutMin ? (d.steps ? num(d.steps) + ' 步 · ' : d.workoutMin + ' 分钟 · ') + '消耗 ' + num(d.workoutKcal) + ' 千卡' : '没练'}</span>
          : <span className="lf-tab">这周消耗 <b style={{ color: C.move }}>{num(S.weekKcal || 0)}</b> 千卡{S.weekKcal ? ' ≈ ' + kcalFood(S.weekKcal) : ''}</span>}
      </div>
      <div ref={ref} style={{ flex: 1, minHeight: 64, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 6, alignItems: 'stretch' }}>
        {S.week.map((x, i) => (
          <div key={x.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <span key={x.day + '-' + x.workoutMin + '-' + (hops[i] || 0)} data-ev={x.today ? 'move.today' : undefined}
              className={hops[i] ? 'lf-hop' : x.workoutMin ? 'lf-growy' : ''}
              style={{ width: '100%', maxWidth: 22, height: x.workoutMin ? Math.max(10, Math.min(100, x.workoutMin / 0.9)) + '%' : 6, maxHeight: 'calc(100% - 22px)', borderRadius: 6, background: x.workoutMin ? C.move : i === hi ? '#C9CEC6' : '#E2E5DF', transformOrigin: '50% 100%', transition: 'height .6s cubic-bezier(.2,.8,.2,1), background .2s' }} />
            <span style={{ fontSize: 11.5, color: i === hi ? C.move : x.today ? C.ink : '#5E645C', fontWeight: x.today || i === hi ? 700 : 400, transition: 'color .2s' }}>{x.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- 能量：在进度条上"试吃"，先看看再吃这么多还剩多少 ----------
export function useTaste(ref, S) {
  const p = useCardPointer(ref)
  if (!inside(p, 12)) return null
  const cap = Math.max(GOALS.kcal + S.burned, S.kcalIn) * 1.05
  const k = Math.max(0, Math.min(cap, (p.x / p.w) * cap))
  if (k <= S.kcalIn) {
    let acc = 0
    const m = S.meals.find((x) => { acc += x.kcal; return k <= acc })
    return { mode: 'meal', meal: m, k }
  }
  const more = Math.round((k - S.kcalIn) / 10) * 10
  return { mode: 'taste', k: S.kcalIn + more, more, left: GOALS.kcal + S.burned - S.kcalIn - more, cap }
}

// ---------- 体重：沿着折线扫，看到每一次称重 ----------
export function WeightScrub({ weights, now, children }) {
  const ref = useRef(null)
  const p = useCardPointer(ref)
  const pts = weights.filter((w) => w.t > now - 30 * 86400000)
  let dot = null
  if (inside(p, 8) && pts.length >= 2) {
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t
    const W = 220, H = 64, min = Math.min(...pts.map((q) => q.kg)) - 0.2, max = Math.max(...pts.map((q) => q.kg)) + 0.2
    const tx = t0 + ((p.x / p.w) * W - 4) / (W - 8) * (t1 - t0)
    const q = pts.reduce((a, b) => (Math.abs(b.t - tx) < Math.abs(a.t - tx) ? b : a))
    const x = (((q.t - t0) / (t1 - t0 || 1)) * (W - 8) + 4) / W, y = (H - 6 - ((q.kg - min) / (max - min || 1)) * (H - 12)) / H
    dot = { x, y, q }
  }
  return (
    <div ref={ref} style={{ position: 'relative', height: '100%' }}>
      {children}
      {dot && (
        <>
          <span className="lf-wline" style={{ left: dot.x * 100 + '%' }} />
          <span className="lf-wdot" style={{ left: dot.x * 100 + '%', top: dot.y * 100 + '%' }} />
          <span className="lf-wtag" style={{ left: `clamp(24px, ${dot.x * 100}%, calc(100% - 24px))` }}>{(new Date(dot.q.t).getMonth() + 1) + '/' + new Date(dot.q.t).getDate()} · {dot.q.kg.toFixed(1)}</span>
        </>
      )}
    </div>
  )
}

// ---------- 背面：这个数是怎么来的 ----------
function BackHead({ title, tone }) {
  return (
    <div className="lf-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 className="lf-h">{title}</h2>
      <span style={{ fontSize: 12, opacity: tone ? 0.75 : 1, color: tone ? undefined : '#8A8F86' }}>点一下翻回去</span>
    </div>
  )
}
function Eq({ rows, tone }) {
  return (
    <div className="lf-eq" style={{ '--line': tone ? 'rgba(255,255,255,.25)' : '#E4E6E0' }}>
      {rows.map((r, i) => (
        <div key={i} className={'lf-eq-row' + (r.total ? ' total' : '')} style={{ animationDelay: 0.12 + i * 0.07 + 's' }}>
          <span className="lf-eq-op">{r.op || ''}</span>
          <span style={{ flex: 1 }}>{r.label}</span>
          <b className="lf-num">{r.value}</b>
        </div>
      ))}
    </div>
  )
}
export function BackEnergy({ S }) {
  return (
    <div className="lf-back">
      <BackHead title="今天还能吃，怎么算的" />
      <Eq rows={[
        { label: '每天的目标', value: num(GOALS.kcal) },
        { op: '+', label: '练掉的', value: num(S.burned) },
        { op: '−', label: '已经吃的', value: num(S.kcalIn) },
        { op: '=', label: S.allowance < 0 ? '超出了' : '还能吃', value: num(Math.abs(S.allowance)), total: true },
      ]} />
      <div className="lf-back-list">
        {S.meals.length ? S.meals.map((m) => <div key={m.id} className="lf-row" style={{ justifyContent: 'space-between' }}><span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmtTime(m.t)} {MEAL_NAME[m.meal] || ''} · {m.title}</span><span className="lf-num">{num(m.kcal)}</span></div>) : <span>今天还没记吃的。</span>}
      </div>
      <p className="lf-back-note">练得越多，能吃的越多；目标在「目标」里改。</p>
    </div>
  )
}
export function BackMoney({ S }) {
  const top = S.cats.slice(0, 3), mx = top.length ? top[0][1] : 1
  return (
    <div className="lf-back">
      <BackHead title="还能花，怎么算的" tone />
      <Eq tone rows={[
        { label: '这个月预算', value: money(GOALS.budget) },
        { op: '−', label: '已经花了', value: money(S.spent) },
        ...(S.pendingBills ? [{ op: '−', label: '没付的账单', value: money(S.pendingBills) }] : []),
        { op: '÷', label: '剩下 ' + S.daysLeft + ' 天', value: '' },
        { op: '=', label: '每天可花', value: money(S.perDay), total: true },
      ]} />
      <div className="lf-back-list">
        {top.length ? top.map(([c, v], i) => (
          <div key={c} className="lf-row" style={{ gap: 8 }}>
            <span style={{ width: 36 }}>{c}</span>
            <span style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}><span className="lf-growx" style={{ display: 'block', height: '100%', width: (v / mx) * 100 + '%', background: '#fff', borderRadius: 3, animationDelay: 0.3 + i * 0.08 + 's' }} /></span>
            <span className="lf-num" style={{ width: 64, textAlign: 'right' }}>{money(v)}</span>
          </div>
        )) : <span>这个月还没记花销。</span>}
      </div>
      <p className="lf-back-note">照现在的速度，月底大约花 {money(S.pace)}。</p>
    </div>
  )
}
export function BackSleep({ S }) {
  const goal = GOALS.sleep
  return (
    <div className="lf-back">
      <BackHead title="这一周每晚" tone />
      <div className="lf-back-list" style={{ gap: 5 }}>
        {S.week.slice().reverse().map((d, i) => (
          <div key={d.day} className="lf-row lf-eq-row" style={{ gap: 10, animationDelay: 0.1 + i * 0.05 + 's' }}>
            <span style={{ width: 28, opacity: 0.8 }}>周{d.label}</span>
            <span style={{ flex: 1, opacity: d.sleep ? 1 : 0.55 }}>{d.sleep ? fmtHM(d.sleep.bed % 24) + ' 睡' : '没记'}</span>
            <b className="lf-num" style={{ color: d.sleep && d.sleep.hours < goal - 0.5 ? '#FFD0D2' : undefined }}>{d.sleep ? fmtHM(d.sleep.hours) : '—'}</b>
          </div>
        ))}
      </div>
      <p className="lf-back-note">平均 {S.sleepAvg ? fmtHM(S.sleepAvg) : '—'}，目标 {fmtHM(goal)}。少于目标半小时以上的那晚标成了粉色。</p>
    </div>
  )
}
export function BackMove({ S, workouts }) {
  return (
    <div className="lf-back">
      <BackHead title="这周练了什么" />
      <div className="lf-back-list">
        {workouts.length ? workouts.map((w) => <div key={w.id} className="lf-row" style={{ justifyContent: 'space-between', gap: 8 }}><span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>周{WEEK[new Date(w.t).getDay()]} · {w.kind || w.title}</span><span className="lf-num" style={{ flex: 'none' }}>{w.steps ? num(w.steps) + ' 步' : w.minutes + ' 分'} · {num(w.kcal)} 千卡</span></div>) : <span>这周还没练。说「跑步 30 分钟」就会记上。</span>}
      </div>
      <p className="lf-back-note">目标每周 {GOALS.workoutsPerWeek} 次，还差 {Math.max(0, GOALS.workoutsPerWeek - S.weekWorkouts)} 次。</p>
    </div>
  )
}
export function BackBody({ S, monthWeight }) {
  const recent = S.weights.slice(-5).reverse()
  const tdee = S.wNow ? Math.round((S.wNow * 30) / 50) * 50 : null
  return (
    <div className="lf-back">
      <BackHead title="最近几次称重" />
      <div className="lf-back-list">
        {recent.length ? recent.map((w) => <div key={w.id} className="lf-row" style={{ justifyContent: 'space-between' }}><span>{md(w.t)} {fmtTime(w.t)}</span><b className="lf-num">{w.kg.toFixed(1)} kg</b></div>) : <span>还没称过。</span>}
      </div>
      <p className="lf-back-note">{tdee ? `按 ${S.wNow.toFixed(1)} kg 估，每天大约消耗 ${num(tdee)} 千卡。` : ''}{monthWeight ? ` Boss 战目标 ${monthWeight} kg。` : ''}</p>
    </div>
  )
}

export const CARDS_CSS = `
.lf-tab{font-variant-numeric:tabular-nums}
.lf-root .lf-name{border:0;background:transparent;padding:0;font:inherit;color:inherit;letter-spacing:inherit;cursor:text;border-radius:10px;transition:background .2s}
.lf-root .lf-name:hover{background:rgba(255,255,255,.06)}
.lf-name-add{color:rgba(244,245,241,.35);font-size:.6em;font-weight:500;letter-spacing:0;vertical-align:.25em}
.lf-name-input{width:6em;border:0;border-bottom:2px solid rgba(244,245,241,.4);background:transparent;color:inherit;font:inherit;letter-spacing:inherit;outline:none;padding:0}
.lf-todo-list{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0 -10px;padding:0 10px 4px;scrollbar-width:thin;scrollbar-color:#D5D8D1 transparent;-webkit-mask-image:linear-gradient(#000 calc(100% - 14px),transparent);mask-image:linear-gradient(#000 calc(100% - 14px),transparent)}
.lf-todo-list::-webkit-scrollbar{width:6px}
.lf-todo-list::-webkit-scrollbar-thumb{background:#D5D8D1;border-radius:3px}
.lf-archive{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0 -6px;padding:0 6px 8px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin}
.lf-archive-day{font-size:11.5px;font-weight:600;color:#8A8F86;letter-spacing:.04em;margin:2px 0 4px}
.lf-archive-item{display:flex;align-items:center;gap:10px;min-height:34px;padding:0 8px;margin:0 -8px;border-radius:10px;font-size:14px;color:#5E645C;animation:lf-swap .3s cubic-bezier(.2,.8,.2,1) both;transition:background .2s}
.lf-archive-item:hover{background:#F4F5F1}
.lf-archive-item.out{pointer-events:none;animation:lf-archout .55s cubic-bezier(.45,0,.55,1) forwards;will-change:transform,opacity}
@keyframes lf-archout{0%{transform:none;opacity:1;max-height:40px;min-height:34px}45%{transform:translate(18px,-10px) rotate(2deg);opacity:.85;max-height:40px;min-height:34px}100%{transform:translate(70px,-30px) rotate(6deg) scale(.9);opacity:0;max-height:0;min-height:0}}
.lf-todo.lf-arrive{animation:lf-arrive 1.1s var(--ad,.5s) cubic-bezier(.22,1,.36,1) both}
@keyframes lf-arrive{0%{transform:translateY(-26px) rotate(-1.5deg);opacity:0}35%{opacity:1}100%{transform:none;opacity:1}}
@keyframes lf-arrivecheck_unused{0%{transform:scale(1)}40%{transform:scale(1.25);border-color:#1E9E6A;box-shadow:0 0 0 4px rgba(30,158,106,.18)}100%{transform:none}}
.lf-archive-tick{width:16px;height:16px;border-radius:5px;background:#DDF2E8;color:#1E9E6A;display:grid;place-items:center;flex:none}
.lf-archive-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lf-archive-amt{font-size:12.5px;color:#7C5CE0;font-variant-numeric:tabular-nums}
.lf-root .lf-archive-back{height:26px;padding:0 10px;border:0;border-radius:13px;background:transparent;color:#1E9E6A;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;opacity:0;transition:opacity .2s,background .2s}
.lf-archive-item:hover .lf-archive-back,.lf-archive-back:focus-visible{opacity:1}
.lf-root .lf-archive-back:hover{background:#E5F4EC}
.lf-root .lf-todo{padding-left:8px;padding-right:6px;margin:0 -8px;width:calc(100% + 14px)}
.lf-nudges{display:flex;flex-direction:column;gap:12px;margin-top:auto}
.lf-nudge-row{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}
.lf-nudge-label{font-size:12.5px;color:rgba(244,245,241,.4);flex:none;width:40px}
.lf-root .lf-nudge{flex:none;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 12px 0 10px;border:0;border-radius:16px;background:rgba(255,255,255,.07);color:rgba(244,245,241,.88);font:inherit;font-size:13.5px;white-space:nowrap;cursor:pointer;transition:background .2s,transform .25s cubic-bezier(.2,.9,.3,1.4);animation:lf-rise .45s cubic-bezier(.2,.8,.2,1) both}
.lf-root .lf-nudge:hover{background:rgba(255,255,255,.14);transform:translateY(-2px)}
.lf-root .lf-nudge:active{transform:scale(.95)}
.lf-nudge.plain{padding:0 12px}
.lf-nudge-dot{width:8px;height:8px;border-radius:4px;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 22%,transparent)}
.lf-nudge.due .lf-nudge-dot{animation:lf-nudgeping 1.6s ease-out infinite}
@keyframes lf-nudgeping{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 55%,transparent)}100%{box-shadow:0 0 0 9px transparent}}
.lf-nudge-time{font-size:12px;color:rgba(244,245,241,.45);font-variant-numeric:tabular-nums}
.lf-nudge.due .lf-nudge-time{color:var(--c)}
.lf-root .lf-tip{display:flex;align-items:center;gap:12px;width:100%;max-width:560px;padding:12px 14px;border:0;border-radius:16px;background:linear-gradient(100deg,rgba(255,255,255,.07),rgba(255,255,255,.025));color:rgba(244,245,241,.85);font:inherit;font-size:14px;text-align:left;cursor:pointer;transition:background .25s,box-shadow .25s}
.lf-root .lf-tip:hover,.lf-root .lf-tip.on{background:linear-gradient(100deg,rgba(255,255,255,.12),rgba(255,255,255,.04));box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
.lf-tip-dots{display:flex;align-items:center;flex:none}
.lf-tip-dots i{width:9px;height:9px;border-radius:5px}
.lf-tip-dots b{width:12px;height:2px;background:rgba(244,245,241,.25);position:relative;overflow:hidden}
.lf-tip-dots b::after{content:'';position:absolute;inset:0;background:#fff;transform:translateX(-100%);animation:lf-tipflow 1.8s ease-in-out infinite}
@keyframes lf-tipflow{60%,100%{transform:translateX(100%)}}
.lf-tip-win{flex:1;min-width:0;height:22px;overflow:hidden;position:relative}
.lf-tip-text{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:22px;animation:lf-tiproll .5s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes lf-tiproll{from{transform:translateY(100%);opacity:0;filter:blur(2px)}to{transform:none;opacity:1;filter:none}}
.lf-tip-pager{display:flex;gap:4px;flex:none}
.lf-tip-pager i{width:4px;height:4px;border-radius:2px;background:rgba(244,245,241,.25);transition:width .3s,background .3s}
.lf-tip-pager i.on{width:12px;background:rgba(244,245,241,.8)}
.lf-root .lf-alldone{flex:1;min-height:0;flex-direction:row;gap:14px;text-align:left;padding:14px 0 4px}
.lf-root .lf-alldone .lf-ad-badge{width:46px;height:46px;flex:none}
.lf-root .lf-sweep-btn,.lf-sweep-btn{position:relative;overflow:hidden;isolation:isolate;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border:0;border-radius:14px;background:#F1F2EE;color:#3A3F38;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .25s,color .25s,padding .3s cubic-bezier(.2,.9,.3,1.2),transform .2s,box-shadow .3s;animation:lf-pillin .35s cubic-bezier(.2,.9,.3,1.3)}
.lf-sweep-btn:hover{background:#E6E8E2}
.lf-sweep-btn:not(.pending):hover svg{animation:lf-broom .5s ease-in-out infinite alternate;transform-origin:70% 30%}
.lf-sweep-btn:active{transform:scale(.95)}
.lf-sweep-btn.pending{padding:0 4px 0 4px;background:#fff;color:#1E9E6A;box-shadow:0 0 0 1px #DDEFE6,0 6px 18px -6px rgba(30,158,106,.45)}
.lf-sweep-btn.pending:hover{background:#F6FBF8}
@keyframes lf-pillin{from{transform:scale(.85);opacity:.4}to{transform:none;opacity:1}}
.lf-sweep-glow{position:absolute;z-index:-1;left:0;top:0;bottom:0;width:100%;background:linear-gradient(90deg,rgba(30,158,106,.18),rgba(30,158,106,.06) 70%,transparent);transform-origin:0 50%;animation:lf-drain var(--dur,5s) linear forwards}
.lf-sweep-glow::after{content:'';position:absolute;right:-14px;top:50%;width:28px;height:28px;margin-top:-14px;border-radius:50%;background:radial-gradient(circle,rgba(30,158,106,.35),transparent 70%);filter:blur(2px)}
@keyframes lf-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.lf-sweep-num{position:relative;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:10px;background:#1E9E6A;color:#fff;font-size:11.5px;font-weight:700;overflow:hidden;font-variant-numeric:tabular-nums;box-shadow:0 0 0 3px rgba(30,158,106,.15);animation:lf-numpulse 1s ease-in-out infinite}
@keyframes lf-numpulse{50%{box-shadow:0 0 0 5px rgba(30,158,106,.08)}}
.lf-roll{display:block;animation:lf-roll .35s cubic-bezier(.2,.9,.3,1.25)}
@keyframes lf-roll{from{transform:translateY(110%);opacity:0;filter:blur(1.5px)}to{transform:none;opacity:1;filter:none}}
.lf-sweep-label{white-space:nowrap}
.lf-sweep-undo{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:10px;background:#E5F4EC;color:#1E9E6A;transition:transform .3s,background .2s}
.lf-sweep-btn.pending:hover .lf-sweep-undo{transform:rotate(-200deg);background:#1E9E6A;color:#fff}
.lf-todo{width:100%;padding:10px 0;min-height:44px;gap:10px;position:relative}
.lf-todo-hit{display:flex;align-items:center;gap:10px;flex:1;min-width:0;border:0;background:transparent;padding:0;text-align:left;color:inherit;font:inherit;cursor:pointer;min-height:24px}
.lf-todo-hit:active .lf-check{transform:scale(.85)}
.lf-todo-acts{display:flex;gap:2px;opacity:.32;transition:opacity .2s}
.lf-todo:hover .lf-todo-acts,.lf-todo:has(:focus-visible) .lf-todo-acts{opacity:1}
.lf-todo.done .lf-todo-acts{opacity:.22}
.lf-todo.done:hover .lf-todo-acts{opacity:1}
.lf-todo-act{width:28px;height:28px;border:0;border-radius:9px;background:transparent;color:#8A8F86;display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s,transform .15s}
.lf-todo-act:hover{background:#F1F2EE;color:#1F2328}
.lf-todo-act.del:hover{background:#FDECEC;color:#D9363E}
.lf-todo-act.del:hover svg{animation:lf-binshake .4s ease-in-out}
@keyframes lf-binshake{25%{transform:rotate(-12deg)}75%{transform:rotate(10deg)}}
.lf-todo-act:active{transform:scale(.88)}
.lf-ch{display:inline-block;white-space:pre}
.lf-todo.dust .lf-ch{animation:lf-dust .55s cubic-bezier(.3,.1,.6,1) both;animation-delay:calc(var(--i) * 28ms)}
@keyframes lf-dust{0%{transform:none;opacity:1;filter:none}30%{transform:translate(calc(var(--dx) * .15),-3px) scale(1.08);opacity:1;color:#D9363E}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(var(--s));opacity:0;filter:blur(2px);color:#D9363E}}
.lf-todo.dust .lf-check,.lf-todo.dust .lf-todo-amt{animation:lf-dustbox .45s cubic-bezier(.5,0,.75,0) both}
.lf-todo.dust .lf-todo-amt{animation-delay:.15s}
@keyframes lf-dustbox{30%{transform:scale(1.12) rotate(-6deg)}100%{transform:scale(0) rotate(30deg);opacity:0}}
.lf-todo.dust .lf-todo-acts{opacity:0!important}
.lf-todo.dust .lf-strike{background-size:0 1.5px!important}
.lf-todo.back .lf-ch{animation:lf-dust .5s cubic-bezier(.2,.8,.3,1) reverse both;animation-delay:calc(var(--i) * 22ms)}
.lf-todo.back .lf-check,.lf-todo.back .lf-todo-amt{animation:lf-dustbox .4s cubic-bezier(.2,.9,.3,1.4) reverse both}
.lf-root .lf-todo-undo .lf-sweep-btn.pending{padding:0 3px;height:24px;font-size:12px;gap:5px}
.lf-todo-undo .lf-sweep-num,.lf-todo-undo .lf-sweep-undo{width:17px;height:17px;font-size:10.5px}
.lf-todo-undo{justify-content:space-between;background:linear-gradient(90deg,#FBFCFA,transparent);border-radius:12px;animation:lf-swap .3s cubic-bezier(.2,.8,.2,1) both}
.lf-todo-undo.gone{overflow:hidden;animation:lf-undogone .36s cubic-bezier(.5,0,.75,0) forwards}
@keyframes lf-undogone{to{max-height:0;min-height:0;padding-top:0;padding-bottom:0;opacity:0;border-top-width:0;transform:scale(.96)}}
.lf-todo-ghost{font-size:13.5px;color:#8A8F86;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.lf-todo-ghost s{color:#B5B9B1;text-decoration-color:rgba(217,54,62,.55)}
.lf-todo-input:focus,.lf-todo-input:focus-visible{outline:none!important}
.lf-todo-input{flex:1;min-width:0;height:32px;margin:-4px 0;padding:0 10px;border:1.5px solid #1E9E6A;border-radius:9px;background:#fff;font:inherit;font-size:15px;color:#1F2328;outline:none;box-shadow:0 0 0 4px rgba(30,158,106,.12);animation:lf-swap .2s ease both}
.lf-todo-hint{font-size:11.5px;color:#8A8F86;white-space:nowrap}
.lf-todo.saved .lf-strike{animation:lf-saved 1s ease both}
@keyframes lf-saved{0%{background-color:rgba(30,158,106,.22)}100%{background-color:transparent}}
.lf-todo.lf-pend{opacity:.38;transform:translateX(8px);transition:opacity .35s,transform .45s cubic-bezier(.2,.9,.3,1.2)}
.lf-todo{transition:opacity .35s,transform .45s cubic-bezier(.2,.9,.3,1.2)}
@keyframes lf-broom{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
.lf-todo.lf-swept{overflow:hidden;animation:lf-swept .5s cubic-bezier(.5,0,.75,0) both}
@keyframes lf-swept{0%{transform:none;opacity:1;max-height:64px}35%{transform:translateX(-10px);opacity:1;max-height:64px}100%{transform:translateX(110%) rotate(2deg);opacity:0;max-height:0;min-height:0;padding-top:0;padding-bottom:0;border-top-width:0}}
.lf-jar{position:relative;height:18px;border-radius:3px;background:rgba(255,255,255,.16);transform-origin:50% 100%;transition:transform .18s cubic-bezier(.2,.9,.3,1.3),background .2s,box-shadow .2s}
.lf-jar.future{background:transparent;box-shadow:inset 0 0 0 1px rgba(255,255,255,.32)}
.lf-jar.today{box-shadow:0 0 0 1.5px #fff}
.lf-jar.on{background:rgba(255,255,255,.28)}
.lf-jar.future.on{box-shadow:inset 0 0 0 1px rgba(255,255,255,.7)}
.lf-jar-fill{position:absolute;left:0;right:0;bottom:0;border-radius:2px;background:rgba(255,255,255,.78);transition:height .6s cubic-bezier(.2,.8,.2,1)}
.lf-jar.today .lf-jar-fill{background:#fff}
.lf-jar-fill.pour{animation:lf-jarpour .7s cubic-bezier(.3,1.5,.5,1)}
@keyframes lf-jarpour{0%{transform:scaleY(.2);transform-origin:50% 100%}60%{transform:scaleY(1.15)}100%{transform:none}}
.lf-jar-over{position:absolute;left:0;right:0;bottom:100%;margin-bottom:1px;border-radius:2px 2px 1px 1px;background:#FF8F80}
.lf-fadein{animation:lf-fadein .6s ease both}
@keyframes lf-fadein{from{opacity:0}to{opacity:1}}
.lf-swap{animation:lf-swap .22s cubic-bezier(.2,.8,.2,1) both}
@keyframes lf-swap{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.lf-sky{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;border-radius:inherit}
.lf-sky i{position:absolute;border-radius:50%;background:#fff;opacity:.1;transition:opacity .35s,transform .45s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 6px rgba(255,255,255,.9)}
.lf-sleep-body{position:relative;z-index:1;display:flex;flex-direction:column;flex:auto;min-height:0}
.lf-sleep-row{transition:opacity .2s}
.lf-sleep-body.scan .lf-sleep-row{opacity:.45}
.lf-sleep-body.scan .lf-sleep-row.on{opacity:1}
.lf-hop{animation:lf-hop .55s cubic-bezier(.3,1.6,.5,1)}
@keyframes lf-hop{0%{transform:scaleY(1)}30%{transform:scaleY(1.22) translateY(-3px)}55%{transform:scaleY(.9)}75%{transform:scaleY(1.05)}100%{transform:none}}
.lf-taste{position:absolute;top:7px;height:12px;border-radius:0 6px 6px 0;background:repeating-linear-gradient(135deg,rgba(242,153,74,.55) 0 4px,rgba(242,153,74,.25) 4px 8px);pointer-events:none;transition:width .12s}
.lf-taste-tip{position:absolute;top:-16px;transition:left .1s;font-variant-numeric:tabular-nums;transform:translateX(-50%);font-size:11.5px;font-weight:700;color:#C26A1E;white-space:nowrap;pointer-events:none}
.lf-taste-pin{position:absolute;top:3px;bottom:3px;width:2px;margin-left:-1px;border-radius:1px;background:#F2994A;pointer-events:none}
.lf-wline{position:absolute;top:0;bottom:0;width:1px;transition:left .12s;background:rgba(14,138,138,.35);pointer-events:none}
.lf-wdot{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#fff;border:2.5px solid #0E8A8A;pointer-events:none;transition:left .12s,top .12s}
.lf-wtag{position:absolute;top:-20px;transition:left .12s;font-variant-numeric:tabular-nums;transform:translateX(-50%);font-size:11.5px;font-weight:600;color:#0E6E6E;white-space:nowrap;pointer-events:none}
.lf-flip{position:absolute;top:4px;left:50%;margin-left:38px;z-index:3;width:22px;height:20px;border:0;border-radius:10px;background:transparent;color:currentColor;opacity:0;display:grid;place-items:center;transition:opacity .2s,transform .3s}
.lf-widget:hover .lf-flip,.lf-flip:focus-visible{opacity:.55}
.lf-flip:hover{opacity:.9!important;transform:rotate(180deg)}
.lf-root.lf-scrolling .lf-flip{opacity:0}
.lf-card.has-back{cursor:pointer}
.lf-card.has-back .lf-grip{cursor:grab}
.lf-back{display:flex;flex-direction:column;flex:auto;min-height:0}
.lf-eq{display:flex;flex-direction:column}
.lf-eq-row{display:flex;align-items:baseline;gap:8px;font-size:13.5px;padding:2.5px 0;animation:lf-swap .35s cubic-bezier(.2,.8,.2,1) both}
.lf-eq-row.total{border-top:1.5px solid var(--line);margin-top:4px;padding-top:6px;font-size:15px}
.lf-eq-row.total b{font-size:18px}
.lf-eq-op{width:14px;opacity:.55;font-weight:600}
.lf-back-list{display:flex;flex-direction:column;gap:7px;margin-top:12px;font-size:13px;flex:0 1 auto;min-height:0;overflow:hidden;-webkit-mask-image:linear-gradient(#000 calc(100% - 18px),transparent);mask-image:linear-gradient(#000 calc(100% - 18px),transparent);padding-bottom:6px}
.lf-back-note{margin:auto 0 0;padding-top:10px;font-size:12.5px;opacity:.7;line-height:1.5}
@media (prefers-reduced-motion:reduce){.lf-hop,.lf-swap,.lf-eq-row{animation:none}}
`
