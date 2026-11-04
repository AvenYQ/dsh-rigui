import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { GOALS, num, money, fmtHM, hourOf, startOfDay } from './data.js'

// 六层：从靶心往外。结构参考 Dan Koe《How to fix your entire life in 1 day》
export const LAYERS = [
  { key: 'daily', game: '每日任务', name: '每天', color: '#F2994A', r: 40 },
  { key: 'month', game: 'Boss 战', name: '这个月', color: '#1E9E6A', r: 68 },
  { key: 'year', game: '主线任务', name: '一年', color: '#3D4FB8', r: 96 },
  { key: 'vision', game: '胜利条件', name: '愿景', color: '#7C5CE0', r: 124 },
  { key: 'anti', game: '赌注', name: '反愿景', color: '#E5484D', r: 152 },
  { key: 'rules', game: '规则', name: '底线', color: '#1F2328', r: 172 },
]
const LAYER = Object.fromEntries(LAYERS.map((l) => [l.key, l]))
const DAY = 86400000
const pad = (n) => (n < 10 ? '0' : '') + n
const hm = (h) => { const m = Math.round((((h % 24) + 24) % 24) * 60); return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60) }
const r50 = (x) => Math.round(x / 50) * 50
const r10 = (x) => Math.round(x / 10) * 10

// ---------- 按真实数据给建议 ----------
export function suggestGoals(S, records) {
  const now = S.now, since = now - 30 * DAY
  const w = S.wNow
  const recent = records.filter((r) => r.t >= since && r.t <= now)
  const expDays = new Set(recent.filter((r) => r.type === 'expense').map((r) => startOfDay(r.t))).size
  const spent30 = recent.filter((r) => r.type === 'expense' && r.cat !== '居家').reduce((a, r) => a + r.amount, 0)
  const fixed = recent.filter((r) => r.type === 'expense' && r.cat === '居家').reduce((a, r) => a + r.amount, 0)
  const wk = recent.filter((r) => r.type === 'workout').length / 30 * 7
  const wake = S.lastNight ? hourOf(S.lastNight.t + S.lastNight.hours * 3600000) : 7
  const tdee = w ? r50(w * 30) : 2200
  const out = []
  const add = (o) => out.push(o)

  // 每天
  add({ id: 'kcal', layer: 'daily', title: '每天吃到', num: { key: 'kcal', value: Math.max(1500, tdee - 500), min: 1400, max: 3500, step: 50, unit: '千卡' },
    why: w ? `按 ${w} kg 估，你每天大约消耗 ${num(tdee)} 千卡。少吃 500，一周约轻 0.5 kg，不会饿到撑不住。` : '先按 2,200 千卡的消耗估，记了体重以后会算得更准。' })
  add({ id: 'sleep', layer: 'daily', title: '每晚睡够', num: { key: 'sleep', value: 7.5, min: 6, max: 9, step: 0.5, unit: '小时', fmt: (v) => fmtHM(v) },
    why: (v) => `你大约 ${hm(wake)} 起床，睡够 ${fmtHM(v)} 就要 ${hm(wake - v)} 前睡下。`, after: (v) => `${hm(wake - v)} 前睡` })
  add({ id: 'lever', layer: 'daily', title: '每天一个小动作', texts: ['每顿饭随手记一句，不用算，AI 来算', '午饭后走 15 分钟', '睡前 30 分钟不看手机'],
    why: '每天的动作要小到不用意志力，做了就能在页面上看到。' })

  // 这个月
  const nowWk = Math.round(wk)
  add({ id: 'workouts', layer: 'month', title: '这个月每周练', num: { key: 'workoutsPerWeek', value: Math.min(4, Math.max(3, nowWk + 1)), min: 1, max: 7, step: 1, unit: '次' },
    why: nowWk ? `最近平均每周练 ${nowWk} 次，多加 1 次，刚好够得着。` : '最近还没怎么练，先定每周 3 次，比 4 次更容易坚持住一个月。' })
  if (w) add({ id: 'monthWeight', layer: 'month', title: '30 天后体重', num: { key: 'monthWeight', value: +(w - 2).toFixed(1), min: +(w - 4).toFixed(1), max: w, step: 0.5, unit: 'kg', fmt: (v) => v.toFixed(1) },
    why: (v) => `每周约 ${((w - v) / 4.3).toFixed(1)} kg，这是不伤身体、也不容易反弹的速度。` })

  // 一年
  if (w) add({ id: 'yearWeight', layer: 'year', title: '一年后体重', num: { key: 'weight', value: +(w * 0.9).toFixed(1), min: +(w * 0.8).toFixed(1), max: w, step: 0.5, unit: 'kg', fmt: (v) => v.toFixed(1) },
    why: (v) => `比现在轻 ${(w - v).toFixed(1)} kg（约 ${Math.round((1 - v / w) * 100)}%），平摊到 52 周，每周不到 ${((w - v) / 52 + 0.05).toFixed(1)} kg。` })
  add({ id: 'yearRun', layer: 'year', title: '一年后能做到', texts: ['一口气跑完 10 公里', '体检报告每一项都在正常范围', '连续 100 天按时睡觉'],
    why: '一个看得见、能验证的标志，到时候你自己就知道有没有变成另一个人。' })

  // 愿景
  add({ id: 'vision', layer: 'vision', title: '我是一个……', texts: ['我是一个睡得规律、每周都在动、钱花在刀刃上的人', '我是一个说练就练、身体一天比一天轻的人', '我是一个对自己的时间和身体都有掌控感的人'],
    why: '写成身份，而不是愿望。每次犹豫时，问一句：这样的人现在会怎么做？' })

  // 反愿景
  add({ id: 'anti', layer: 'anti', title: '我不要变成', texts: ['五年后还是作息乱、体重一年比一年高、月底不知道钱去哪了的人', '一个总说「下周开始」，结果五年都没开始的人', '体检单越来越长、爬几层楼就喘的人'],
    why: '想清楚什么都不改会变成什么样，这是这局游戏的赌注。' })

  // 底线
  const est = expDays >= 10 ? (spent30 / Math.max(1, expDays)) * 30 + fixed : null
  add({ id: 'budget', layer: 'rules', title: '每月花销不超过', num: { key: 'budget', value: est ? r50(est * 0.9) : GOALS.budget, min: 1000, max: 50000, step: 100, unit: '元', fmt: (v) => money(v) },
    why: est ? `最近一个月大约花了 ${money(est)}，少花 10%，基本感觉不到。` : '你的花销记录还不够两周，先按这个数，记满两周后我会按真实花销重新建议。' })
  add({ id: 'floor', layer: 'rules', title: '绝不', texts: ['每天吃得少于 1,500 千卡，不靠节食', '熬过 00:30', '为了练而带伤练'],
    why: '底线是为了目标也不牺牲的东西，守住它，这局游戏才能玩得久。' })
  return out
}

