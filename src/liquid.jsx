// 「今天还能吃」的液体管：吃下去的热量像一管橙色的汽水
// - 液面前沿是一道会动的水波，里面有气泡慢慢往上冒、到顶就破
// - 鼠标在管子上"试吃"：一段更浅的液体从已吃的位置流到鼠标处，
//   前沿用弹簧追鼠标，快速移动时会晃、会往前倾，还会冒出一串气泡
// - 超过额度的那段变成红色
// - 新记了一顿：液面从原来的位置涨上去，冒一阵泡
import React, { useEffect, useRef } from 'react'

const TUBE_H = 20, PAD_T = 5, H = TUBE_H + PAD_T * 2

export function LiquidBar({ eaten, goal, burned, cap, meals, preview, pour }) {
  const cv = useRef(null)
  const live = useRef({})
  live.current = { eaten, goal, burned, cap, meals, preview }
  const sim = useRef({ fe: null, ve: 0, fp: null, vp: 0, bubbles: [], t: 0, w: 0, hot: 0 })

  // 新记了一顿：冒一阵泡
  useEffect(() => { if (pour) { const s = sim.current; s.burst = 16; s.hot = 2 } }, [pour])

  useEffect(() => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d')
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, visible = true, lastT = performance.now()
    const resize = () => {
      const dpr = window.devicePixelRatio || 1, w = c.parentElement.clientWidth
      sim.current.w = w
      c.width = Math.round(w * dpr); c.height = Math.round(H * dpr)
      c.style.width = w + 'px'; c.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(c.parentElement)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame) })
    io.observe(c)

    const tube = (w) => {
      const r = TUBE_H / 2, y = PAD_T
      ctx.beginPath()
      ctx.moveTo(r, y); ctx.lineTo(w - r, y); ctx.arc(w - r, y + r, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(r, y + TUBE_H); ctx.arc(r, y + r, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath()
    }
    // 一段液体：左边平，右边是一道竖着的水波；lean 让前沿上下错开（往前倾）
    const liquid = (x0, x1, amp, phase, lean) => {
      const y0 = PAD_T, y1 = PAD_T + TUBE_H
      ctx.beginPath(); ctx.moveTo(x0, y0)
      const steps = 10
      for (let i = 0; i <= steps; i++) {
        const y = y0 + (TUBE_H * i) / steps, u = (y - y0) / TUBE_H - 0.5
        ctx.lineTo(x1 + Math.sin(i * 0.9 + phase) * amp - u * lean, y)
      }
      ctx.lineTo(x0, y1); ctx.closePath()
    }

    function frame(now) {
      raf = 0
      const dt = Math.min(48, now - lastT) / 16.67; lastT = now
      const L = live.current, s = sim.current, w = s.w
      if (!w) { raf = requestAnimationFrame(frame); return }
      const X = (v) => Math.max(0, Math.min(w, (v / L.cap) * w))
      const xe = X(L.eaten), xg = X(L.goal), xb = X(L.goal + L.burned)
      if (s.fe == null) { s.fe = reduce ? xe : 0; s.fp = xe }
      // 已吃的液面：弹簧涨上去
      s.ve = (s.ve + (xe - s.fe) * 0.08 * dt) * Math.pow(0.8, dt); s.fe += s.ve * dt
      // 试吃的液面：追鼠标，阻尼小一点，会晃
      const tp = L.preview != null ? Math.max(s.fe, X(L.preview)) : s.fe
      const prevFp = s.fp
      s.vp = (s.vp + (tp - s.fp) * 0.16 * dt) * Math.pow(0.74, dt); s.fp += s.vp * dt
      const speed = Math.abs(s.fp - prevFp)
      s.t += 0.06 * dt
      if (L.preview != null && speed > 0.6) s.hot = Math.min(2, s.hot + speed * 0.02)
      s.hot = Math.max(0, s.hot - 0.012 * dt)

      // 气泡：已吃的部分慢慢冒，试吃的前沿附近移动时冒得多
      const B = s.bubbles
      if (!reduce) {
        if (s.fe > 12 && Math.random() < 0.05 * dt * Math.min(1, s.fe / 120)) B.push({ x: 6 + Math.random() * (s.fe - 10), y: PAD_T + TUBE_H - 2, r: 1 + Math.random() * 1.8, vy: 0.12 + Math.random() * 0.18, ph: Math.random() * 6, kind: 0 })
        if (s.fp - s.fe > 6 && Math.random() < (0.04 + s.hot * 0.25) * dt) B.push({ x: s.fp - 2 - Math.random() * Math.min(40, s.fp - s.fe), y: PAD_T + TUBE_H - 2, r: 0.9 + Math.random() * 2.1, vy: 0.2 + Math.random() * 0.35, ph: Math.random() * 6, kind: 1 })
        if (s.burst) { for (let i = 0; i < s.burst; i++) B.push({ x: Math.random() * Math.max(10, s.fe), y: PAD_T + 4 + Math.random() * (TUBE_H - 6), r: 0.8 + Math.random() * 1.8, vy: 0.25 + Math.random() * 0.4, ph: Math.random() * 6, kind: 0 }); s.burst = 0 }
      }
      for (let i = B.length - 1; i >= 0; i--) {
        const b = B[i]; b.y -= b.vy * dt; b.ph += 0.1 * dt; b.x += Math.sin(b.ph) * 0.15 * dt
        const limit = b.kind ? s.fp : s.fe
        if (b.y < PAD_T + b.r + 0.5 || b.x > limit - 1) { if (b.y < PAD_T + b.r + 0.5) b.pop = 1; if (!b.pop || b.pop > 6) { B.splice(i, 1); continue } }
        if (b.pop) b.pop += dt
      }
      if (B.length > 60) B.splice(0, B.length - 60)

      // ---- 画 ----
      ctx.clearRect(0, 0, w, H)
      ctx.save(); tube(w); ctx.clip()
      const dk = document.body.hasAttribute('data-ds-dark-theme')
      ctx.fillStyle = dk ? '#25282C' : '#F1F2EE'; ctx.fillRect(0, 0, w, H)
      ctx.fillStyle = dk ? '#2E3136' : '#E6E8E2'; ctx.fillRect(0, 0, xg, H)
      if (L.burned > 0) {  // 练出来的额度：绿色斜纹
        ctx.save(); ctx.beginPath(); ctx.rect(xg, 0, xb - xg, H); ctx.clip()
        ctx.fillStyle = dk ? '#1C3A2E' : '#DDF2E8'; ctx.fillRect(xg, 0, xb - xg, H)
        ctx.strokeStyle = dk ? '#24503D' : '#BFE6D3'; ctx.lineWidth = 3
        for (let x = xg - H; x < xb + H; x += 8) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.stroke() }
        ctx.restore()
      }
      const lean = Math.max(-6, Math.min(6, s.vp * 0.9))
      // 试吃
      if (s.fp - s.fe > 0.5) {
        const over = s.fp > xb
        const g = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + TUBE_H)
        g.addColorStop(0, 'rgba(242,153,74,.3)'); g.addColorStop(1, 'rgba(242,153,74,.55)')
        ctx.fillStyle = g
        liquid(Math.max(0, s.fe - 4), s.fp, 1.2 + Math.min(2.5, speed * 0.25) + s.hot * 0.6, s.t * 2.2, lean); ctx.fill()
        if (over) {  // 超出额度的那段再加深一点
          ctx.save(); ctx.beginPath(); ctx.rect(xb, 0, w, H); ctx.clip()
          ctx.fillStyle = 'rgba(229,72,77,.55)'; liquid(Math.max(0, s.fe - 4), s.fp, 1.2, s.t * 2.2, lean); ctx.fill(); ctx.restore()
        }
      }
      // 已吃
      if (s.fe > 0.5) {
        const g = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + TUBE_H)
        g.addColorStop(0, '#F8B26E'); g.addColorStop(1, '#EE8A35')
        ctx.fillStyle = g
        liquid(0, s.fe, 1.1 + Math.min(2, Math.abs(s.ve) * 0.3), s.t, Math.max(-4, Math.min(4, s.ve * 0.8))); ctx.fill()
        // 每一顿之间一道淡淡的分隔
        let acc = 0
        ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1
        L.meals.slice(0, -1).forEach((m) => { acc += m.kcal; const x = X(acc); if (x < s.fe - 3) { ctx.beginPath(); ctx.moveTo(x, PAD_T + 3); ctx.lineTo(x, PAD_T + TUBE_H - 3); ctx.stroke() } })
      }
      // 气泡
      B.forEach((b) => {
        const a = b.pop ? Math.max(0, 1 - b.pop / 6) : 0.85
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (b.pop ? 1 + b.pop * 0.25 : 1), 0, Math.PI * 2)
        if (b.pop) { ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 0.8; ctx.stroke() }
        else { ctx.fillStyle = `rgba(255,255,255,${b.kind ? 0.75 : 0.55})`; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2); ctx.fill() }
      })
      // 玻璃高光
      ctx.fillStyle = 'rgba(255,255,255,.38)'
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(6, PAD_T + 2.5, w - 12, 2.5, 1.25) : ctx.rect(6, PAD_T + 2.5, w - 12, 2.5); ctx.fill()
      ctx.restore()
      // 目标线
      ctx.fillStyle = dk ? '#E8E9E5' : '#1F2328'; ctx.fillRect(Math.round(xb) - 1, 1, 2, H - 2)

      const busy = !reduce && visible && (L.preview != null || B.length > 0 || Math.abs(s.ve) + Math.abs(s.vp) > 0.02 || Math.abs(xe - s.fe) > 0.3 || true)
      if (busy) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])

  return <canvas ref={cv} style={{ display: 'block', width: '100%', height: H }} aria-hidden="true" />
}
export const LIQUID_H = H
