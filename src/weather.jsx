// 顶部大卡片的天空：接真实天气（Open-Meteo，免 key），像 iOS 天气小组件那样一直在动
// - 晴天有太阳光晕、夜里有星星和月亮、多云有慢慢飘的云、下雨下雪有粒子、雷雨会闪
// - 日出日落前后天边带一点暖色
// - 正在进行的日程期间，天空淡出，换成这项日程的颜色（开会靛蓝、学习紫、运动绿、其它墨色）
import React, { useEffect, useRef, useState } from 'react'

const CACHE = 'dsh-rigui:weather', CITY = 'dsh-rigui:city'
const ls = { get: (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} } }

// WMO 天气代码 → 类型
export function kindOf(code) {
  if (code === 0 || code === 1) return 'clear'
  if (code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'thunder'
  return 'cloudy'
}
export const LABEL = { clear: '晴', partly: '多云', cloudy: '阴', fog: '雾', drizzle: '小雨', rain: '雨', snow: '雪', thunder: '雷雨' }
const SKY = {
  clear: [['#2E7FD6', '#6FB4F0'], ['#081230', '#1C2A57']],
  partly: [['#4282C6', '#8AB6E0'], ['#0F1934', '#283458']],
  cloudy: [['#62758A', '#9DAAB8'], ['#1A2029', '#343C49']],
  fog: [['#7E8A94', '#B6BDC2'], ['#262B33', '#41474F']],
  drizzle: [['#4C6378', '#7F94A7'], ['#151C27', '#2C3645']],
  rain: [['#3A4E62', '#677C90'], ['#10161F', '#26303D']],
  snow: [['#7389A2', '#BCCADA'], ['#1C2534', '#39465A']],
  thunder: [['#262A40', '#4A4C68'], ['#0E0F1A', '#2A2B3E']],
}
export const TONE = {
  meet: { a: '#2B3A9E', b: '#4F5FCF', name: '开会' },
  study: { a: '#5B3FC4', b: '#8E70EC', name: '学习' },
  move: { a: '#147A52', b: '#2DB880', name: '运动' },
  time: { a: '#1F2328', b: '#3A404A', name: '日程' },
}

async function api(endpoint, payload) {
  const r = await fetch('api/rigui', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ endpoint, payload }) })
  const j = await r.json(); if (!j.ok) throw new Error(j.error || 'failed'); return j.result
}
const OM = 'https://api.open-meteo.com/v1/forecast?current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7'
async function fetchForecast(lat, lon) {
  try { const d = await api('weather', { lat, lon }); if (d && d.daily && d.daily.time && d.daily.time.length >= 7) return d } catch (e) {}
  const r = await fetch(`${OM}&latitude=${lat}&longitude=${lon}`); return r.json()      // 主机没重启（还是旧接口、只给两天）时，直接请求
}
async function geocode(name) {
  try { return await api('geo', { name }) } catch (e) {}
  const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=zh&name=' + encodeURIComponent(name)); return r.json()
}

export function useWeather() {
  const [city, setCityState] = useState(() => ls.get(CITY))       // {name, lat, lon}
  const [w, setW] = useState(() => { const c = ls.get(CACHE); return c && c.city && city && c.city === city.name ? c : null })
  const [err, setErr] = useState('')
  const load = async (c, force) => {
    if (!c) return
    const cached = ls.get(CACHE)
    if (!force && cached && cached.days && cached.days.length >= 7 && cached.city === c.name && Date.now() - cached.at < 30 * 60000) { setW(cached); return }
    try {
      const d = await fetchForecast(c.lat, c.lon)
      const cur = d.current, nowIso = cur.time
      const i0 = Math.max(0, d.hourly.time.findIndex((t) => t >= nowIso.slice(0, 13)))
      const out = {
        city: c.name, at: Date.now(), temp: Math.round(cur.temperature_2m), feels: Math.round(cur.apparent_temperature), code: cur.weather_code, isDay: !!cur.is_day,
        hum: cur.relative_humidity_2m, wind: cur.wind_speed_10m, hi: Math.round(d.daily.temperature_2m_max[0]), lo: Math.round(d.daily.temperature_2m_min[0]),
        sunrise: d.daily.sunrise[0], sunset: d.daily.sunset[0],
        days: (d.daily.time || []).map((t, k) => ({ date: t, code: d.daily.weather_code ? d.daily.weather_code[k] : cur.weather_code, hi: Math.round(d.daily.temperature_2m_max[k]), lo: Math.round(d.daily.temperature_2m_min[k]), pop: d.daily.precipitation_probability_max ? d.daily.precipitation_probability_max[k] : null })),
        hourly: d.hourly.time.slice(i0 + 1, i0 + 6).map((t, k) => ({ h: +t.slice(11, 13), temp: Math.round(d.hourly.temperature_2m[i0 + 1 + k]), code: d.hourly.weather_code[i0 + 1 + k] })),
        rainSoon: d.hourly.weather_code.slice(i0, i0 + 6).some((x) => kindOf(x) === 'rain' || kindOf(x) === 'thunder' || kindOf(x) === 'drizzle'),
      }
      ls.set(CACHE, out); setW(out); setErr('')
    } catch (e) { setErr('天气没取到') }
  }
  useEffect(() => { load(city); const iv = setInterval(() => load(city), 30 * 60000); return () => clearInterval(iv) }, [city && city.name])
  const setCity = async (name) => {
    name = String(name || '').trim(); if (!name) return
    try {
      const g = await geocode(name), r = g.results && g.results[0]
      if (!r) { setErr('没找到「' + name + '」'); return }
      const c = { name: r.name, lat: r.latitude, lon: r.longitude }
      ls.set(CITY, c); setCityState(c); load(c, true)
    } catch (e) { setErr('天气没取到') }
  }
  return { w, city, setCity, err }
}

