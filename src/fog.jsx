// 体重卡上的一层「起雾的玻璃」：默认看不清，用鼠标来回擦几下才露出来
// - 擦过的地方透明，雾气边缘是软的；擦开四成左右，剩下的雾自己散掉
// - 鼠标离开卡片一会儿（12 秒），雾气慢慢重新起来
// - 正面背面共用一个状态：擦开了才看得到，翻到背面也一样
import React, { useEffect, useRef, useState } from 'react'

const store = { revealed: false, subs: new Set(), timer: 0 }
const setRevealed = (v) => { store.revealed = v; store.subs.forEach((f) => f(v)) }
const REFOG_MS = 12000

export function WeightFog({ label = '擦一擦玻璃，看看体重' }) {
  const cv = useRef(null), wrap = useRef(null), anchor = useRef(null)
  const [revealed, setR] = useState(store.revealed)
  const [clearing, setClearing] = useState(false)
  useEffect(() => { const f = (v) => { setR(v); if (!v) setClearing(false) }; store.subs.add(f); return () => store.subs.delete(f) }, [])

  // 鼠标离开卡片后计时，回来就取消
  useEffect(() => {
    const card = anchor.current && anchor.current.closest('.lf-card'); if (!card) return
    const leave = () => { clearTimeout(store.timer); if (store.revealed) store.timer = setTimeout(() => setRevealed(false), REFOG_MS) }
    const enter = () => clearTimeout(store.timer)
    card.addEventListener('pointerleave', leave); card.addEventListener('pointerenter', enter)
    return () => { card.removeEventListener('pointerleave', leave); card.removeEventListener('pointerenter', enter) }
  }, [])

  useEffect(() => {
    if (revealed) return
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d')
    let w = 0, h = 0, dpr = 1, last = null, strokes = 0
    const paint = () => {
      dpr = window.devicePixelRatio || 1
      w = c.clientWidth; h = c.clientHeight
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      // 雾：带一点冷色的磨砂白
      const g = ctx.createLinearGradient(0, 0, w, h)
      const dk = document.body.hasAttribute('data-ds-dark-theme')
      g.addColorStop(0, dk ? 'rgb(52,57,60)' : 'rgb(234,239,237)'); g.addColorStop(1, dk ? 'rgb(42,46,49)' : 'rgb(224,231,229)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 细密的颗粒
      let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280
      for (let i = 0; i < (w * h) / 55; i++) { ctx.fillStyle = `rgba(255,255,255,${(dk ? 0.06 : 0.25) + r() * (dk ? 0.12 : 0.5)})`; ctx.fillRect(r() * w, r() * h, 1.2, 1.2) }
      // 水珠
      for (let i = 0; i < 26; i++) {
        const x = r() * w, y = r() * h, rr = 1.5 + r() * 3.5
        const dg = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.3, 0, x, y, rr)
        dg.addColorStop(0, dk ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.95)'); dg.addColorStop(0.7, dk ? 'rgba(120,130,130,.35)' : 'rgba(210,220,218,.6)'); dg.addColorStop(1, dk ? 'rgba(90,100,100,.15)' : 'rgba(180,195,192,.25)')
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill()
      }
    }
    paint()
    const ro = new ResizeObserver(() => { if (!store.revealed) paint() }); ro.observe(c)
    const brush = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out'
      const g = ctx.createRadialGradient(x, y, 0, x, y, 30)
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill()
    }
    const cleared = () => {
      // 抽样看擦开了多少
      const data = ctx.getImageData(0, 0, c.width, c.height).data
      let clear = 0, n = 0
      const step = Math.max(4, Math.floor(c.width / 40)) * 4
      for (let i = 3; i < data.length; i += step) { n++; if (data[i] < 90) clear++ }
      return clear / n
    }
    const move = (e) => {
      const rc = c.getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top
      if (last) {
        const d = Math.hypot(x - last.x, y - last.y), k = Math.max(1, Math.ceil(d / 8))
        for (let i = 1; i <= k; i++) brush(last.x + ((x - last.x) * i) / k, last.y + ((y - last.y) * i) / k)
      } else brush(x, y)
      last = { x, y }
      if (++strokes % 12 === 0 && cleared() > 0.42) { setClearing(true); setTimeout(() => setRevealed(true), 520) }
    }
    const up = () => { last = null }
    c.addEventListener('pointermove', move); c.addEventListener('pointerleave', up)
    return () => { ro.disconnect(); c.removeEventListener('pointermove', move); c.removeEventListener('pointerleave', up) }
  }, [revealed])

  if (revealed) return <span ref={anchor} hidden />
  return (
    <div ref={(n) => { wrap.current = n; anchor.current = n }} className={'lf-fog' + (clearing ? ' clearing' : '')} onClick={(e) => e.stopPropagation()} aria-label="体重已隐藏，用鼠标擦一擦就能看到">
      <canvas ref={cv} />
      <span className="lf-fog-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" /><path d="M11 11.5V4a1.5 1.5 0 0 1 3 0v7.5" /><path d="M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L3 15.2a1.5 1.5 0 0 1 2.2-2l2.8 2.3" /></svg>
        {label}
      </span>
    </div>
  )
}

// 别处出现的体重：先模糊，鼠标停上去才清楚
export function Private({ children }) { return <span className="lf-private">{children}</span> }

export const FOG_CSS = `
.lf-fog{position:absolute;inset:0;z-index:2;border-radius:inherit;overflow:hidden;cursor:grab;transition:opacity .5s ease;animation:lf-fogin .7s ease both}
.lf-fog canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.lf-fog.clearing{opacity:0}
@keyframes lf-fogin{from{opacity:0}to{opacity:1}}
.lf-fog-hint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:18px;background:rgba(255,255,255,.7);color:#4B5550;font-size:12.5px;font-weight:600;white-space:nowrap;pointer-events:none;box-shadow:0 4px 14px -6px rgba(31,35,40,.25);transition:opacity .3s}
.lf-fog-hint svg{animation:lf-wipe 1.6s ease-in-out infinite}
@keyframes lf-wipe{0%,100%{transform:translateX(-4px) rotate(-8deg)}50%{transform:translateX(4px) rotate(8deg)}}
.lf-fog:hover .lf-fog-hint{opacity:.35}
.lf-private{filter:blur(4.5px);transition:filter .25s;cursor:default}
.lf-private:hover{filter:none}
@media (prefers-reduced-motion:reduce){.lf-fog-hint svg{animation:none}}
`