// ---------- 飞镖 ----------
// 镖尖在 (0,0)，镖身朝右上方 40° 伸出；所有飞镖都从右边扔来，姿态一致
const DX = 0.766, DY = -0.643, NX = 0.643, NY = 0.766
const DS = 1.3
const P = (t, n = 0) => (DS * (t * DX + n * NX)).toFixed(2) + ',' + (DS * (t * DY + n * NY)).toFixed(2)
export function dartMarkup(color) {
  return `<g class="gl-dart-shadow"><path d="M0,0 L${(22 * 0.96).toFixed(1)},${(22 * 0.12).toFixed(1)}" stroke="rgba(31,35,40,.22)" stroke-width="3.2" stroke-linecap="round" fill="none"/></g>`
    + `<circle r="2.4" fill="rgba(31,35,40,.28)"/>`
    + `<path d="M${P(0)} L${P(5)}" stroke="#8A8F86" stroke-width="1.3" stroke-linecap="round"/>`
    + `<path d="M${P(5)} L${P(14)}" stroke="#1F2328" stroke-width="4" stroke-linecap="round"/>`
    + `<path d="M${P(6.5, -0.9)} L${P(12.5, -0.9)}" stroke="rgba(255,255,255,.45)" stroke-width="1" stroke-linecap="round"/>`
    + `<path d="M${P(14)} L${P(21)}" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`
    + `<path d="M${P(18)} L${P(24, 5.6)} L${P(28.5, 5.2)} L${P(26)} Z" fill="${color}"/>`
    + `<path d="M${P(18)} L${P(24, -5.6)} L${P(28.5, -5.2)} L${P(26)} Z" fill="${color}" opacity=".78"/>`
}