// 太阳快出来 / 快落山：天边带一点暖色（0..1）
function dawnDusk(w, now) {
  if (!w || !w.sunrise) return 0
  const t = new Date(now), m = t.getHours() * 60 + t.getMinutes()
  const toMin = (iso) => +iso.slice(11, 13) * 60 + +iso.slice(14, 16)
  const d = Math.min(Math.abs(m - toMin(w.sunrise)), Math.abs(m - toMin(w.sunset)))
  return d < 60 ? 1 - d / 60 : 0
}

export function HeroSky({ w, now, tone }) {
  const cv = useRef(null), live = useRef({})
  const kind = w ? kindOf(w.code) : 'partly'
  const night = w ? !w.isDay : (new Date(now).getHours() < 6 || new Date(now).getHours() >= 19)
  live.current = { kind, night }
  useEffect(() => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d')
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, raf = 0, vis = true, t0 = performance.now(), flash = 0
    const rnd = (a, b) => a + Math.random() * (b - a)
    let stars = [], clouds = [], drops = [], flakes = [], bands = []
    const seed = () => {
      stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random() * 0.75, r: rnd(0.4, 1.4), p: rnd(0, 6) }))
      clouds = Array.from({ length: 7 }, (_, i) => ({ x: rnd(-0.2, 1.1), y: rnd(0.02, 0.55), s: rnd(0.7, 1.5), v: rnd(0.004, 0.012), puffs: Array.from({ length: 5 }, () => ({ dx: rnd(-1, 1), dy: rnd(-0.35, 0.25), r: rnd(0.5, 1) })) }))
      drops = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.9, 1.5), l: rnd(10, 22) }))
      flakes = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.04, 0.11), r: rnd(1, 3), p: rnd(0, 6) }))
      bands = Array.from({ length: 5 }, (_, i) => ({ y: 0.2 + i * 0.16, x: Math.random(), v: rnd(0.003, 0.008), a: rnd(0.08, 0.16) }))
    }
    seed()
    const size = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    size()
    const ro = new ResizeObserver(size); ro.observe(c)
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame) }); io.observe(c)
    const cloud = (cl, col, a) => {
      const R = 70 * cl.s
      ctx.fillStyle = col
      cl.puffs.forEach((p) => { const g = ctx.createRadialGradient(cl.x * W + p.dx * R * 1.4, cl.y * H + p.dy * R, 0, cl.x * W + p.dx * R * 1.4, cl.y * H + p.dy * R, R * p.r * 1.25); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cl.x * W + p.dx * R * 1.4, cl.y * H + p.dy * R, R * p.r * 1.25, 0, Math.PI * 2); ctx.fill() })
    }
    function frame(nowT) {
      raf = 0
      const t = (nowT - t0) / 1000, { kind: k, night: n } = live.current
      ctx.clearRect(0, 0, W, H)
      // 星星
      if (n && (k === 'clear' || k === 'partly')) stars.forEach((s) => { ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.p)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill() })
      ctx.globalAlpha = 1
      // 太阳 / 月亮
      if (k === 'clear' || k === 'partly') {
        const sx = W * 0.86, sy = H * 0.12
        if (!n) {
          const pulse = 1 + 0.04 * Math.sin(t * 0.9)
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 300 * pulse)
          g.addColorStop(0, 'rgba(255,248,214,.85)'); g.addColorStop(0.18, 'rgba(255,236,170,.45)'); g.addColorStop(0.5, 'rgba(255,220,150,.12)'); g.addColorStop(1, 'rgba(255,220,150,0)')
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.03)
          for (let i = 0; i < 10; i++) { ctx.rotate(Math.PI / 5); const gr = ctx.createLinearGradient(0, 0, 420, 0); gr.addColorStop(0, 'rgba(255,245,210,.10)'); gr.addColorStop(1, 'rgba(255,245,210,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(420, -22); ctx.lineTo(420, 22); ctx.closePath(); ctx.fill() }
          ctx.restore()
        } else {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 160); g.addColorStop(0, 'rgba(220,230,255,.35)'); g.addColorStop(1, 'rgba(220,230,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
          ctx.fillStyle = '#F2F4FF'; ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI * 2); ctx.fill()
          ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(sx + 10, sy - 7, 19, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over'
        }
      }
      // 云
      const nCloud = { clear: 1, partly: 4, cloudy: 7, fog: 3, drizzle: 6, rain: 7, snow: 6, thunder: 7 }[k]
      const cc = n ? 'rgba(170,185,215,A)' : k === 'rain' || k === 'thunder' || k === 'drizzle' ? 'rgba(200,210,222,A)' : 'rgba(255,255,255,A)'
      const ca = { clear: 0.25, partly: 0.55, cloudy: 0.5, fog: 0.35, drizzle: 0.42, rain: 0.42, snow: 0.5, thunder: 0.38 }[k]
      clouds.slice(0, nCloud).forEach((cl) => { if (!reduce) cl.x += cl.v / 60; if (cl.x > 1.35) cl.x = -0.35; cloud(cl, cc, ca) })
      // 雾带
      if (k === 'fog') bands.forEach((b) => { if (!reduce) b.x = (b.x + b.v / 60) % 1; const g = ctx.createLinearGradient(0, b.y * H - 40, 0, b.y * H + 40); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${b.a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, b.y * H - 40, W, 80) })
      // 雨
      if (k === 'rain' || k === 'drizzle' || k === 'thunder') {
        const nD = k === 'drizzle' ? 70 : 160
        ctx.strokeStyle = 'rgba(220,232,245,.45)'; ctx.lineWidth = k === 'drizzle' ? 1 : 1.3; ctx.lineCap = 'round'
        ctx.beginPath()
        drops.slice(0, nD).forEach((d) => { if (!reduce) { d.y += d.v / 60 * (k === 'drizzle' ? 0.6 : 1); if (d.y > 1.05) { d.y = -0.05; d.x = Math.random() } } const x = d.x * W, y = d.y * H; ctx.moveTo(x, y); ctx.lineTo(x - d.l * 0.25, y + d.l) })
        ctx.stroke()
      }
      // 雪
      if (k === 'snow') flakes.forEach((f) => { if (!reduce) { f.y += f.v / 60; f.p += 0.02; if (f.y > 1.03) { f.y = -0.03; f.x = Math.random() } } ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(f.x * W + Math.sin(f.p) * 14, f.y * H, f.r, 0, Math.PI * 2); ctx.fill() })
      // 闪电
      if (k === 'thunder' && !reduce) { if (flash <= 0 && Math.random() < 0.004) flash = 1; if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 * flash * (Math.random() > 0.3 ? 1 : 0.4)})`; ctx.fillRect(0, 0, W, H); flash -= 0.06 } }
      if (vis && !reduce) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])
  const [a, b] = SKY[kind][night ? 1 : 0]
  const warm = dawnDusk(w, now)
  return (
    <div className="lf-sky-hero" aria-hidden="true">
      <div className="lf-sky-grad" style={{ background: `linear-gradient(170deg, ${a}, ${b})`, opacity: tone ? 0 : 1 }} />
      {warm > 0 && !tone && <div className="lf-sky-grad" style={{ background: 'linear-gradient(0deg, rgba(255,160,110,.55), rgba(255,160,110,0) 60%)', opacity: warm }} />}
      <canvas ref={cv} className="lf-sky-cv" style={{ opacity: tone ? 0 : 1 }} />
      <div className={'lf-tone' + (tone ? ' on' : '')} style={tone ? { '--ta': TONE[tone.key].a, '--tb': TONE[tone.key].b } : null}><i /><i /><i /></div>
      <div className="lf-sky-glass" />
    </div>
  )
}

const ICON = {
  clear: (n) => n ? <path d="M15 4a7 7 0 1 0 5 12A8 8 0 0 1 15 4z" fill="currentColor" /> : <><circle cx="12" cy="12" r="4.5" fill="currentColor" />{[0, 45, 90, 135, 180, 225, 270, 315].map((d) => <line key={d} x1="12" y1="2.5" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${d} 12 12)`} />)}</>,
  cloud: () => <path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 11 3.5 3.5 0 0 0 7 18z" fill="currentColor" />,
}
export function WIcon({ code, night, size = 18 }) {
  const k = kindOf(code)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={'lf-wi k-' + k}>
      {k === 'clear' ? ICON.clear(night) : k === 'partly' ? <><g opacity=".9" transform="translate(-3 -3) scale(.8)">{ICON.clear(night)}</g><g transform="translate(3 3) scale(.85)">{ICON.cloud()}</g></> : <>{ICON.cloud()}
        {(k === 'rain' || k === 'drizzle' || k === 'thunder') && [8, 12, 16].map((x) => <line key={x} x1={x} y1="20" x2={x - 1} y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />)}
        {k === 'snow' && [8, 12, 16].map((x) => <circle key={x} cx={x} cy="21.5" r="1.2" fill="currentColor" />)}</>}
    </svg>
  )
}

