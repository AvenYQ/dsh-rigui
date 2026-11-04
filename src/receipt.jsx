// 「这个月还能花」的小票打印机
// 点打印：卡片底边裂开一道出纸口，一张热敏小票一格一格地吐出来；
// 可以切今天 / 本周 / 本月，切换时旧的那张被撕下来飘走，再打新的；
// 「保存」把小票存成 PNG（支持选文件夹就弹保存框，不支持就存到「下载」）。
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

const W = 272, PAD = 18
const MONO = '"SF Mono", ui-monospace, Menlo, "PingFang SC", "Microsoft YaHei", monospace'
const SANS = '"Bricolage Grotesque", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
const DAY = 86400000
const pad2 = (n) => String(n).padStart(2, '0')
const yuan = (n) => '¥' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
const WEEK = '日一二三四五六'
const sod = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }

export function receiptData(records, S, period) {
  const today = S.today, d = new Date(today)
  let from, label, fmt
  if (period === 'week') { from = today - ((d.getDay() + 6) % 7) * DAY; const a = new Date(from); label = (a.getMonth() + 1) + '月' + a.getDate() + '日 – ' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; fmt = (t) => '周' + WEEK[new Date(t).getDay()] }
  else if (period === 'month') { from = new Date(d.getFullYear(), d.getMonth(), 1).getTime(); label = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月'; fmt = (t) => { const x = new Date(t); return pad2(x.getMonth() + 1) + '/' + pad2(x.getDate()) } }
  else { from = today; label = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + WEEK[d.getDay()]; fmt = (t) => { const x = new Date(t); return pad2(x.getHours()) + ':' + pad2(x.getMinutes()) } }
  const rows = records.filter((r) => r.type === 'expense' && r.t >= from && r.t < today + DAY).sort((a, b) => a.t - b.t)
    .map((r) => ({ when: fmt(r.t), title: r.title || r.cat || '花销', cat: r.cat || '', amount: r.amount }))
  const total = rows.reduce((a, r) => a + r.amount, 0)
  const no = String(Math.abs(Math.round(total * 100) + today / 1000) % 1e8).padStart(8, '0')
  return { period, label, rows, total, no, printed: Date.now(), budget: S.spent + S.remaining, spent: S.spent, remaining: S.remaining, perDay: S.perDay }
}

// 量高度 + 画小票（屏幕上和保存的 PNG 是同一张）
function layout(data) {
  const shown = data.rows.slice(0, 16)
  const h = 150 + 22 + Math.max(1, shown.length) * 21 + (data.rows.length > shown.length ? 20 : 0) + 64 + 92 + 70 + 40
  return { shown, h }
}
export function drawReceipt(canvas, data, scale = 2) {
  // 先在草稿上画一遍量出真实高度，再按这个高度画，纸不会多出一截空白
  const probe = document.createElement('canvas')
  const end = paintReceipt(probe, data, 1, layout(data).h + 200)
  const h = Math.ceil(end + 26)
  paintReceipt(canvas, data, scale, h)
  return h
}
function paintReceipt(canvas, data, scale, h) {
  const { shown } = layout(data)
  canvas.width = W * scale; canvas.height = h * scale
  const c = canvas.getContext('2d')
  c.setTransform(scale, 0, 0, scale, 0, 0)
  // 纸：微微发黄的热敏纸，底边锯齿
  c.fillStyle = '#FCFBF6'
  c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, h - 7)
  for (let x = W; x > 0; x -= 8) { c.lineTo(x - 4, h); c.lineTo(x - 8, h - 7) }
  c.closePath(); c.fill()
  // 一点纸纹
  let s = 3; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280
  for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(120,110,80,${0.03 + r() * 0.04})`; c.fillRect(r() * W, r() * h, 1, 1) }
  const ink = '#24211C', soft = '#8C877C'
  let y = 30
  const center = (t, font, color = ink) => { c.font = font; c.fillStyle = color; c.textAlign = 'center'; c.fillText(t, W / 2, y) }
  const lr = (l, rgt, font, color = ink) => { c.font = font; c.fillStyle = color; c.textAlign = 'left'; c.fillText(l, PAD, y); c.textAlign = 'right'; c.fillText(rgt, W - PAD, y) }
  const dash = () => { c.strokeStyle = '#C9C4B8'; c.setLineDash([3, 3]); c.lineWidth = 1; c.beginPath(); c.moveTo(PAD, y); c.lineTo(W - PAD, y); c.stroke(); c.setLineDash([]) }
  center('· 日 晷 ·', `700 20px ${SANS}`); y += 18
  center('RIGUI  消费小票', `500 10px ${MONO}`, soft); y += 22
  dash(); y += 20
  lr('日期', data.label, `12px ${MONO}`); y += 18
  const pt = new Date(data.printed)
  lr('打印', pad2(pt.getHours()) + ':' + pad2(pt.getMinutes()) + '   No.' + data.no, `12px ${MONO}`, soft); y += 16
  dash(); y += 20
  c.font = `600 11px ${MONO}`; c.fillStyle = soft
  c.textAlign = 'left'; c.fillText(data.period === 'day' ? '时间' : '日期', PAD, y); c.fillText('项目', PAD + 56, y); c.textAlign = 'right'; c.fillText('金额', W - PAD, y); y += 22
  if (!shown.length) { center('这段时间一分没花', `12px ${MONO}`, soft); y += 21 }
  shown.forEach((row) => {
    c.font = `12px ${MONO}`; c.fillStyle = soft; c.textAlign = 'left'; c.fillText(row.when, PAD, y)
    c.fillStyle = ink; let t = row.title; const maxW = W - PAD * 2 - 56 - 70
    c.font = `13px ${SANS}`; while (c.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1)
    if (t !== row.title) t = t.slice(0, -1) + '…'
    c.fillText(t, PAD + 56, y)
    c.font = `13px ${MONO}`; c.textAlign = 'right'; c.fillText(yuan(row.amount), W - PAD, y); y += 21
  })
  if (data.rows.length > shown.length) { center('… 还有 ' + (data.rows.length - shown.length) + ' 笔', `11px ${MONO}`, soft); y += 20 }
  y += 2; dash(); y += 30
  lr('合计 ' + data.rows.length + ' 笔', '', `600 13px ${MONO}`)
  c.font = `700 24px ${MONO}`; c.textAlign = 'right'; c.fillText(yuan(data.total), W - PAD, y + 2); y += 26
  dash(); y += 22
  lr('本月预算', yuan(data.budget), `12px ${MONO}`, soft); y += 18
  lr('本月已花', yuan(data.spent), `12px ${MONO}`, soft); y += 18
  lr(data.remaining < 0 ? '已超支' : '还能花', yuan(Math.abs(data.remaining)), `600 12px ${MONO}`); y += 18
  lr('每天可花', yuan(data.perDay), `12px ${MONO}`, soft); y += 20
  // 条码：按单号生成
  let bx = PAD + 14, k = 0
  const seed = data.no + data.label
  while (bx < W - PAD - 14) { const v = seed.charCodeAt(k++ % seed.length) + k * 7; const bw = 1 + (v % 3); if (k % 2) { c.fillStyle = ink; c.fillRect(bx, y, bw, 38) } bx += bw + (v % 2) + 0.6 }
  y += 52
  center('— 谢谢惠顾自己 —', `11px ${MONO}`, soft)
  return y
}

// ---------- 保存位置：每次问 / 固定文件夹 / 下载 ----------
const PREF_KEY = 'dsh-rigui:receipt-save'
const canPickFile = () => typeof window !== 'undefined' && !!window.showSaveFilePicker
const canPickDir = () => typeof window !== 'undefined' && !!window.showDirectoryPicker
const loadPref = () => { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {} } catch (e) { return {} } }
const savePref = (p) => { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)) } catch (e) {} }
function idb() { return new Promise((res, rej) => { const r = indexedDB.open('dsh-rigui', 1); r.onupgradeneeded = () => r.result.createObjectStore('handles'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) }) }
async function getDir() { try { const db = await idb(); return await new Promise((res) => { const q = db.transaction('handles').objectStore('handles').get('receiptDir'); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null) }) } catch (e) { return null } }
async function putDir(h) { try { const db = await idb(); await new Promise((res) => { const t = db.transaction('handles', 'readwrite'); t.objectStore('handles').put(h, 'receiptDir'); t.oncomplete = res; t.onerror = res }) } catch (e) {} }

export function ReceiptPrinter({ open, onClose, records, S, cardEl, rootEl }) {
  const [period, setPeriod] = useState('day')
  const [shown, setShown] = useState(open)
  const [phase, setPhase] = useState('idle')     // opening → printing → done → torn → closing
  const [box, setBox] = useState(null)
  const [serial, setSerial] = useState(0)
  const host = useRef(null), cv = useRef(null), paper = useRef(null), stub = useRef(null), fibers = useRef(null), printAnim = useRef(null), drag = useRef(null)
  const [pull, setPull] = useState(0)
  const [toast, setToast] = useState('')
  const [hgt, setHgt] = useState(300)
  const [pref, setPrefState] = useState(() => ({ mode: canPickFile() ? 'ask' : 'downloads', dirName: '', ...loadPref() }))
  const [menu, setMenu] = useState(false)
  const data = receiptData(records, S, period)
  const setPref = (p) => { const n = { ...pref, ...p }; setPrefState(n); savePref(n) }

  // 打印机贴在卡片上：位置用不受倾斜影响的 offset，每一帧抄卡片的 transform，卡片怎么晃它就怎么晃
  useLayoutEffect(() => {
    if (!shown || !cardEl || !rootEl) return
    let raf = 0
    const measure = () => {
      let x = 0, y = 0, n = cardEl
      while (n && n !== rootEl) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent }
      setBox((b) => (b && b.left === x && b.top === y && b.width === cardEl.offsetWidth && b.height === cardEl.offsetHeight ? b : { left: x, top: y, width: cardEl.offsetWidth, height: cardEl.offsetHeight }))
    }
    const follow = () => {
      const h = host.current
      if (h) { h.style.transform = cardEl.style.transform || ''; h.style.transformOrigin = cardEl.style.transformOrigin || '50% 50%' }
      raf = requestAnimationFrame(follow)
    }
    measure(); raf = requestAnimationFrame(follow)
    const ro = new ResizeObserver(measure); ro.observe(cardEl); ro.observe(rootEl)
    const iv = setInterval(measure, 500)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearInterval(iv) }
  }, [shown, cardEl, rootEl])

  // 开口：先出现一道缝 → 缝两边的唇分开 → 指示灯亮，开始走纸；收起时反过来：纸掉走、嘴合上、缝消失
  useEffect(() => {
    if (open) { setShown(true); setPhase('opening'); const t = setTimeout(() => { setPhase('printing'); setSerial((x) => x + 1) }, 720); return () => clearTimeout(t) }
    if (!shown) return
    setPhase('closing'); setMenu(false)
    const p = paper.current
    if (p && !p.classList.contains('torn')) { if (printAnim.current) { printAnim.current.cancel(); printAnim.current = null } p.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-hgt - 6}px)` }], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }) }
    const t = setTimeout(() => { setShown(false); setPhase('idle') }, 760)
    return () => clearTimeout(t)
  }, [open])

  // 画 + 一格一格吐纸
  useLayoutEffect(() => {
    if (!open || !serial || !cv.current) return
    const h = drawReceipt(cv.current, receiptData(records, S, period), 2)
    cv.current.style.width = W + 'px'; cv.current.style.height = h + 'px'
    setHgt(h)
    const p = paper.current
    if (p) {
      p.classList.remove('torn'); p.style.transform = ''
      const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
      const a = p.animate([{ transform: `translateY(${-h - 6}px)` }, { transform: 'translateY(0)' }], { duration: reduce ? 1 : Math.min(2800, 800 + h * 3.4), easing: `steps(${Math.round(h / 14)}, end)`, fill: 'both' })
      printAnim.current = a
      a.onfinish = () => setPhase('done')
    }
  }, [serial])

  // ---- 扯 ----
  const TEAR = 130
  // 沿着出纸口横着撕：口子里留下一小截（底边锯齿），小票顶边也变成锯齿，两片之间的缝越扯越大，中间几根纸纤维被拉长、最后崩断
  const ZN = 34
  const zig = (amp, top) => {
    const pts = []
    for (let i = 0; i <= ZN; i++) { const x = (i * 100 / ZN).toFixed(2) + '%', o = (i % 2 ? amp : 0) + (i % 3 === 1 ? amp * 0.35 : 0); pts.push(top ? `${x} ${o.toFixed(1)}px` : `${x} calc(100% - ${o.toFixed(1)}px)`) }
    return top ? `polygon(${pts.join(',')}, 100% 100%, 0 100%)` : `polygon(0 0, 100% 0, ${pts.reverse().join(',')})`
  }
  const crack = (k, eff = 0) => {
    const c = cv.current, st = stub.current, f = fibers.current
    const amp = Math.min(7, k * 14)
    if (c) c.style.clipPath = k > 0.02 ? zig(amp, true) : 'none'
    if (st) { st.style.opacity = k > 0.02 ? 1 : 0; st.style.clipPath = zig(amp, false) }
    if (f) { f.style.height = Math.max(0, eff).toFixed(1) + 'px'; f.style.opacity = k > 0.05 ? (1 - Math.pow(k, 3)).toFixed(2) : 0; f.style.setProperty('--k', k.toFixed(3)) }
  }
  const place = (dx, eff, k) => {
    const p = paper.current; if (!p) return
    const shake = k > 0.55 ? Math.sin(performance.now() / 20) * (k - 0.55) * 2.2 : 0
    p.style.transform = `translate(${(dx * 0.18 + shake).toFixed(1)}px, ${eff.toFixed(1)}px) rotate(${(dx * 0.02).toFixed(2)}deg)`
    crack(k, eff)
    p.style.setProperty('--pull', k.toFixed(3))
    setPull(k)
  }
  const onDown = (e) => {
    if (phase !== 'done' || e.target.closest('button') || e.target.closest('.lf-paper-bar')) return
    const p = paper.current; if (!p) return
    if (printAnim.current) { printAnim.current.cancel(); printAnim.current = null }
    p.style.transform = 'translateY(0)'
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, vy: 0, ly: e.clientY, lt: performance.now(), eff: 0, dx: 0, raw: 0 }
    p.classList.add('pulling'); setMenu(false)
  }
  const onMove = (e) => {
    const d = drag.current; if (!d) return
    const now = performance.now(), dy = e.clientY - d.y
    d.vy = d.vy * 0.6 + ((e.clientY - d.ly) / Math.max(8, now - d.lt)) * 0.4; d.ly = e.clientY; d.lt = now
    d.dx = e.clientX - d.x; d.raw = dy
    d.eff = dy > 0 ? 34 * (1 - Math.exp(-dy / 110)) : dy * 0.08     // 越往下越扯不动，缝最多拉开 34px
    if (dy >= TEAR) { rip(); return }
    place(d.dx, d.eff, Math.max(0, dy) / TEAR)
  }
  const onUp = () => {
    const d = drag.current; if (!d) return
    if (d.raw > TEAR * 0.5 && d.vy > 0.8) { rip(); return }
    drag.current = null
    const p = paper.current; if (!p) return
    p.classList.remove('pulling'); setPull(0)
    const from = p.style.transform
    p.style.transform = 'translateY(0)'; p.style.setProperty('--pull', 0)
    p.animate([{ transform: from }, { transform: 'translateY(0)' }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.5,1)' })
    crack(0)
  }
  const rip = () => {
    const d = drag.current || { dx: 0, eff: 50 }; drag.current = null
    const p = paper.current; if (!p) return
    setPhase('torn'); setPull(1)
    p.classList.remove('pulling'); p.classList.add('torn')
    const from = `translate(${(d.dx * 0.18).toFixed(1)}px, ${d.eff.toFixed(1)}px) rotate(${(d.dx * 0.02).toFixed(2)}deg)`
    p.style.transform = from
    if (cv.current) cv.current.style.clipPath = zig(7, true)
    const f = fibers.current; if (f) f.style.opacity = 0
    const st = stub.current
    if (st) { st.style.clipPath = zig(7, false); st.animate([{ transform: 'none' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(-10px)', opacity: 0 }], { duration: 700, delay: 500, easing: 'ease-in', fill: 'forwards' }) }
    const a = p.animate([
      { transform: from },
      { transform: `translate(${d.dx * 0.22}px, ${d.eff + 30}px) rotate(${d.dx * 0.025 - 3}deg)`, offset: 0.16 },
      { transform: `translate(${d.dx * 0.6 + 40}px, ${d.eff + 320}px) rotate(${d.dx * 0.05 + 12}deg)`, opacity: 0 },
    ], { duration: 860, easing: 'cubic-bezier(.4,.1,.7,.5)', fill: 'forwards' })
    setToast('撕下来了，正在保存…')
    save().then((r) => {
      if (r === 'cancel' || r === 'fail') {
        setToast(r === 'cancel' ? '没有保存' : '没存上，换个位置试试')
        setTimeout(() => { setToast(''); a.cancel(); if (st) st.getAnimations().forEach((x) => x.cancel()); crack(0); setPull(0); setPhase('printing'); setSerial((x) => x + 1) }, 1300)
        return
      }
      setToast(r)
      setTimeout(() => { setToast(''); onClose() }, 1500)
    })
  }
  const dropOld = (then) => {
    const p = paper.current; if (!p) { then(); return }
    const a = p.animate([{ transform: getComputedStyle(p).transform === 'none' ? 'none' : getComputedStyle(p).transform, opacity: 1 }, { transform: 'translate(10px, 8px) rotate(2deg)', offset: 0.25 }, { transform: 'translate(70px, 200px) rotate(14deg)', opacity: 0 }], { duration: 620, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' })
    a.onfinish = () => { a.cancel(); then() }
  }
  const switchTo = (pd) => { if (pd === period || phase !== 'done') return; setPhase('printing'); dropOld(() => { setPeriod(pd); setSerial((x) => x + 1) }) }

  // ---- 存 ----
  const fileName = () => { const d = new Date(S.today); return '日晷小票-' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + ({ day: '今天', week: '本周', month: '本月' }[period]) + '-' + pad2(new Date().getHours()) + pad2(new Date().getMinutes()) + '.png' }
  const save = async () => {
    const c = document.createElement('canvas'); drawReceipt(c, data, 3)
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
    const name = fileName()
    try {
      if (pref.mode === 'folder' && canPickDir()) {
        let dir = await getDir()
        if (dir && (await dir.queryPermission({ mode: 'readwrite' })) !== 'granted') { if ((await dir.requestPermission({ mode: 'readwrite' })) !== 'granted') dir = null }
        if (!dir) { dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'rigui-receipts' }); await putDir(dir); setPref({ dirName: dir.name }) }
        const fh = await dir.getFileHandle(name, { create: true }), w = await fh.createWritable(); await w.write(blob); await w.close()
        return '已存进「' + dir.name + '」'
      }
      if (pref.mode === 'ask' && canPickFile()) {
        const h = await window.showSaveFilePicker({ suggestedName: name, id: 'rigui-receipts', types: [{ description: 'PNG 图片', accept: { 'image/png': ['.png'] } }] })
        const w = await h.createWritable(); await w.write(blob); await w.close(); return '已保存：' + h.name
      }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; if (pref.mode !== 'downloads') return 'fail' }
    const url = URL.createObjectURL(blob), a = document.createElement('a')
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000)
    return '已存到「下载」'
  }
  const pickFolder = async () => {
    try { const dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'rigui-receipts' }); await putDir(dir); setPref({ mode: 'folder', dirName: dir.name }); setMenu(false) } catch (e) {}
  }
  const where = pref.mode === 'folder' ? (pref.dirName ? '存进「' + pref.dirName + '」' : '存进固定文件夹') : pref.mode === 'ask' ? '每次问存哪' : '存到「下载」'

  if (!shown || !box) return null
  const slotW = Math.min(box.width - 44, W + 40)
  const slotY = box.height - 15
  return (
    <div ref={host} className={'lf-printer ph-' + phase} style={{ left: box.left, top: box.top, width: box.width, height: box.height }}>
      <div className="lf-slot" style={{ width: slotW, top: slotY }}>
        <i className="lf-slot-seam" /><i className="lf-slot-mouth" /><i className="lf-slot-lip" />
        <i className="lf-slot-led" />
      </div>
      {toast && <div className="lf-print-toast" key={toast} style={{ top: slotY + 20 }}>{toast}</div>}
      <div className="lf-paper-win" style={{ top: slotY + 2, width: W + 120, height: hgt + 90 }}>
        <div ref={stub} className="lf-stub" aria-hidden="true" />
        <div ref={fibers} className="lf-fibers" aria-hidden="true">{[8, 21, 37, 52, 66, 79, 91].map((x, i) => <i key={i} style={{ left: x + '%', '--d': i * 0.13 }} />)}</div>
        <div ref={paper} className="lf-paper" style={{ transform: `translateY(${-hgt - 6}px)` }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <div className="lf-tear" aria-hidden="true" />
          <canvas ref={cv} aria-label={'小票：' + data.label + '，' + data.rows.length + ' 笔，合计 ' + yuan(data.total) + '。往下扯，撕下来就会保存成图片'} role="img" />
          <div className={'lf-paper-bar' + (phase === 'done' && pull === 0 ? ' on' : '')}>
            <span className="lf-seg">
              {[['day', '今天'], ['week', '本周'], ['month', '本月']].map(([k, t]) => <button key={k} type="button" className={period === k ? 'on' : ''} onClick={() => switchTo(k)}>{t}</button>)}
            </span>
            <span className="lf-where">
              <button type="button" className="lf-where-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} title="撕下来以后存到哪里">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></svg>
                {where}
              </button>
              {menu && (
                <span className="lf-where-menu" role="menu">
                  {canPickFile() && <button type="button" role="menuitemradio" aria-checked={pref.mode === 'ask'} className={pref.mode === 'ask' ? 'on' : ''} onClick={() => { setPref({ mode: 'ask' }); setMenu(false) }}>每次问我存到哪里</button>}
                  {canPickDir() && <button type="button" role="menuitemradio" aria-checked={pref.mode === 'folder'} className={pref.mode === 'folder' ? 'on' : ''} onClick={() => (pref.dirName ? (setPref({ mode: 'folder' }), setMenu(false)) : pickFolder())}>{pref.dirName ? '固定存进「' + pref.dirName + '」' : '固定存进一个文件夹…'}</button>}
                  {canPickDir() && pref.dirName && <button type="button" className="sub" onClick={pickFolder}>换个文件夹…</button>}
                  <button type="button" role="menuitemradio" aria-checked={pref.mode === 'downloads'} className={pref.mode === 'downloads' ? 'on' : ''} onClick={() => { setPref({ mode: 'downloads' }); setMenu(false) }}>直接存到「下载」</button>
                </span>
              )}
            </span>
          </div>
          {phase === 'done' && pull === 0 && <span className="lf-pull-hint" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v15" /><path d="M6 13l6 6 6-6" /></svg>往下扯，撕下来就存好</span>}
        </div>
      </div>
    </div>
  )
}

export const RECEIPT_CSS = `
.lf-printer{position:absolute;z-index:40;pointer-events:none}
/* 出纸口：缝 → 张开的嘴 → 上唇的阴影 → 指示灯 */
.lf-slot{position:absolute;left:50%;height:14px;margin:-7px 0 0;translate:-50% 0}
.lf-slot i{position:absolute;display:block}
.lf-slot-seam{left:0;right:0;top:6px;height:2px;border-radius:1px;background:linear-gradient(rgba(20,12,40,.55),rgba(255,255,255,.35));transform:scaleX(0);animation:lf-seam .32s cubic-bezier(.3,.8,.3,1) forwards}
.lf-slot-mouth{left:0;right:0;top:7px;height:0;border-radius:7px;background:linear-gradient(#0B0816,#1E1830 70%,#2A2242);box-shadow:inset 0 3px 5px rgba(0,0,0,.75),inset 0 -1px 0 rgba(255,255,255,.12),0 1px 0 rgba(255,255,255,.3);animation:lf-mouth .36s .3s cubic-bezier(.2,.9,.3,1.25) forwards}
.lf-slot-lip{left:4px;right:4px;top:0;height:7px;border-radius:6px 6px 0 0;background:linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.18));opacity:0;animation:lf-fade .3s .45s forwards}
.lf-slot-led{right:-14px;top:4px;width:6px;height:6px;border-radius:3px;background:#7CF0B4;box-shadow:0 0 6px #7CF0B4;opacity:0;animation:lf-fade .2s .6s forwards}
.lf-printer.ph-printing .lf-slot-led{animation:lf-fade .2s .6s forwards,lf-blink .5s steps(2) infinite}
.lf-printer.ph-printing .lf-slot-mouth{animation:lf-mouth .36s .3s cubic-bezier(.2,.9,.3,1.25) forwards,lf-hum .09s linear infinite}
.lf-printer.ph-closing .lf-slot-mouth{animation:lf-mouthclose .3s ease-in forwards}
.lf-printer.ph-closing .lf-slot-seam{animation:lf-seamclose .3s .28s ease-in forwards;transform:scaleX(1)}
.lf-printer.ph-closing .lf-slot-led,.lf-printer.ph-closing .lf-slot-lip{animation:lf-fadeout .2s forwards}
@keyframes lf-seam{to{transform:scaleX(1)}}
@keyframes lf-seamclose{to{transform:scaleX(0)}}
@keyframes lf-mouth{from{height:0;top:7px}to{height:14px;top:0}}
@keyframes lf-mouthclose{from{height:14px;top:0}to{height:0;top:7px}}
@keyframes lf-hum{50%{translate:0 .5px}}
@keyframes lf-blink{50%{opacity:.25}}
@keyframes lf-fade{to{opacity:1}}
@keyframes lf-fadeout{to{opacity:0}}
.lf-paper-win{position:absolute;left:50%;translate:-50% 0;clip-path:inset(0 -400px -4000px -400px);display:flex;flex-direction:column;align-items:center;pointer-events:none}
.lf-stub{position:absolute;top:0;left:50%;width:272px;margin-left:-136px;height:9px;background:#FCFBF6;opacity:0;z-index:1;box-shadow:inset 0 3px 3px -2px rgba(0,0,0,.18)}
.lf-fibers{position:absolute;top:4px;left:50%;width:272px;margin-left:-136px;height:0;opacity:0;pointer-events:none}
.lf-fibers i{position:absolute;top:0;bottom:0;width:1px;background:linear-gradient(rgba(252,251,246,.95),rgba(220,214,200,.8) 50%,rgba(252,251,246,.95));transform:scaleX(calc(1.6 - var(--k,0)));opacity:calc(1 - var(--k,0) * (1 + var(--d,0)) * 1.2)}
.lf-paper{position:relative;width:272px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;pointer-events:auto;filter:drop-shadow(0 10px 18px rgba(31,35,40,.22)) drop-shadow(0 2px 3px rgba(31,35,40,.12));will-change:transform}
.lf-paper canvas{display:block}
.lf-paper.pulling{cursor:grabbing}
.lf-paper.torn canvas{clip-path:polygon(0.00% 0, 2.94% 7px, 5.88% 0, 8.82% 7px, 11.76% 0, 14.71% 7px, 17.65% 0, 20.59% 7px, 23.53% 0, 26.47% 7px, 29.41% 0, 32.35% 7px, 35.29% 0, 38.24% 7px, 41.18% 0, 44.12% 7px, 47.06% 0, 50.00% 7px, 52.94% 0, 55.88% 7px, 58.82% 0, 61.76% 7px, 64.71% 0, 67.65% 7px, 70.59% 0, 73.53% 7px, 76.47% 0, 79.41% 7px, 82.35% 0, 85.29% 7px, 88.24% 0, 91.18% 7px, 94.12% 0, 97.06% 7px, 100.00% 0, 100% 100%, 0 100%)}
.lf-tear{position:absolute;left:0;right:0;top:0;height:2px;background:repeating-linear-gradient(90deg,rgba(36,33,28,.5) 0 3px,transparent 3px 6px);opacity:calc(var(--pull,0) * 1.6 - .1);pointer-events:none;z-index:1}
.lf-paper.torn .lf-tear{opacity:0}
.lf-print-toast{position:absolute;left:50%;translate:-50% 0;z-index:3;padding:7px 14px;border-radius:16px;background:#1F2328;color:#fff;font-size:12.5px;font-weight:600;white-space:nowrap;box-shadow:0 10px 24px -10px rgba(0,0,0,.5);animation:lf-swap .3s cubic-bezier(.2,.9,.3,1.3) both}
.lf-paper-bar{display:flex;align-items:center;gap:6px;width:max-content;position:relative;left:50%;translate:-50% 0;margin:12px 0 0;padding:5px;border-radius:20px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);box-shadow:0 8px 22px -10px rgba(31,35,40,.35),0 0 0 1px rgba(31,35,40,.05);opacity:0;transform:translateY(-6px);transition:opacity .3s,transform .3s;pointer-events:none}
.lf-paper-bar.on{opacity:1;transform:none;pointer-events:auto}
.lf-seg{display:inline-flex;padding:3px;border-radius:15px;background:rgba(31,35,40,.07)}
.lf-root .lf-seg button{height:24px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:#5E645C;font:inherit;font-size:12px;cursor:pointer;transition:background .2s,color .2s}
.lf-root .lf-seg button.on{background:#fff;color:#1F2328;font-weight:600;box-shadow:0 1px 3px rgba(31,35,40,.15)}
.lf-where{position:relative}
.lf-root .lf-where-btn{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 11px;border:0;border-radius:15px;background:transparent;color:#3A3F38;font:inherit;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .2s}
.lf-root .lf-where-btn:hover{background:rgba(31,35,40,.06)}
.lf-where-menu{position:absolute;right:0;bottom:calc(100% + 8px);display:flex;flex-direction:column;min-width:200px;padding:6px;border-radius:14px;background:#fff;box-shadow:0 14px 34px -12px rgba(31,35,40,.4),0 0 0 1px rgba(31,35,40,.06);animation:lf-swap .2s cubic-bezier(.2,.9,.3,1.2) both;z-index:5}
.lf-root .lf-where-menu button{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;border:0;border-radius:9px;background:transparent;color:#1F2328;font:inherit;font-size:13px;text-align:left;cursor:pointer;white-space:nowrap}
.lf-root .lf-where-menu button:hover{background:#F4F5F1}
.lf-root .lf-where-menu button::before{content:'';width:14px;height:14px;flex:none;border-radius:7px;box-shadow:inset 0 0 0 1.5px #C9CDC5}
.lf-root .lf-where-menu button.on::before{box-shadow:inset 0 0 0 4.5px #1E9E6A}
.lf-root .lf-where-menu button.sub{height:28px;font-size:12px;color:#5E645C;padding-left:32px}
.lf-root .lf-where-menu button.sub::before{display:none}
.lf-pull-hint{position:absolute;left:50%;translate:-50% 0;top:calc(100% - 4px);display:inline-flex;align-items:center;gap:5px;margin-top:62px;font-size:12px;font-weight:600;color:#5E645C;white-space:nowrap;pointer-events:none;opacity:0;animation:lf-fade .4s .3s forwards}
.lf-pull-hint svg{animation:lf-tug 1.4s ease-in-out infinite}
@keyframes lf-tug{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}
.lf-root .lf-printbtn{width:28px;height:28px;margin:-4px -4px -4px 4px;border:0;border-radius:9px;background:rgba(255,255,255,.12);color:#fff;display:inline-grid;place-items:center;cursor:pointer;transition:background .2s,transform .2s}
.lf-root .lf-printbtn:hover{background:rgba(255,255,255,.22)}
.lf-root .lf-printbtn:hover svg{animation:lf-printwig .5s ease-in-out}
.lf-root .lf-printbtn.on{background:#fff;color:#7C5CE0}
@keyframes lf-printwig{30%{transform:translateY(1.5px)}60%{transform:translateY(-1px)}}
`