// ---------- 面板 ----------
export function GoalsPanel({ open, onClose, rootRect, suggestions, goals, onAdopt, onUndo, celebrate }) {
  const [shown, setShown] = useState(open)
  const [closing, setClosing] = useState(false)
  const [draft, setDraft] = useState({})       // 数字草稿
  const [alt, setAlt] = useState({})           // 文字建议换到第几条
  const [flip, setFlip] = useState({})
  const [hot, setHot] = useState(null)         // 悬停的层
  const [lit, setLit] = useState({})           // 刚点亮的层（闪一下）
  const [plus, setPlus] = useState([])
  const [locked, setLocked] = useState(false)
  const [fresh, setFresh] = useState({})        // 刚扔中的飞镖
  const svgRef = useRef(null), cardRefs = useRef({})

  useEffect(() => { if (open) { setShown(true); setClosing(false) } else if (shown) { setClosing(true); const t = setTimeout(() => { setShown(false); setClosing(false) }, 380); return () => clearTimeout(t) } }, [open])
  useEffect(() => { if (!open) return; const k = (e) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [open])

  const adopted = goals.adopted || {}
  const layerDone = (k) => suggestions.some((s) => s.layer === k && adopted[s.id])
  const doneCount = LAYERS.filter((l) => layerDone(l.key)).length
  const picks = (k) => suggestions.filter((s) => s.layer === k && adopted[s.id])
  const itemCount = suggestions.filter((s) => adopted[s.id]).length
  // 每采纳一项，在那一圈上钉一颗星；靶心那层钉在圆盘边上
  const pipPos = (k, i) => { const L = LAYER[k], a = (-72 + LAYERS.indexOf(L) * 55 + i * 40) * Math.PI / 180, r = k === 'daily' ? L.r - 4 : L.r; return { x: 180 + r * Math.cos(a), y: 180 + r * Math.sin(a) } }
  useEffect(() => { if (open && doneCount === LAYERS.length) setLocked(true) }, [open])

  if (!shown) return null
  const valOf = (s) => (s.num ? (draft[s.id] != null ? draft[s.id] : goals[s.num.key] != null && adopted[s.id] ? goals[s.num.key] : s.num.value) : s.texts[(alt[s.id] || 0) % s.texts.length])

  // 飞镖从卡片上扔出去，越飞越远（越小），钉在那一圈上
  const fly = (s, cardEl) => {
    const L = LAYER[s.layer], svg = svgRef.current
    if (!svg || !cardEl) return Promise.resolve()
    const sr = svg.getBoundingClientRect(), cr = cardEl.querySelector('.gl-adopt').getBoundingClientRect()
    const k = sr.width / 360, pp = pipPos(s.layer, picks(s.layer).length)
    const tx = sr.left + pp.x * k, ty = sr.top + pp.y * k
    const sx = cr.left + cr.width / 2, sy = cr.top + cr.height / 2
    const W = 56 * k, ox = 10 * k, oy = 46 * k
    const el = document.createElement('div')
    el.className = 'gl-flying'
    el.style.cssText = `left:${sx - ox}px;top:${sy - oy}px;width:${W}px;height:${W}px;transform-origin:${ox}px ${oy}px`
    el.innerHTML = `<svg viewBox="-10 -46 56 56" width="${W}" height="${W}" style="overflow:visible">${dartMarkup(L.color).replace(/<g class="gl-dart-shadow">.*?<\/g>/, '').replace(/<circle[^>]*\/>/, '')}</svg>`
    document.body.appendChild(el)
    const mx = (sx + tx) / 2, my = Math.min(sy, ty) - 90
    const anim = el.animate([
      { transform: 'translate(0,0) scale(2.6) rotate(18deg)', filter: 'drop-shadow(14px 22px 10px rgba(0,0,0,.22))', offset: 0 },
      { transform: `translate(${mx - sx}px,${my - sy}px) scale(1.7) rotate(6deg)`, filter: 'drop-shadow(8px 14px 6px rgba(0,0,0,.2))', offset: 0.5 },
      { transform: `translate(${tx - sx}px,${ty - sy}px) scale(1) rotate(0deg)`, filter: 'drop-shadow(1px 2px 1px rgba(0,0,0,.2))', offset: 1 },
    ], { duration: 560, easing: 'cubic-bezier(.5,0,.75,.4)' })
    return new Promise((res) => { anim.onfinish = () => { el.remove(); res({ x: tx - sr.left, y: ty - sr.top, tip: pp }) } })
  }
  const adopt = async (s) => {
    const v = valOf(s)
    const el = cardRefs.current[s.id]
    if (el) el.classList.add('gl-sent')
    const wasDone = layerDone(s.layer), before = doneCount
    const hit = await fly(s, el)
    setFresh((f) => ({ ...f, [s.id]: true }))
    const sv = svgRef.current; if (sv) { sv.classList.remove('gl-thud'); void sv.getBoundingClientRect(); sv.classList.add('gl-thud') }
    onAdopt(s, v)
    setLit((x) => ({ ...x, [s.layer]: Date.now() }))
    if (hit) { const p = { id: Date.now(), ...hit, color: LAYER[s.layer].color, text: wasDone ? '+1' : '点亮' }; setPlus((x) => x.concat(p)); setTimeout(() => setPlus((x) => x.filter((y) => y !== p)), 1100) }
    if (el) el.classList.remove('gl-sent')
    if (!wasDone && before + 1 === LAYERS.length) {
      setTimeout(() => {
        setLocked(true)
        const r = svgRef.current && svgRef.current.getBoundingClientRect()
        if (r && celebrate) celebrate(r.left + r.width / 2, r.top + r.height / 2, true)
      }, 450)
    }
  }
  const shuffle = (s) => {
    setFlip((f) => ({ ...f, [s.id]: (f[s.id] || 0) + 1 }))
    setTimeout(() => setAlt((a) => ({ ...a, [s.id]: (a[s.id] || 0) + 1 })), 230)
  }
  const step = (s, dir) => {
    const n = s.num, cur = valOf(s)
    const v = Math.round(Math.min(n.max, Math.max(n.min, cur + dir * n.step)) * 100) / 100
    setDraft((d) => ({ ...d, [s.id]: v }))
  }

  const box = rootRect || { left: 0, width: window.innerWidth }
  return (
    <div className={'gl-overlay' + (closing ? ' out' : '')} style={{ left: box.left, width: box.width }} role="dialog" aria-modal="true" aria-label="我的目标">
      <div className="gl-backdrop" onClick={onClose} />
      <div className="gl-sheet">
        <header className="gl-head">
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 650, letterSpacing: '-0.02em' }}>把日子当成一局游戏</h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#5E645C', lineHeight: 1.6, maxWidth: 620 }}>
              六层目标，从靶心的每天一圈圈往外。下面的建议是按你记下的数据算的，觉得合适就采纳，数字可以先调。结构参考 Dan Koe《How to fix your entire life in 1 day》。
            </p>
          </div>
          <button className="lf-icon" onClick={onClose} aria-label="关闭目标" style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F2EE', color: '#1F2328', flex: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <div className="gl-body">
          {/* 靶子 */}
          <div className="gl-target-col">
            <div className={'gl-target' + (locked ? ' locked' : '')}>
              <svg ref={svgRef} viewBox="0 0 360 360" width="100%" role="img" aria-label={'六层目标，已点亮 ' + doneCount + ' 层'}>
                {LAYERS.slice().reverse().map((L, i) => {
                  const on = layerDone(L.key), isRule = L.key === 'rules'
                  return (
                    <g key={L.key} className={'gl-ring' + (on ? ' on' : '') + (hot === L.key ? ' hot' : '')} style={{ '--c': L.color, animationDelay: (LAYERS.length - 1 - i) * 0.09 + 's' }}>
                      {L.key === 'daily' ? (
                        <circle cx="180" cy="180" r={L.r - 4} className="gl-core" fill={on ? L.color : '#F1F2EE'} />
                      ) : null}
                      <circle cx="180" cy="180" r={L.r} fill="none" pathLength="1"
                        stroke={on ? L.color : '#DADDD6'} strokeWidth={isRule ? 2.5 : 14} strokeDasharray={isRule ? '0.012 0.012' : undefined}
                        strokeOpacity={on ? (L.key === 'anti' ? 0.85 : 1) : 1} className={'gl-band' + (isRule ? ' dash' : '')} />
                      {lit[L.key] && <circle key={lit[L.key]} cx="180" cy="180" r={L.r} fill="none" stroke={L.color} strokeWidth="14" className="gl-flash" />}
                    </g>
                  )
                })}
                {plus.map((p) => (
                  <g key={'hit' + p.id} transform={`translate(${p.tip.x} ${p.tip.y})`} style={{ color: p.color }} className="gl-impact">
                    <circle r="4" fill="none" stroke="currentColor" strokeWidth="2" className="gl-ripple" />
                    {[0, 1, 2, 3, 4].map((j) => { const a = (150 + j * 32) * Math.PI / 180; return <path key={j} d={`M${(Math.cos(a) * 5).toFixed(1)},${(Math.sin(a) * 5).toFixed(1)} L${(Math.cos(a) * 9).toFixed(1)},${(Math.sin(a) * 9).toFixed(1)}`} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="gl-chip" style={{ '--dx': (Math.cos(a) * 7).toFixed(1) + 'px', '--dy': (Math.sin(a) * 7).toFixed(1) + 'px' }} /> })}
                  </g>
                ))}
                {LAYERS.map((L, li) => picks(L.key).map((s, i) => {
                  const q = pipPos(L.key, i)
                  return (
                    <g key={s.id} transform={`translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`}>
                      <g className={'gl-dart' + (fresh[s.id] === true ? ' thrown' : fresh[s.id] ? ' still' : '')} style={{ animationDelay: fresh[s.id] ? '0s' : 0.55 + li * 0.07 + i * 0.05 + 's' }}
                        onAnimationEnd={(e) => { if (e.animationName === 'gl-wobble') setFresh((f) => ({ ...f, [s.id]: 'done' })) }}
                        dangerouslySetInnerHTML={{ __html: `<title>${L.game}：${s.title}</title>` + dartMarkup(L.color) }} />
                    </g>
                  )
                }))}
                <g className="gl-core-text">
                  <text x="180" y={locked ? 186 : 182} textAnchor="middle" fontSize="15" fontWeight="700" fill={layerDone('daily') ? '#fff' : '#8A8F86'}>{locked ? '开始' : doneCount + '/6'}</text>
                  {!locked && <text x="180" y="198" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={layerDone('daily') ? 'rgba(255,255,255,.85)' : '#A3A89F'}>层点亮</text>}
                </g>
                {plus.map((p) => {
                  return <text key={p.id} x={p.tip.x + 20} y={p.tip.y - 34} textAnchor="middle" fontSize="15" fontWeight="800" fill={p.color} className="gl-plus">{p.text}</text>
                })}
              </svg>
            </div>
            <p className="gl-tally"><b>采纳 {itemCount} 项</b><i>·</i>点亮 <b>{doneCount}/6</b> 层<span>每采纳一项，就往那一圈扔一支飞镖。一圈上有了第一支，这层就点亮。</span></p>
            <ul className="gl-legend">
              {LAYERS.map((L) => (
                <li key={L.key} onMouseEnter={() => setHot(L.key)} onMouseLeave={() => setHot(null)} className={layerDone(L.key) ? 'on' : ''}>
                  <span className="gl-dot" style={{ background: layerDone(L.key) ? L.color : '#DADDD6' }} />
                  <b>{L.game}</b><span>{L.name}</span>
                  {layerDone(L.key) && <em className="gl-count" style={{ background: L.color }}>{picks(L.key).length}</em>}
                </li>
              ))}
            </ul>
            {locked && <p className="gl-locked-msg">六层都定好了。现在每一天，都是这局游戏里的一回合。</p>}
          </div>

          {/* 建议 */}
          <div className="gl-deck">
            {LAYERS.map((L) => {
              const list = suggestions.filter((s) => s.layer === L.key)
              if (!list.length) return null
              return (
                <section key={L.key} className="gl-group" onMouseEnter={() => setHot(L.key)} onMouseLeave={() => setHot(null)}>
                  <h3 className="gl-group-title"><span className="gl-tag" style={{ background: L.color }}>{L.game}</span>{L.name}</h3>
                  <div className="gl-cards">
                    {list.map((s, i) => {
                      const v = valOf(s), done = !!adopted[s.id]
                      const why = typeof s.why === 'function' ? s.why(v) : s.why
                      return (
                        <div key={s.id} ref={(n) => { cardRefs.current[s.id] = n }} className={'gl-card' + (done ? ' done' : '')} style={{ '--c': L.color, animationDelay: 0.25 + i * 0.06 + 's' }}>
                          <div key={flip[s.id] || 0} className={flip[s.id] ? 'gl-flip' : ''}>
                            <div className="gl-card-title">{s.title}</div>
                            {s.num ? (
                              <div className="gl-num-row">
                                <button className="gl-step" onClick={() => step(s, -1)} aria-label={'减少' + s.title} disabled={done}>−</button>
                                <span key={v} className="gl-num">{s.num.fmt ? s.num.fmt(v) : num(v)}<small>{s.num.fmt && s.num.unit === '元' ? '' : ' ' + s.num.unit}</small></span>
                                <button className="gl-step" onClick={() => step(s, 1)} aria-label={'增加' + s.title} disabled={done}>+</button>
                                {s.after && <span className="gl-after">{s.after(v)}</span>}
                              </div>
                            ) : (
                              <p className="gl-text">{v}</p>
                            )}
                            <p className="gl-why">{why}</p>
                          </div>
                          <div className="gl-actions">
                            {done ? (
                              <>
                                <span className="gl-adopted"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" className="lf-tick" /></svg>已采纳</span>
                                <button className="gl-link" onClick={() => onUndo(s)}>撤回</button>
                              </>
                            ) : (
                              <>
                                <button className="gl-adopt" onClick={() => adopt(s)}>采纳</button>
                                {s.texts && s.texts.length > 1 && <button className="gl-link" onClick={() => shuffle(s)}>换一个</button>}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// 顶部的入口：一个小靶子，点亮几层就填几圈
export function GoalsButton({ goals, suggestions, onClick }) {
  const adopted = goals.adopted || {}
  const done = LAYERS.filter((L) => suggestions.some((s) => s.layer === L.key && adopted[s.id])).length
  const items = suggestions.filter((s) => adopted[s.id]).length
  return (
    <button className={'gl-entry' + (done === 0 ? ' fresh' : '')} onClick={onClick} aria-label={'我的目标，采纳 ' + items + ' 项，点亮 ' + done + ' 层'}>
      <svg width="22" height="22" viewBox="0 0 36 36" aria-hidden="true">
        {LAYERS.slice(0, 5).reverse().map((L, i) => {
          const on = suggestions.some((s) => s.layer === L.key && adopted[s.id])
          const r = 4 + (4 - i) * 3.2
          return <circle key={L.key} cx="18" cy="18" r={r} fill="none" stroke={on ? L.color : 'rgba(244,245,241,.35)'} strokeWidth="2.2" />
        })}
        <circle cx="18" cy="18" r="2.4" fill={done ? '#F2994A' : 'rgba(244,245,241,.6)'} />
      </svg>
      <span>{done === 0 ? '定个目标' : '目标 ' + items + ' 项'}</span>
    </button>
  )
}

export const GOALS_CSS = `
.gl-entry{position:relative;display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px 0 10px;border-radius:19px;border:0;background:rgba(255,255,255,.08);color:#F4F5F1;font:inherit;font-size:13.5px;cursor:pointer;transition:background .2s,transform .2s}
.gl-entry:hover{background:rgba(255,255,255,.16);transform:translateY(-1px)}
.gl-entry:hover svg{animation:gl-spin 1.2s cubic-bezier(.2,.8,.2,1)}
.gl-entry.fresh::after{content:'';position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:4px;background:#F2994A;animation:lf-ping 2s ease-out infinite}
@keyframes gl-spin{to{transform:rotate(360deg)}}
.gl-overlay{position:fixed;top:0;bottom:0;z-index:50;display:flex;align-items:flex-end;justify-content:center}
.gl-backdrop{position:absolute;inset:0;background:rgba(31,35,40,.38);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:gl-fade .35s ease both}
.gl-sheet{position:relative;width:min(1240px,calc(100% - 32px));height:calc(100% - 40px);background:#F7F8F5;border-radius:32px 32px 0 0;box-shadow:0 -20px 60px rgba(31,35,40,.25);display:flex;flex-direction:column;overflow:hidden;animation:gl-up .55s cubic-bezier(.2,.9,.25,1.05) both}
.gl-overlay.out .gl-sheet{animation:gl-down .38s cubic-bezier(.4,0,.6,1) both}
.gl-overlay.out .gl-backdrop{animation:gl-fade .38s ease reverse both}
@keyframes gl-up{from{transform:translateY(100%)}to{transform:none}}
@keyframes gl-down{to{transform:translateY(100%)}}
@keyframes gl-fade{from{opacity:0}to{opacity:1}}
.gl-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding:28px 32px 18px;color:#1F2328}
.gl-body{flex:1;min-height:0;display:flex;gap:28px;padding:0 32px 32px;overflow:hidden}
.gl-target-col{flex:0 0 340px;display:flex;flex-direction:column;gap:14px;color:#1F2328}
.gl-target{width:100%;transition:transform 1s cubic-bezier(.3,1.4,.5,1)}
.gl-target svg{overflow:visible}
.gl-target.locked{transform:rotate(360deg)}
@keyframes gl-draw{0%{stroke-dasharray:1;stroke-dashoffset:1}99%{stroke-dasharray:1;stroke-dashoffset:0}100%{stroke-dasharray:none;stroke-dashoffset:0}}
@keyframes gl-fadein{from{opacity:0}to{opacity:1}}
.gl-ring .gl-band.dash{stroke-dasharray:.012 .012!important;stroke-dashoffset:0;animation:gl-fadein .6s ease both!important}
.gl-ring .gl-band{stroke-dasharray:1;stroke-dashoffset:1;animation:gl-draw .6s cubic-bezier(.4,0,.2,1) forwards;animation-delay:inherit;transition:stroke .4s,stroke-width .25s}
.gl-ring.hot .gl-band:not(.dash){stroke-width:18}
.gl-ring.hot .gl-band.dash{stroke-width:4}
.gl-ring[style] .gl-band{animation-delay:inherit}
.gl-ring .gl-core{transform-origin:180px 180px;transition:fill .4s;animation:gl-pop .5s cubic-bezier(.2,.9,.3,1.4) both}
.gl-target.locked .gl-core{animation:gl-beat 1.6s ease-in-out infinite}
@keyframes gl-pop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes gl-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.gl-flash{transform-origin:180px 180px;animation:gl-flash .7s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-flash{0%{opacity:.9;stroke-width:14}100%{opacity:0;stroke-width:34}}
.gl-plus{animation:gl-plus 1.1s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-plus{0%{opacity:0;transform:translateY(8px)}20%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-18px)}}
.gl-flying{position:fixed;z-index:60;pointer-events:none;will-change:transform}
.gl-dart{transform-box:view-box;transform-origin:0 0;animation:gl-dartin .45s cubic-bezier(.2,.9,.3,1.3) both}
.gl-dart.still{animation:none}
.gl-dart.thrown{animation:gl-wobble .9s linear both}
@keyframes gl-dartin{from{opacity:0;transform:scale(1.4) rotate(10deg)}to{opacity:1;transform:none}}
@keyframes gl-wobble{0%{transform:scale(1.08) rotate(0)}8%{transform:scale(.9,1.04) rotate(-11deg)}22%{transform:rotate(8deg)}36%{transform:rotate(-5deg)}50%{transform:rotate(3deg)}64%{transform:rotate(-1.6deg)}80%{transform:rotate(.6deg)}100%{transform:none}}
.gl-dart .gl-dart-shadow{transition:opacity .3s}
.gl-dart:hover{filter:brightness(1.15)}
.gl-thud{animation:gl-thud .32s cubic-bezier(.3,.7,.4,1)}
@keyframes gl-thud{0%{transform:none}25%{transform:translate(-2.5px,1.5px) scale(.992)}60%{transform:translate(1px,-.5px)}100%{transform:none}}
.gl-ripple{animation:gl-ripple .6s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-ripple{from{opacity:.9;transform:scale(.6)}to{opacity:0;transform:scale(4.2)}}
.gl-impact .gl-ripple,.gl-impact .gl-chip{transform-box:view-box;transform-origin:0 0}
.gl-chip{animation:gl-chip .5s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-chip{from{opacity:1;transform:none}to{opacity:0;transform:translate(var(--dx),var(--dy))}}
.gl-orb{position:fixed;z-index:60;width:26px;height:26px;border-radius:50%;pointer-events:none;box-shadow:0 0 0 6px rgba(255,255,255,.6),0 8px 24px rgba(0,0,0,.25)}
.gl-pip{animation:gl-pippop .5s cubic-bezier(.2,.9,.3,1.6) both}
@keyframes gl-pippop{0%{transform:scale(0) rotate(-120deg)}60%{transform:scale(1.6) rotate(20deg)}100%{transform:scale(1) rotate(0)}}
.gl-target:not(.locked) .gl-pip:hover{transform:scale(1.3)}
.gl-count{margin-left:auto;font-style:normal;font-size:11px;font-weight:700;color:#fff;min-width:18px;height:18px;padding:0 5px;border-radius:9px;display:inline-grid;place-items:center;box-sizing:border-box}
.gl-legend li{white-space:nowrap}
.gl-tally{margin:4px 0 12px;font-size:13.5px;color:#3A3F38;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 6px}
.gl-tally b{font-weight:650}.gl-tally i{font-style:normal;color:#A3A89F}
.gl-tally span{flex-basis:100%;font-size:12px;color:#8A8F86;line-height:1.5}
.gl-legend{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}
.gl-legend li{display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 10px;border-radius:10px;transition:background .2s}
.gl-legend li:hover{background:#ECEEE9}
.gl-legend b{font-weight:600}.gl-legend span:not(.gl-dot){color:#6F756D}
.gl-dot{width:9px;height:9px;border-radius:5px;flex:none;transition:background .4s}
.gl-locked-msg{margin:4px 0 0;font-size:14px;line-height:1.6;color:#1E6E4C;animation:lf-rise .5s .3s both}
.gl-deck{flex:1;min-width:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 6px 40px 2px;display:flex;flex-direction:column;gap:26px;color:#1F2328}
.gl-group-title{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-size:15px;font-weight:600}
.gl-tag{color:#fff;font-size:12px;font-weight:600;padding:3px 10px;border-radius:12px}
.gl-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.gl-card{position:relative;background:#fff;border-radius:22px;padding:18px 18px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;box-shadow:0 1px 0 rgba(31,35,40,.04);transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,opacity .3s;animation:lf-rise .5s cubic-bezier(.2,.8,.2,1) both;perspective:800px}
.gl-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px -12px rgba(31,35,40,.25)}
.gl-card::before{content:'';position:absolute;left:0;top:18px;bottom:18px;width:0;border-radius:0 3px 3px 0;background:var(--c);transition:width .3s}
.gl-card.done{background:color-mix(in srgb,var(--c) 7%,#fff)}
.gl-card.done::before{width:4px}
.gl-card.gl-sent{transform:scale(.96);opacity:.7}
.gl-flip{animation:gl-flip .46s cubic-bezier(.4,0,.2,1)}
@keyframes gl-flip{0%{transform:rotateY(0)}49%{transform:rotateY(90deg);opacity:.2}51%{transform:rotateY(-90deg);opacity:.2}100%{transform:rotateY(0)}}
.gl-card-title{font-size:13px;color:#6F756D;margin-bottom:6px}
.gl-num-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.gl-num{font-size:30px;font-weight:600;letter-spacing:-0.03em;font-variant-numeric:tabular-nums;animation:gl-tick .25s cubic-bezier(.2,.9,.3,1.4)}
.gl-num small{font-size:13px;font-weight:400;color:#6F756D;letter-spacing:0}
@keyframes gl-tick{from{transform:translateY(-6px);opacity:.4}to{transform:none;opacity:1}}
.gl-step{width:30px;height:30px;border-radius:15px;border:0;background:#F1F2EE;color:#1F2328;font-size:17px;line-height:1;cursor:pointer;transition:background .2s,transform .15s}
.gl-step:hover:not(:disabled){background:color-mix(in srgb,var(--c) 18%,#fff)}
.gl-step:active:not(:disabled){transform:scale(.88)}
.gl-step:disabled{opacity:.35;cursor:default}
.gl-after{font-size:12.5px;padding:3px 9px;border-radius:10px;background:color-mix(in srgb,var(--c) 12%,#fff);color:color-mix(in srgb,var(--c) 60%,#1F2328)}
.gl-text{margin:0;font-size:16px;line-height:1.55;font-weight:500}
.gl-why{margin:8px 0 0;font-size:13px;line-height:1.6;color:#5E645C}
.gl-actions{display:flex;align-items:center;gap:10px}
.lf-root .gl-adopt,.gl-adopt{height:34px;padding:0 16px;border-radius:17px;border:0;background:var(--c);color:#fff;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:transform .15s,filter .2s}
.gl-adopt:hover{filter:brightness(1.08);transform:translateY(-1px)}
.gl-adopt:active{transform:scale(.94)}
.gl-link{border:0;background:transparent;color:#5E645C;font:inherit;font-size:13px;cursor:pointer;padding:6px 4px}
.gl-link:hover{color:#1F2328;text-decoration:underline}
.gl-adopted{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:color-mix(in srgb,var(--c) 70%,#1F2328)}
.lf-vision{display:inline-flex;align-items:center;gap:8px;margin-top:10px;font-size:14px;color:rgba(244,245,241,.85);animation:lf-rise .6s both}
.lf-vision i{width:6px;height:6px;border-radius:3px;background:#B9A6F5;box-shadow:0 0 0 4px rgba(124,92,224,.25)}
@media (max-width:900px){.gl-body{flex-direction:column;overflow-y:auto}.gl-target-col{flex:none;max-width:360px;align-self:center}.gl-deck{overflow:visible}}
@media (prefers-reduced-motion:reduce){.gl-sheet,.gl-card,.gl-ring .gl-band,.gl-target{animation:none!important;transition:none!important}.gl-ring .gl-band{stroke-dashoffset:0}}
`