// 右上角：气温、天气、最高最低、接下来几小时；进行中的日程时换成日程信息
export function WeatherBadge({ weather, tone, now }) {
  const flipped = useWxFlip()
  const onFlip = (e) => { e.stopPropagation(); setWxFlip((x) => !x) }
  const { w, city, setCity, err } = weather
  const [edit, setEdit] = useState(false)
  if (tone) {
    const e = tone.e, left = Math.max(0, Math.round(((e.end || e.t + 3600000) - now) / 60000)), p = Math.min(1, (now - e.t) / ((e.end || e.t + 3600000) - e.t))
    return (
      <div className="lf-wbadge tone">
        <span className="lf-wb-tag"><i className="lf-wb-live" />正在{TONE[tone.key].name}</span>
        <div className="lf-wb-event">{e.title}</div>
        <div className="lf-wb-sub">还剩 {left >= 60 ? Math.floor(left / 60) + ' 小时 ' + (left % 60) + ' 分' : left + ' 分钟'}</div>
        <span className="lf-wb-bar"><i style={{ width: p * 100 + '%' }} /></span>
        {w && <button type="button" className="lf-wb-mini" onClick={onFlip} title="看 7 天预报"><WIcon code={w.code} night={!w.isDay} size={14} />{w.temp}° {LABEL[kindOf(w.code)]}</button>}
      </div>
    )
  }
  if (!city || edit) {
    return (
      <div className="lf-wbadge">
        <form onSubmit={(e) => { e.preventDefault(); setCity(e.currentTarget.city.value); setEdit(false) }}>
          <input name="city" className="lf-wb-input" autoFocus={edit} defaultValue={city ? city.name : ''} placeholder="输入城市看天气" aria-label="城市" onBlur={(e) => { if (e.target.value.trim()) { setCity(e.target.value); setEdit(false) } else setEdit(false) }} />
        </form>
        {err && <div className="lf-wb-sub">{err}</div>}
      </div>
    )
  }
  if (!w) return <div className="lf-wbadge"><div className="lf-wb-sub">{err || '正在看天…'}</div></div>
  const k = kindOf(w.code)
  return (
    <div className={'lf-wbadge compact' + (flipped ? ' flipped' : '')} title={LABEL[k] + ' · 点一下看 7 天'}>
      <button type="button" className="lf-wb-hit lf-wb-city" onClick={onFlip}>{w.city}</button>
      <button type="button" className="lf-wb-hit lf-wb-temp" onClick={onFlip}>{w.temp}°</button>
      <button type="button" className="lf-wb-hit lf-wb-sub" onClick={onFlip}>最高 {w.hi}°  最低 {w.lo}°</button>
    </div>
  )
}

