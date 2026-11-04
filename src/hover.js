// 卡片悬停的手感：像挂在一根线上的工牌
// - 鼠标靠近：卡片被轻轻托起，朝鼠标方向微微倾斜，阴影跟着变深、偏移
// - 鼠标带着速度扫进来/离开：卡片绕顶边荡一下，再慢慢停住（低阻尼的钟摆）
// - 同一行的邻居共用"一根线"，会跟着轻轻晃一点
// - 光斑跟着鼠标走
// 用一个 rAF 循环驱动所有在动的卡片，停稳后清掉内联样式，不打扰拖拽和其它动画。

const S = new Map()
let raf = 0
let gx = 0, gt = 0, gvx = 0
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v, a) => Math.max(-a, Math.min(a, v))

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    const t = performance.now(), dt = Math.max(8, t - gt)
    gvx = gvx * 0.5 + ((e.clientX - gx) / dt) * 0.5
    gx = e.clientX; gt = t
  }, { passive: true })
}

function state(el) {
  let s = S.get(el)
  if (!s) { s = { rx: 0, ry: 0, vx: 0, vy: 0, rz: 0, vz: 0, l: 0, vl: 0, trx: 0, tryy: 0, tl: 0, hover: false, k: 1 }; S.set(el, s) }
  return s
}

function settle(el) {
  el.style.transform = ''
  el.style.transformOrigin = ''
  el.style.removeProperty('--lift')
  el.style.removeProperty('--sheen')
  el.classList.remove('lf-hov')
  S.delete(el)
}

function tick() {
  raf = 0
  let busy = false
  S.forEach((s, el) => {
    if (!el.isConnected) { S.delete(el); return }
    s.vx = (s.vx + (s.trx - s.rx) * 0.11) * 0.76; s.rx += s.vx
    s.vy = (s.vy + (s.tryy - s.ry) * 0.11) * 0.76; s.ry += s.vy
    s.vl = (s.vl + (s.tl - s.l) * 0.13) * 0.72; s.l += s.vl
    s.vz = (s.vz - s.rz * 0.055) * 0.935; s.rz += s.vz            // 钟摆：回复力小、阻尼低，多荡几下
    const still = !s.hover && Math.abs(s.rx) + Math.abs(s.ry) + Math.abs(s.rz) + Math.abs(s.l) < 0.02 &&
      Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vz) + Math.abs(s.vl) < 0.02
    if (still) { settle(el); return }
    busy = true
    const l = Math.max(0, s.l), k = s.k
    el.style.transform = `perspective(1100px) translateY(${(-5 * l).toFixed(2)}px) rotateX(${(s.rx * k).toFixed(2)}deg) rotateY(${(s.ry * k).toFixed(2)}deg) rotateZ(${(s.rz * k).toFixed(2)}deg) scale(${(1 + 0.01 * l).toFixed(4)})`
    el.style.setProperty('--lift', `${(-s.ry * 1.6 - s.rz * 2).toFixed(1)}px ${(8 + 16 * l).toFixed(1)}px ${(18 + 30 * l).toFixed(1)}px -12px rgba(31,35,40,${(0.3 * l).toFixed(3)})`)
    el.style.setProperty('--sheen', l.toFixed(3))
  })
  if (busy) raf = requestAnimationFrame(tick)
}
const run = () => { if (!raf) raf = requestAnimationFrame(tick) }

function blocked(el) {
  return !!document.querySelector('.lf-lifted') || (el.closest('.lf-root') || document.body).classList.contains('lf-scrolling') || document.body.classList.contains('lf-dragging')
}

// 同一行的卡片共用一根线：一张荡起来，邻居跟着晃一点
function nudgeNeighbors(el, impulse) {
  const grid = el.parentElement; if (!grid) return
  const r = el.getBoundingClientRect()
  for (const n of grid.children) {
    if (n === el || !n.classList || !n.classList.contains('lf-card')) continue
    const q = n.getBoundingClientRect()
    if (Math.abs(q.top - r.top) > 24) continue
    const d = Math.abs((q.left + q.width / 2) - (r.left + r.width / 2))
    const s = state(n)
    s.k = Math.max(0.25, Math.min(1, 420 / Math.max(1, n.offsetWidth)))
    n.style.transformOrigin = '50% -14px'
    n.classList.add('lf-hov')
    s.vz += impulse * 0.32 * Math.exp(-d / 520)
  }
}

export function bindHover(el) {
  if (!el || reduced()) return () => {}
  const enter = () => {
    if (blocked(el)) return
    const s = state(el)
    s.k = Math.max(0.25, Math.min(1, 420 / Math.max(1, el.offsetWidth)))   // 大卡片荡得小一点
    s.hover = true; s.tl = 1
    el.style.transformOrigin = '50% -14px'
    el.classList.add('lf-hov')
    const imp = clamp(gvx * 0.55, 1.1)
    s.vz += imp
    if (Math.abs(imp) > 0.25) nudgeNeighbors(el, imp)
    run()
  }
  const move = (e) => {
    if (blocked(el)) { const s = S.get(el); if (s) { s.hover = false; s.tl = 0; s.trx = s.tryy = 0 } return }
    const s = S.get(el); if (!s || !s.hover) return enter()
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
    s.trx = clamp((0.5 - py) * 4.5, 3)
    s.tryy = clamp((px - 0.5) * 5, 3)
    s.vz += clamp(gvx * 0.02, 0.08)
    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%')
    el.style.setProperty('--my', (py * 100).toFixed(1) + '%')
    run()
  }
  const leave = () => {
    const s = S.get(el); if (!s) return
    s.hover = false; s.tl = 0; s.trx = 0; s.tryy = 0
    const imp = clamp(gvx * 0.4, 0.9)
    s.vz += imp
    run()
  }
  const down = (e) => {
    // 抓手/缩放：立刻放平，交给拖拽
    if (e.target.closest && e.target.closest('.lf-grip,.lf-resize')) settle(el)
  }
  el.addEventListener('pointerenter', enter)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerleave', leave)
  el.addEventListener('pointerdown', down, true)
  return () => {
    el.removeEventListener('pointerenter', enter)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerleave', leave)
    el.removeEventListener('pointerdown', down, true)
    settle(el)
  }
}