// 翻面状态放在一个小 store 里：只让角标和表盘重绘，不牵动整个工作台（之前整页重渲染，翻转一开始会卡一下）
const flip = { on: false, subs: new Set() }
export function setWxFlip(v) { const n = typeof v === 'function' ? v(flip.on) : v; if (n === flip.on) return; flip.on = n; flip.subs.forEach((f) => f()) }
export function useWxFlip() {
  const [, force] = useState(0)
  useEffect(() => { const f = () => force((x) => x + 1); flip.subs.add(f); return () => flip.subs.delete(f) }, [])
  return flip.on
}
export function DialFlip({ front, back, dialRef }) {
  const on = useWxFlip()
  useEffect(() => {
    if (!on) return
    const k = (e) => { if (e.target.closest && (e.target.closest('.lf-wb-hit') || e.target.closest('.lf-wb-mini') || e.target.closest('.lf-wk-head form'))) return; setWxFlip(false) }
    const esc = (e) => { if (e.key === 'Escape') setWxFlip(false) }
    const t = setTimeout(() => document.addEventListener('click', k), 0)
    window.addEventListener('keydown', esc)
    return () => { clearTimeout(t); document.removeEventListener('click', k); window.removeEventListener('keydown', esc) }
  }, [on])
  return (
    <div ref={dialRef} data-ev="dial" className={'lf-dialflip' + (on ? ' on' : '')}>
      <div className="lf-face front" aria-hidden={on}>{front}</div>
      <div className="lf-face back" aria-hidden={!on}>{back}</div>
    </div>
  )
}

const WD = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// 仪表盘背面：7 天预报，像 iOS 天气小组件那样一行一天，温度条画在本周最低~最高之间
export function WeekWeather({ weather }) {
  const { w, setCity } = weather
  const [edit, setEdit] = useState(false)
  if (!w || !w.days) return <div className="lf-wk"><div className="lf-wk-empty">{weather.err || '正在看天…'}</div></div>
  const days = w.days.slice(0, 7)
  const mn = Math.min(...days.map((d) => d.lo)), mx = Math.max(...days.map((d) => d.hi)), span = Math.max(1, mx - mn)
  const col = (t) => (t <= 5 ? '#7FC8FF' : t <= 15 ? '#8EE3C8' : t <= 24 ? '#FFD36B' : t <= 30 ? '#FFA94D' : '#FF7A59')
  return (
    <div className="lf-wk" onClick={(e) => { if (edit) e.stopPropagation() }}>
      <div className="lf-wk-head">
        <span>7 天预报</span>
        {edit
          ? <form onSubmit={(e) => { e.preventDefault(); setCity(e.currentTarget.city.value); setEdit(false) }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              <input name="city" className="lf-wb-input" autoFocus defaultValue={w.city} placeholder="输入城市" aria-label="城市" onBlur={() => setEdit(false)} />
            </form>
          : <button type="button" className="lf-wk-city" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setEdit(true) }}>{w.city} · 换城市</button>}
      </div>
      <ul className="lf-wk-list">
        {days.map((d, i) => {
          const dt = new Date(d.date + 'T12:00:00'), k = kindOf(d.code)
          const a = ((d.lo - mn) / span) * 100, b = ((d.hi - mn) / span) * 100
          return (
            <li key={d.date} style={{ animationDelay: 0.25 + i * 0.045 + 's' }}>
              <span className="lf-wk-day">{i === 0 ? '今天' : WD[dt.getDay()]}</span>
              <span className="lf-wk-ic"><WIcon code={d.code} size={20} />{d.pop >= 30 && <em>{d.pop}%</em>}</span>
              <span className="lf-wk-lo">{d.lo}°</span>
              <span className="lf-wk-bar" title={LABEL[k]}>
                <i style={{ left: a + '%', width: Math.max(4, b - a) + '%', background: `linear-gradient(90deg,${col(d.lo)},${col(d.hi)})` }} />
                {i === 0 && w.temp != null && <b style={{ left: Math.min(100, Math.max(0, ((w.temp - mn) / span) * 100)) + '%' }} />}
              </span>
              <span className="lf-wk-hi">{d.hi}°</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export const WEATHER_CSS = `
.lf-sky-hero{position:absolute;inset:0;border-radius:inherit;overflow:hidden;z-index:0;pointer-events:none}
.lf-sky-grad{position:absolute;inset:0;transition:opacity 1.4s ease,background 2s ease}
.lf-sky-cv{position:absolute;inset:0;width:100%;height:100%;transition:opacity 1.4s ease}
.lf-sky-glass{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,0) 35%,rgba(0,0,0,.10));box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
.lf-tone{position:absolute;inset:0;opacity:0;transition:opacity 1.4s ease;background:linear-gradient(160deg,var(--ta,#1F2328),var(--tb,#3A404A))}
.lf-tone.on{opacity:1}
.lf-tone i{position:absolute;width:60%;height:120%;border-radius:50%;background:radial-gradient(circle,var(--tb,#3A404A),transparent 65%);opacity:.7;filter:blur(30px);animation:lf-aurora 14s ease-in-out infinite alternate}
.lf-tone i:nth-child(1){left:-10%;top:-30%}
.lf-tone i:nth-child(2){right:-15%;top:10%;animation-duration:18s;animation-delay:-5s;background:radial-gradient(circle,rgba(255,255,255,.22),transparent 60%)}
.lf-tone i:nth-child(3){left:30%;bottom:-60%;animation-duration:22s;animation-delay:-9s}
@keyframes lf-aurora{from{transform:translate(0,0) scale(1)}to{transform:translate(8%,6%) scale(1.15)}}
.lf-hero-sky{position:relative;z-index:1}
.lf-hero-sky h1,.lf-hero-sky p,.lf-hero-sky .lf-vision{text-shadow:0 1px 12px rgba(0,0,0,.18)}
/* 左栏只有一个“东西”：输入框。其余全是字，不做框，不跟它抢 */
.lf-root .lf-glassy .lf-input{height:62px;border-radius:999px;padding:0 66px 0 26px;font-size:17px;color:#fff;caret-color:#fff;
  background:rgba(255,255,255,.2)!important;-webkit-backdrop-filter:blur(24px) saturate(1.15);backdrop-filter:blur(24px) saturate(1.15);
  box-shadow:0 18px 40px -18px rgba(0,0,0,.38),0 2px 6px -2px rgba(0,0,0,.12)!important;transition:background .25s,box-shadow .25s}
.lf-glassy .lf-sayform{border-radius:999px}
.lf-glassy .lf-sayform::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,var(--edge-t,.6)),rgba(255,255,255,.08) 45%,rgba(255,255,255,.05) 70%,rgba(255,255,255,var(--edge-b,.2)));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);transition:opacity .25s;z-index:1}
.lf-glassy .lf-input::placeholder{color:rgba(255,255,255,.78)}
.lf-root .lf-glassy .lf-input:hover{background:rgba(255,255,255,.24)!important}
.lf-root .lf-glassy .lf-input:focus{background:rgba(255,255,255,.27)!important;box-shadow:0 0 0 6px rgba(255,255,255,.08),0 20px 44px -18px rgba(0,0,0,.42)!important}
.lf-glassy .lf-sayform:focus-within{--edge-t:.85;--edge-b:.3}
.lf-root .lf-glassy .lf-send{top:7px;right:7px;width:48px;height:48px;border-radius:999px;z-index:2}
.lf-root .lf-glassy .lf-send:disabled{background:rgba(255,255,255,.14);color:rgba(255,255,255,.7)}
/* 目标：输入框右边一颗可按压的靶子，悬停才说话 */
.lf-sayrow{display:flex;align-items:center;gap:14px}
.lf-root .lf-glassy .gl-entry{flex:none;width:52px;height:52px;padding:0;margin:0;justify-content:center;border-radius:999px;gap:0;
  background:rgba(255,255,255,.1);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -1px 0 rgba(255,255,255,.08),0 6px 16px -8px rgba(0,0,0,.35);
  transition:transform .25s cubic-bezier(.2,.9,.3,1.4),background .2s,box-shadow .2s}
.lf-root .lf-glassy .gl-entry>span{display:none}
.lf-root .lf-glassy .gl-entry svg{width:28px;height:28px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))}
.lf-root .lf-glassy .gl-entry:hover{background:rgba(255,255,255,.18);transform:translateY(-2px)}
.lf-root .lf-glassy .gl-entry:active{transform:translateY(1px) scale(.9);background:rgba(255,255,255,.08);box-shadow:inset 0 2px 6px rgba(0,0,0,.25),inset 0 -1px 0 rgba(255,255,255,.15)}
.lf-glassy .gl-entry.fresh::after{top:6px;right:6px}
.lf-glassy .gl-entry::before{content:attr(data-tip);position:absolute;bottom:calc(100% + 10px);left:50%;transform:translate(-50%,4px);padding:6px 11px;border-radius:999px;white-space:nowrap;
  background:rgba(20,24,40,.72);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;font-size:12.5px;line-height:1.2;pointer-events:none;opacity:0;transition:opacity .18s,transform .22s cubic-bezier(.2,.8,.2,1)}
.lf-glassy .gl-entry:hover::before,.lf-glassy .gl-entry:focus-visible::before{opacity:1;transform:translate(-50%,0)}
/* 输入框下方：平时两行字，点进/开始输入就退场 */
.lf-idle-stack{display:grid}
.lf-idle-stack>*{grid-area:1/1;align-self:start}
.lf-idle{display:flex;flex-direction:column;gap:12px;transition:opacity .25s,transform .35s cubic-bezier(.2,.8,.2,1),filter .25s}
.lf-idle-stack.focus .lf-idle{opacity:0;transform:translateY(6px);filter:blur(3px);pointer-events:none}
.lf-glassy .lf-idle .lf-vision{margin-top:0}
.lf-story{margin:0;font-size:14px;line-height:1.7;color:rgba(244,245,241,.7);max-width:520px}
.lf-glassy .lf-below>*{animation:lf-belowin .35s cubic-bezier(.2,.8,.2,1) both}
@keyframes lf-belowin{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
/* 输入框沉到左栏底部，像对话框；它上面一格：平时是关系提示，点进输入框就换成建议 */
.lf-glassy .lf-nudges{display:grid;align-items:start;margin:0;gap:0}
.lf-glassy .lf-nudges>*{grid-area:1/1}
.lf-sugs{display:flex;flex-wrap:wrap;gap:4px 2px}
.lf-root .lf-sug{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:0;border-radius:999px;background:transparent;color:rgba(255,255,255,.85);font:inherit;font-size:13.5px;
  opacity:0;transform:translateY(-6px);pointer-events:none;transition:opacity .22s,transform .3s cubic-bezier(.2,.8,.2,1),background .2s}
.lf-sugs.on .lf-sug{opacity:1;transform:none;pointer-events:auto}
.lf-root .lf-sug:hover{background:rgba(255,255,255,.12);color:#fff}
.lf-sug em{font-style:normal;color:rgba(255,255,255,.5);font-variant-numeric:tabular-nums}
.lf-sug.due em{color:var(--c)}
.lf-sug-dot{width:6px;height:6px;border-radius:3px;background:var(--c)}
.lf-root .lf-glassy .lf-tip{padding:2px 0;margin:0;width:100%;max-width:560px;background:transparent!important;box-shadow:none!important;border-radius:0;color:rgba(255,255,255,.75);font-size:14px;gap:8px;transition:color .2s}
.lf-root .lf-glassy .lf-tip:hover,.lf-root .lf-glassy .lf-tip.on{color:#fff}
/* 和上面愿景那颗点左对齐：第一颗点宽 6，与愿景的点同宽 */
.lf-glassy .lf-tip-dots i{width:6px;height:6px;border-radius:3px}
.lf-glassy .lf-tip-dots b{width:10px}
.lf-glassy .lf-below{padding:0 0 0 2px}
.lf-glassy .lf-below .lf-sugs{margin:0 0 0 -8px;align-self:start}
.lf-root .lf-wb-hours,.lf-root .lf-wb-input{border-radius:999px}
.lf-root .lf-wb-hours{padding:8px 16px;background:rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
.lf-root .lf-glassy :focus-visible:not(input){outline:none;box-shadow:0 0 0 2px rgba(255,255,255,.5)}
.lf-wb-input:focus{background:rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 0 0 4px rgba(255,255,255,.08)}
/* 天气角标 */
.lf-wbadge{position:absolute;top:26px;right:30px;z-index:2;display:flex;flex-direction:column;align-items:flex-end;gap:2px;color:#fff;text-shadow:0 1px 10px rgba(0,0,0,.2);min-width:160px;animation:lf-swap .5s cubic-bezier(.2,.8,.2,1) both}
.lf-root .lf-wb-city{border:0;background:transparent;padding:0;color:rgba(255,255,255,.85);font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.lf-wb-city:hover{text-decoration:underline}
.lf-wb-temp{font-size:58px;font-weight:300;line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.lf-wb-sub{display:inline-flex;align-items:center;gap:5px;font-size:13px;color:rgba(255,255,255,.88)}
.lf-wb-hours{display:flex;gap:12px;margin-top:10px;padding:8px 12px;border-radius:16px;background:rgba(255,255,255,.14);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.lf-wb-hours span{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:11.5px}
.lf-wb-hours em{font-style:normal;color:rgba(255,255,255,.7)}
.lf-wb-hours b{font-weight:600;font-variant-numeric:tabular-nums}
.lf-wb-input{width:170px;height:34px;padding:0 14px;border:0;border-radius:17px;background:rgba(255,255,255,.18);color:#fff;font:inherit;font-size:13px;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.lf-wb-input::placeholder{color:rgba(255,255,255,.7)}
.lf-wbadge.tone{align-items:flex-end}
.lf-wb-tag{display:inline-flex;align-items:center;gap:7px;height:26px;padding:0 11px;border-radius:13px;background:rgba(255,255,255,.18);font-size:12.5px;font-weight:600}
.lf-wb-live{width:7px;height:7px;border-radius:4px;background:#fff;animation:lf-blinkdot 1.4s ease-in-out infinite}
@keyframes lf-blinkdot{50%{opacity:.3}}
.lf-wb-event{font-size:26px;font-weight:700;margin-top:8px;letter-spacing:-.01em}
.lf-wb-bar{width:180px;height:4px;border-radius:2px;background:rgba(255,255,255,.2);overflow:hidden;margin-top:8px}
.lf-wb-bar i{display:block;height:100%;background:#fff;border-radius:2px;transition:width 1s}
.lf-wb-mini{display:inline-flex;align-items:center;gap:5px;margin-top:10px;font-size:12.5px;color:rgba(255,255,255,.8)}
.lf-wi{flex:none}
.lf-wi.k-clear{color:#FFE28A}
@media (prefers-reduced-motion:reduce){.lf-tone i{animation:none}}
/* 角标精简：城市、现在、今天区间，三处都能点，点了翻仪表盘 */
.lf-wbadge.compact{gap:0;min-width:0;transition:opacity .3s,transform .3s}
.lf-root .lf-wb-hit{border:0;background:transparent;padding:0;color:inherit;font:inherit;cursor:pointer;text-align:right;text-shadow:inherit;transition:opacity .2s,transform .2s}
.lf-root .lf-wb-hit:hover{opacity:.82}
.lf-root .lf-wb-hit:active{transform:scale(.97)}
.lf-root .lf-wbadge.compact .lf-wb-city{font-size:14px;font-weight:600;color:rgba(255,255,255,.88)}
.lf-root .lf-wbadge.compact .lf-wb-city:hover{text-decoration:none}
.lf-root .lf-wbadge.compact .lf-wb-temp{font-size:44px;font-weight:300;line-height:1.05;letter-spacing:-.04em}
.lf-root .lf-wbadge.compact .lf-wb-sub{font-size:12.5px;color:rgba(255,255,255,.85);white-space:pre}
.lf-root .lf-wb-mini{border:0;background:transparent;padding:0;font:inherit;cursor:pointer}
/* 仪表盘翻面 */
.lf-dialflip{display:grid;perspective:1400px}
.lf-dialflip>.lf-face{grid-area:1/1;backface-visibility:hidden;-webkit-backface-visibility:hidden;will-change:transform;transform:translateZ(0);transition:transform .6s cubic-bezier(.25,1.15,.4,1),visibility 0s linear .25s}
.lf-dialflip>.lf-face.back,.lf-dialflip.on>.lf-face.front{visibility:hidden}
.lf-dialflip.on>.lf-face.back{visibility:visible}
.lf-wbadge.compact.flipped{animation:none;opacity:0;transform:translateY(-4px);pointer-events:none}
.lf-dialflip>.lf-face.back{transform:rotateY(-180deg) translateZ(0);display:grid;align-items:center;justify-items:center}
.lf-dialflip.on>.lf-face.front{transform:rotateY(180deg) translateZ(0);pointer-events:none}
.lf-dialflip.on>.lf-face.back{transform:rotateY(0) translateZ(0)}
.lf-dialflip:not(.on)>.lf-face.back{pointer-events:none}
.lf-wk{width:min(400px,100%);padding:18px 20px 14px;border-radius:30px;color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,.1));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -1px 0 rgba(255,255,255,.08),0 20px 50px -24px rgba(0,0,0,.45);cursor:pointer}
.lf-wk-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding-bottom:10px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.18);font-size:12.5px;color:rgba(255,255,255,.75);letter-spacing:.02em}
.lf-root .lf-wk-city{border:0;background:transparent;padding:0;color:rgba(255,255,255,.75);font:inherit;font-size:12.5px;cursor:pointer}
.lf-root .lf-wk-city:hover{color:#fff}
.lf-wk-head .lf-wb-input{width:130px;height:28px;font-size:12.5px}
.lf-wk-list{list-style:none;margin:0;padding:0}
.lf-wk-list li{display:grid;grid-template-columns:44px 52px 34px 1fr 34px;align-items:center;gap:8px;height:43px;border-bottom:1px solid rgba(255,255,255,.1);font-size:15px;font-variant-numeric:tabular-nums}
.lf-wk-list li:last-child{border-bottom:0}
.lf-dialflip.on .lf-wk-list li{animation:lf-wkin .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes lf-wkin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.lf-wk-day{font-weight:600}
.lf-wk-ic{display:flex;flex-direction:column;align-items:center;line-height:1}
.lf-wk-ic em{font-style:normal;font-size:10.5px;font-weight:700;color:#8FD3FF;margin-top:1px}
.lf-wk-lo{text-align:right;color:rgba(255,255,255,.6)}
.lf-wk-hi{text-align:left;font-weight:600}
.lf-wk-bar{position:relative;height:5px;border-radius:3px;background:rgba(0,0,0,.18)}
.lf-wk-bar i{position:absolute;top:0;bottom:0;border-radius:3px}
.lf-wk-bar b{position:absolute;top:50%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.25)}
.lf-wk-empty{padding:40px 0;text-align:center;color:rgba(255,255,255,.75)}
`
