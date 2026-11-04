// 数据层：记录、解析、派生和关联规则。界面只读这里算出来的东西。

export const DOMAIN = {
  sleep: { name: '睡眠', color: '#3D4FB8', soft: '#E3E6F8' },
  move: { name: '运动', color: '#1E9E6A', soft: '#DDF2E8' },
  food: { name: '饮食', color: '#F2994A', soft: '#FDEBDA' },
  money: { name: '花销', color: '#7C5CE0', soft: '#ECE6FB' },
  time: { name: '日程', color: '#1F2328', soft: '#E9EAE6' },
  body: { name: '身体', color: '#0E8A8A', soft: '#D9F0EF' },
}

export const DEFAULT_GOALS = { kcal: 1800, budget: 7000, sleep: 7.5, workoutsPerWeek: 4, weight: null }
export const GOALS = { ...DEFAULT_GOALS }
export function setGoals(g) { Object.assign(GOALS, DEFAULT_GOALS, g || {}) }

const DAY = 86400000
export const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }
export const hourOf = (t) => { const d = new Date(t); return d.getHours() + d.getMinutes() / 60 }
export const fmtTime = (t) => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()) }
export const pad = (n) => (n < 10 ? '0' : '') + n
export const fmtHM = (h) => Math.floor(h) + ':' + pad(Math.round((h % 1) * 60))
export const money = (n) => '¥' + Math.round(n).toLocaleString('en-US')
export const num = (n) => Math.round(n).toLocaleString('en-US')
import { splitFoods, NOT_FOOD } from './foods.js'
let seq = 0
export const uid = () => 'r' + Date.now().toString(36) + (seq++).toString(36)

// ---------- 估算表 ----------
const FOOD_KCAL = [
  ['牛肉面', 620], ['拉面', 600], ['米线', 560], ['麻辣烫', 650], ['饺子', 520], ['包子', 260], ['馄饨', 380],
  ['盖饭', 720], ['米饭', 230], ['炒饭', 700], ['汉堡', 550], ['披萨', 680], ['沙拉', 320], ['三明治', 380],
  ['燕麦', 300], ['鸡蛋', 80], ['酸奶', 150], ['香蕉', 100], ['苹果', 90], ['水果', 120], ['面包', 260],
  ['奶茶', 380], ['咖啡', 120], ['美式', 15], ['拿铁', 190], ['蛋糕', 420], ['火锅', 1100], ['烧烤', 900],
  ['外卖', 750], ['轻食', 420], ['鸡胸', 260], ['粥', 220],
]
// 过去某天：一周前 / 3 天前 / 前天 / 上周三 / 10月28日 / 10/28 → 那天 0 点
const CN = { 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }
const cnNum = (x) => (/^\d+$/.test(x) ? +x : x === '十' ? 10 : x.length === 2 && x[0] === '十' ? 10 + CN[x[1]] : x.length === 2 && x[1] === '十' ? CN[x[0]] * 10 : CN[x] || null)
export function pastDay(text, now = Date.now()) {
  const t = String(text || ''), d0 = startOfDay(now)
  let m = t.match(/([一两二三四五六七八九十\d]{1,3})\s*(天|日|周|个?星期|个?礼拜|个月)(?:之)?前/)
  if (m) { const n = cnNum(m[1]); if (n) { const days = /周|星期|礼拜/.test(m[2]) ? n * 7 : /月/.test(m[2]) ? n * 30 : n; return { day: d0 - days * DAY, str: m[0] } } }
  m = t.match(/上(?:个)?(?:周|星期|礼拜)([一二三四五六日天])?/)
  if (m) {
    if (!m[1]) return { day: d0 - 7 * DAY, str: m[0] }
    const want = '日一二三四五六'.indexOf(m[1] === '天' ? '日' : m[1])
    const dow = new Date(now).getDay(), mon = d0 - ((dow + 6) % 7) * DAY   // 本周一
    return { day: mon - 7 * DAY + ((want + 6) % 7) * DAY, str: m[0] }
  }
  m = t.match(/大前天/); if (m) return { day: d0 - 3 * DAY, str: m[0] }
  m = t.match(/前天/); if (m) return { day: d0 - 2 * DAY, str: m[0] }
  m = t.match(/昨天|昨晚|昨日|昨早/); if (m) return { day: d0 - DAY, str: m[0] }
  m = t.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?|(?:^|[^\d.])(\d{1,2})\/(\d{1,2})(?![\d/])/)
  if (m) {
    const mo = +(m[1] || m[3]), da = +(m[2] || m[4])
    if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31) {
      const y = new Date(now).getFullYear()
      let day = new Date(y, mo - 1, da).getTime()
      if (day > d0) day = new Date(y - 1, mo - 1, da).getTime()
      if (day < d0) return { day, str: m[0].replace(/^[^\d]/, '') }
    }
  }
  return null
}

// 「走了 8000 步」「1.2 万步」：步数原样保留，时长按每分钟约 110 步估
export function stepsIn(text) {
  const m = String(text || '').match(/(\d+(?:\.\d+)?)\s*(万|千|k|K)?\s*步/)
  if (!m) return null
  const v = +m[1] * (m[2] === '万' ? 10000 : m[2] ? 1000 : 1)
  return v >= 100 ? Math.round(v) : null
}
export const stepsText = (n) => Math.round(n).toLocaleString('en-US') + ' 步'
const WORKOUT = [
  ['走路', 3.5, '走路'], ['走了', 3.5, '走路'], ['步行', 3.5, '走路'],
  ['跑步', 10.5, '跑步'], ['跑', 10.5, '跑步'], ['健身', 6.5, '力量训练'], ['力量', 6.5, '力量训练'], ['撸铁', 6.5, '力量训练'],
  ['骑行', 8, '骑行'], ['骑车', 8, '骑行'], ['游泳', 9, '游泳'], ['瑜伽', 3.5, '瑜伽'], ['羽毛球', 7, '羽毛球'],
  ['篮球', 8, '篮球'], ['散步', 3.5, '散步'], ['遛狗', 3, '遛狗'], ['爬山', 7, '爬山'], ['跳绳', 11, '跳绳'],
]
const MEAL_WORDS = [['早饭', 'breakfast'], ['早餐', 'breakfast'], ['午饭', 'lunch'], ['午餐', 'lunch'], ['中饭', 'lunch'], ['晚饭', 'dinner'], ['晚餐', 'dinner'], ['夜宵', 'snack'], ['加餐', 'snack'], ['下午茶', 'snack']]
export const MEAL_NAME = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
const MONEY_CATS = [
  ['餐饮', ['饭', '餐', '面', '奶茶', '咖啡', '外卖', '火锅', '烧烤', '零食', '水果']],
  ['交通', ['打车', '地铁', '公交', '油费', '加油', '停车', '高铁', '机票', '滴滴']],
  ['订阅', ['会员', '订阅', '续费', '云存储', 'icloud', 'iCloud']],
  ['居家', ['房租', '水电', '物业', '燃气', '网费', '话费']],
  ['宠物', ['狗粮', '猫粮', '宠物', '洗澡', '疫苗']],
  ['运动', ['健身卡', '球鞋', '跑鞋', '私教', '球拍']],
  ['购物', ['买', '衣服', '鞋', '淘宝', '京东']],
]
const INCOME_WORDS = ['工资', '收入', '报销', '奖金', '红包', '退款']
const MET_KCAL_PER_MIN = (met) => (met * 3.5 * 68) / 200 // 按 68kg 估

const guessKcal = (text, meal) => {
  let total = 0, hits = []
  for (const [w, k] of FOOD_KCAL) if (text.includes(w) && !hits.some((h) => h.includes(w))) { total += k; hits.push(w) }
  if (!total) total = meal === 'snack' ? 220 : meal === 'breakfast' ? 380 : 600
  return total
}
const catOf = (text) => { for (const [c, ws] of MONEY_CATS) if (ws.some((w) => text.includes(w))) return c; return '其他' }

// ---------- 一句话解析 ----------
// 返回 { tokens: [{text, domain}], records: [...], effects: Set(domain) }
export function parse(input, now = Date.now(), mine = {}) {
  const text = (input || '').trim()
  const out = { tokens: [], records: [], effects: new Set(), text }
  if (!text) return out
  const mark = (str, domain) => { if (str && text.includes(str)) out.tokens.push({ text: str, domain }) }

  const past = pastDay(text, now)
  const dayShift = /明天/.test(text) ? 1 : /后天/.test(text) ? 2 : past ? Math.round((past.day - startOfDay(now)) / DAY) : 0
  if (dayShift > 0) mark(text.match(/明天|后天/)[0], 'time')
  if (past) mark(past.str, 'time')
  const base = startOfDay(now) + dayShift * DAY
  const clock = text.match(/(\d{1,2})[:：点](\d{2})?(?:分)?/)
  const clockAt = (fallback) => {
    if (!clock) return dayShift ? base + fallback * 3600000 : now
    let h = +clock[1], m = clock[2] ? +clock[2] : 0
    if (/下午|晚上/.test(text) && h < 12) h += 12
    return base + (h + m / 60) * 3600000
  }

  // 金额：¥32 / 32元 / 32块 / 句中单独的数（排除时间、分钟、公里、kg、小时）
  let amount = null, amountStr = null
  const am = text.match(/[¥￥]\s?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s?(?:元|块钱|块)/)
  if (am) { amount = +(am[1] || am[2]); amountStr = am[0] }
  else {
    const bare = text.replace(/\d{1,2}[:：点]\d{0,2}/g, ' ').match(/(?:^|[^\d.])(\d+(?:\.\d+)?)(?!\s?(?:分钟|min|公里|km|kg|斤|小时|h|个|次|杯|碗|千卡|卡|%|号|日|月|点))/i)
    if (bare) { amount = +bare[1]; amountStr = bare[1] }
  }

  // 体重
  const wt = text.match(/(?:体重|称重|重)\s*(\d{2,3}(?:\.\d)?)|(\d{2,3}(?:\.\d)?)\s?(?:kg|公斤)/i)
  if (wt && !/跑|骑/.test(text)) {
    const v = +(wt[1] || wt[2])
    out.records.push({ id: uid(), type: 'weight', t: dayShift < 0 ? clockAt(8) : now, kg: v, title: '体重 ' + v + ' kg' })
    out.tokens.push({ text: wt[0], domain: 'body' }); out.effects.add('body')
    return out
  }

  // 睡眠
  const sl = text.match(/睡了?\s*(\d+(?:\.\d+)?)\s*(?:个)?(?:小时|h)/i)
  const sl2 = text.match(/(\d{1,2})[:：点](\d{2})?\s*睡.*?(\d{1,2})[:：点](\d{2})?\s*起/)
  if (sl || sl2) {
    let hours, bedT
    if (sl2) {
      let b = +sl2[1] + (sl2[2] ? +sl2[2] / 60 : 0), w = +sl2[3] + (sl2[4] ? +sl2[4] / 60 : 0)
      if (b < 12) b += 24
      hours = w + 24 - b
      bedT = startOfDay(now) - DAY + b * 3600000
    } else {
      hours = +sl[1]
      bedT = startOfDay(now) + 7 * 3600000 - hours * 3600000
    }
    out.records.push({ id: uid(), type: 'sleep', t: bedT, hours, title: '睡了 ' + fmtHM(hours) })
    out.tokens.push({ text: (sl2 || sl)[0], domain: 'sleep' }); out.effects.add('sleep'); out.effects.add('time')
    return out
  }

  // 运动
  const steps = stepsIn(text)
  const wk = WORKOUT.find(([w]) => text.includes(w)) || (steps ? ['步', 3.5, '走路'] : null)
  if (wk && !/买|会员|卡/.test(text)) {
    const mins = text.match(/(\d+(?:\.\d+)?)\s*(分钟|min|小时|h)/i)
    const km = text.match(/(\d+(?:\.\d+)?)\s*(?:公里|km)/i)
    let minutes = mins ? (+mins[1]) * (/小时|h/i.test(mins[2]) ? 60 : 1) : steps ? Math.round(steps / 110) : km ? Math.round(+km[1] * 6) : 45
    const kcal = steps ? Math.round(steps * 0.04) : Math.round(MET_KCAL_PER_MIN(wk[1]) * minutes)
    const isPlan = !!clock && (dayShift > 0 || clockAt(19) > now)
    mark(wk[0], 'move'); if (mins) mark(mins[0], 'move'); if (km) mark(km[0], 'move'); if (clock) mark(clock[0], 'time')
    if (isPlan) {
      const t = clockAt(19)
      out.records.push({ id: uid(), type: 'event', t, end: t + minutes * 60000, title: wk[2], domain: 'move', minutes, kcal })
      out.effects.add('time'); out.effects.add('move')
    } else {
      out.records.push({ id: uid(), type: 'workout', t: dayShift < 0 ? clockAt(18.5) : now - minutes * 60000, minutes, kcal, kind: wk[2], km: km ? +km[1] : null, steps, title: wk[2] + ' ' + (steps ? stepsText(steps) : minutes + ' 分钟') })
      out.effects.add('move'); out.effects.add('food'); out.effects.add('time')
    }
    if (amount && /私教|门票|场地/.test(text)) {
      out.records.push({ id: uid(), type: 'expense', t: now, amount, cat: '运动', title: wk[2] + '费用' })
      out.effects.add('money')
    }
    linkAll(out.records)
    return out
  }

  // 收入
  if (INCOME_WORDS.some((w) => text.includes(w)) && amount) {
    const w = INCOME_WORDS.find((x) => text.includes(x))
    out.records.push({ id: uid(), type: 'income', t: now, amount, title: w })
    mark(w, 'money'); mark(amountStr, 'money'); out.effects.add('money')
    return out
  }

  // 待办
  const todo = text.match(/^(?:待办|记得|提醒我|别忘了|要)\s*(.+)$/)
  if (todo) {
    const body = todo[1].replace(/[¥￥]?\s?\d+(\.\d+)?\s?(元|块)?/, '').trim()
    out.records.push({ id: uid(), type: 'todo', t: now, title: body, amount: amount || null, cat: amount ? catOf(body) : null, done: false })
    mark(todo[0].slice(0, todo[0].length - todo[1].length).trim(), 'time'); if (amountStr) mark(amountStr, 'money')
    out.effects.add('time'); if (amount) out.effects.add('money')
    return out
  }

  // 一餐（可同时是一笔钱）
  const meal = MEAL_WORDS.find(([w]) => text.includes(w))
  const rest = text
    .replace(amountStr || '\u0000', ' ').replace(clock ? clock[0] : '\u0000', ' ').replace(meal ? meal[0] : '\u0000', ' ')
    .replace(/明天|后天|昨天|昨晚|今天|今早|早上|上午|中午|下午|晚上|刚才|刚刚|吃了|喝了|花了|元|块钱|[¥￥]/g, ' ')
  const items = NOT_FOOD.test(text) ? [] : splitFoods(rest, mine)
  // 没有任何别的信号、又是很短的一个词：大概率是吃的，按当前时间算一餐
  const bare = !meal && !items.length && !amount && !clock && !NOT_FOOD.test(text) && /^[\u4e00-\u9fa5]{1,6}$/.test(rest.trim())
  if (meal || items.length || bare) {
    const t = clock ? clockAt(12) : dayShift ? base + 12 * 3600000 : now
    const mealKey = meal ? meal[1] : guessMeal(t)
    const fallback = mealKey === 'snack' ? 220 : mealKey === 'breakfast' ? 380 : 600
    const list = items.length ? items : [{ name: rest.trim() || MEAL_NAME[mealKey], qty: 1, kcal: fallback, per: fallback, unit: '份', source: 'unknown' }]
    const kcal = list.reduce((a, i) => a + i.kcal, 0)
    const title = list.map((i) => i.name + (i.qty !== 1 ? ' ×' + i.qty : '')).join(' · ')
    out.records.push({ id: uid(), type: 'meal', t, meal: mealKey, kcal, title, items: list, estimated: true })
    if (meal) mark(meal[0], 'food')
    list.forEach((i) => mark(i.name, 'food'))
    out.effects.add('food'); out.effects.add('body'); out.effects.add('time')
    if (amount) {
      out.records.push({ id: uid(), type: 'expense', t, amount, cat: '餐饮', title })
      mark(amountStr, 'money'); out.effects.add('money')
    }
    linkAll(out.records)
    return out
  }

  // 日程
  if (clock && !amount) {
    const t = clockAt(9)
    const title = text.replace(clock[0], '').replace(/明天|后天|今天|上午|下午|晚上/g, '').trim() || '日程'
    out.records.push({ id: uid(), type: 'event', t, end: t + 3600000, title, domain: 'time' })
    mark(clock[0], 'time'); out.effects.add('time')
    return out
  }

  // 其他花销
  if (amount) {
    const title = text.replace(amountStr, '').replace(/花了|买了|付了/g, '').trim() || '一笔花销'
    out.records.push({ id: uid(), type: 'expense', t: now, amount, cat: catOf(text), title })
    mark(amountStr, 'money'); out.effects.add('money')
    for (const [, ws] of MONEY_CATS) { const w = ws.find((x) => text.includes(x)); if (w) { mark(w, 'money'); break } }
    return out
  }
  return out
}

export const guessMeal = (t) => { const h = hourOf(t); return h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 17 ? 'snack' : h < 21 ? 'dinner' : 'snack' }
function linkAll(rs) { if (rs.length > 1) { const g = 'g' + rs[0].id; rs.forEach((r) => { r.link = g }) } }

// 把一条记录展开成它的副作用（完成运动日程、勾掉带金额的待办）
export function completeEvent(ev, now = Date.now()) {
  const t = Math.min(ev.t, now)
  return { id: uid(), type: 'workout', t, minutes: ev.minutes || 45, kcal: ev.kcal || 300, kind: ev.title, title: ev.title + ' ' + (ev.minutes || 45) + ' 分钟', from: ev.id }
}
export function todoToExpense(todo, now = Date.now()) {
  return { id: uid(), type: 'expense', t: now, amount: todo.amount, cat: todo.cat || catOf(todo.title), title: todo.title, from: todo.id }
}

// ---------- 派生 ----------
export function derive(records, now = Date.now()) {
  const today = startOfDay(now)
  const inDay = (r, d) => r.t >= d && r.t < d + DAY
  const T = records.filter((r) => inDay(r, today))
  const sum = (arr, k) => arr.reduce((s, r) => s + (r[k] || 0), 0)

  const meals = T.filter((r) => r.type === 'meal').sort((a, b) => a.t - b.t)
  const workouts = T.filter((r) => r.type === 'workout')
  const kcalIn = sum(meals, 'kcal'), burned = sum(workouts, 'kcal')
  const allowance = GOALS.kcal + burned - kcalIn

  const d = new Date(now), y = d.getFullYear(), m = d.getMonth()
  const monthStart = new Date(y, m, 1).getTime(), daysInMonth = new Date(y, m + 1, 0).getDate()
  const dayOfMonth = d.getDate()
  const exp = records.filter((r) => r.type === 'expense')
  const monthExp = exp.filter((r) => r.t >= monthStart)
  const spent = sum(monthExp, 'amount'), todaySpent = sum(exp.filter((r) => inDay(r, today)), 'amount')
  const pendingBills = records.filter((r) => r.type === 'todo' && !r.done && r.amount).reduce((s, r) => s + r.amount, 0)
  const remaining = GOALS.budget - spent
  const daysLeft = daysInMonth - dayOfMonth + 1
  const perDay = Math.max(0, (remaining - pendingBills) / daysLeft)
  const fixed = monthExp.filter((r) => r.cat === '居家').reduce((a, r) => a + r.amount, 0)
  const pace = fixed + ((spent - fixed) / dayOfMonth) * daysInMonth
  const byCat = {}
  monthExp.forEach((r) => { byCat[r.cat] = (byCat[r.cat] || 0) + r.amount })
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1])

  // 睡眠：按「醒来那天」归档
  const sleeps = records.filter((r) => r.type === 'sleep').sort((a, b) => a.t - b.t)
  const wakeDay = (s) => startOfDay(s.t + s.hours * 3600000)
  const lastNight = sleeps.filter((s) => wakeDay(s) === today).pop() || null
  const week = []
  for (let i = 6; i >= 0; i--) {
    const day = today - i * DAY
    const s = sleeps.filter((x) => wakeDay(x) === day).pop()
    const w = records.filter((r) => r.type === 'workout' && inDay(r, day))
    const mk = records.filter((r) => r.type === 'meal' && inDay(r, day))
    const ex = exp.filter((r) => inDay(r, day))
    week.push({
      day, label: '日一二三四五六'[new Date(day).getDay()], today: i === 0,
      sleep: s ? { bed: hourOf(s.t) < 12 ? hourOf(s.t) + 24 : hourOf(s.t), hours: s.hours } : null,
      workoutMin: sum(w, 'minutes'), workoutKcal: sum(w, 'kcal'), steps: sum(w, 'steps'), kcalIn: sum(mk, 'kcal'), spend: sum(ex, 'amount'),
    })
  }
  const sleepAvg = avg(week.filter((x) => x.sleep).map((x) => x.sleep.hours))
  const weekWorkouts = week.filter((x) => x.workoutMin > 0).length
  const weekMinutes = sum(week, 'workoutMin')
  const weekKcal = sum(week, 'workoutKcal')

  const weights = records.filter((r) => r.type === 'weight').sort((a, b) => a.t - b.t)
  const wNow = weights.length ? weights[weights.length - 1].kg : null
  const wWeekAgo = weights.filter((r) => r.t <= now - 6 * DAY).pop()
  const wDelta = wNow != null && wWeekAgo ? wNow - wWeekAgo.kg : null

  const events = records.filter((r) => r.type === 'event').sort((a, b) => a.t - b.t)
  const todayEvents = events.filter((e) => inDay(e, today))
  const next = events.find((e) => (e.end || e.t) > now && !e.done && e.t < today + 2 * DAY) || null
  // 已归档的不显示；前几天就做完的，第二天自动收起来
  const todos = records.filter((r) => r.type === 'todo' && !r.archived && !(r.done && r.doneAt && r.doneAt < today)).sort((a, b) => a.done - b.done || (a.done ? (b.doneAt || 0) - (a.doneAt || 0) : a.t - b.t))   // 刚做完的排在已完成的最前面，紧挨着没做完的

  // 35 天每日花销
  const heat = []
  for (let i = 34; i >= 0; i--) { const day = today - i * DAY; heat.push({ day, v: sum(exp.filter((r) => inDay(r, day)), 'amount') }) }

  // 时间线：今天所有东西，按 link 合并
  const groups = new Map()
  T.filter((r) => r.type !== 'todo' && r.type !== 'event').forEach((r) => {
    const k = r.link || r.id
    if (!groups.has(k)) groups.set(k, { key: k, t: r.t, items: [] })
    groups.get(k).items.push(r)
    groups.get(k).t = Math.min(groups.get(k).t, r.t)
  })
  if (lastNight && !T.includes(lastNight)) groups.set(lastNight.id, { key: lastNight.id, t: lastNight.t + lastNight.hours * 3600000, items: [lastNight], wake: true })
  const timeline = [...groups.values()].sort((a, b) => b.t - a.t)

  const S = {
    now, today, meals, workouts, kcalIn, burned, allowance, spent, todaySpent, remaining, perDay, pace, daysLeft, dayOfMonth, daysInMonth,
    cats, pendingBills, lastNight, week, sleepAvg, weekWorkouts, weekMinutes, weekKcal, wNow, wDelta, weights, events, todayEvents, next, todos, heat, timeline,
  }
  S.insights = insights(S, records)
  S.nextAdvice = adviceFor(S)
  return S
}

const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)

// ---------- 关联：一个领域的变化怎么影响另一个 ----------
function insights(S, records) {
  const list = []
  const h = hourOf(S.now)
  if (S.lastNight && S.lastNight.hours < 6.5) {
    list.push({ id: 'sleep-move', from: 'sleep', to: 'move', tone: 'warn', ev: ['sleep.last', 'next.title'],
      text: '昨晚只睡了 ' + fmtHM(S.lastNight.hours) + '，今天的训练强度降一档，早点睡比多练有用。' })
  }
  if (S.burned > 0) {
    list.push({ id: 'move-food', from: 'move', to: 'food', tone: 'good', ev: ['move.today', 'energy.num'],
      text: '今天练掉 ' + num(S.burned) + ' 千卡，晚饭的额度多了这么多，还能吃 ' + num(Math.max(0, S.allowance)) + '。' })
  }
  if (S.allowance < 0) {
    list.push({ id: 'food-body', from: 'food', to: 'body', tone: 'warn', ev: ['energy.num', 'body.num'],
      text: '今天已超出 ' + num(-S.allowance) + ' 千卡。散步 ' + Math.ceil(-S.allowance / 4) + ' 分钟能补回来。' })
  }
  const over = S.pace - GOALS.budget
  if (S.dayOfMonth >= 3) {
    if (over > 50) list.push({ id: 'money-pace', from: 'money', to: 'money', tone: 'warn', ev: ['money.today', 'money.perday'],
      text: '按现在的速度，月底会超支 ' + money(over) + '。每天控制在 ' + money(S.perDay) + ' 以内就不会。' })
    else list.push({ id: 'money-pace', from: 'money', to: 'money', tone: 'good', ev: ['money.today', 'money.num'],
      text: '照这个节奏，月底还能剩 ' + money(-over) + '。' })
  }
  // 睡眠 ↔ 吃饭花销：最近 14 天
  const DAYMS = 86400000, rows = []
  for (let i = 1; i <= 14; i++) {
    const day = S.today - i * DAYMS
    const s = records.find((r) => r.type === 'sleep' && startOfDay(r.t + r.hours * 3600000) === day)
    if (!s) continue
    const food = records.filter((r) => r.type === 'expense' && r.cat === '餐饮' && r.t >= day && r.t < day + DAYMS).reduce((a, r) => a + r.amount, 0)
    rows.push({ short: s.hours < 7, food })
  }
  const a = rows.filter((r) => r.short).map((r) => r.food), b = rows.filter((r) => !r.short).map((r) => r.food)
  if (a.length >= 2 && b.length >= 2 && avg(a) - avg(b) > 8) {
    list.push({ id: 'sleep-money', from: 'sleep', to: 'money', tone: 'info', ev: ['sleep.bars', 'money.today'],
      text: '最近两周，睡不到 7 小时的日子，你在吃上平均多花 ' + money(avg(a) - avg(b)) + '。' })
  }
  if (S.wDelta != null) {
    list.push({ id: 'body', from: 'food', to: 'body', tone: S.wDelta <= 0 ? 'good' : 'info', ev: ['energy.eaten', 'body.line'],
      text: '体重一周' + (S.wDelta <= 0 ? '轻了 ' : '重了 ') + Math.abs(S.wDelta).toFixed(1) + ' kg，' + (S.wDelta <= 0 ? '吃和练的节奏是对的。' : '这周吃得比消耗多。') })
  }
  if (S.pendingBills > 0) {
    list.push({ id: 'bills', from: 'time', to: 'money', tone: 'info', ev: ['todos.amount', 'money.perday'],
      text: '待办里还有 ' + money(S.pendingBills) + ' 要付，已经从每日可花里预留。' })
  }
  if (S.weekWorkouts < GOALS.workoutsPerWeek && h > 12) {
    list.push({ id: 'move-goal', from: 'move', to: 'time', tone: 'info', ev: ['move.count', 'week.move'],
      text: '这周练了 ' + S.weekWorkouts + ' 次，离 ' + GOALS.workoutsPerWeek + ' 次还差 ' + (GOALS.workoutsPerWeek - S.weekWorkouts) + ' 次。' })
  }
  // ---- 第一天就能用的关系：用今天已经记下的数据推下一步 ----
  const hm2 = (x) => { const m = Math.round(((x % 24) + 24) % 24 * 60); return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60) }
  // 吃到哪儿了 → 下一餐留多少
  if (S.kcalIn > 0 && S.allowance > 0) {
    const next = h < 11 ? 'lunch' : h < 17.5 ? 'dinner' : null
    if (next && !S.meals.some((m) => m.meal === next)) {
      const leave = Math.round((S.allowance * (next === 'lunch' ? 0.5 : 0.9)) / 10) * 10
      list.push({ id: 'food-next', from: 'food', to: 'time', tone: 'info', ev: ['energy.eaten', 'slot.' + next],
        text: '已经吃了 ' + num(S.kcalIn) + ' 千卡，' + (next === 'lunch' ? '午饭吃 ' + num(leave) + ' 千卡左右，晚饭还能留 ' + num(S.allowance - leave) + '。' : '晚饭还能吃 ' + num(leave) + ' 千卡左右。') })
    }
  }
  // 睡够了 → 今天适合练
  if (S.lastNight && S.lastNight.hours >= 7 && h < 20 && !S.workouts.length) {
    const planned = S.events.find((e) => e.domain === 'move' && !e.done && e.t > S.now && e.t < S.today + DAYMS)
    list.push({ id: 'sleep-good', from: 'sleep', to: 'move', tone: 'good', ev: ['sleep.last', planned ? 'next.title' : 'move.count'],
      text: '昨晚睡了 ' + fmtHM(S.lastNight.hours) + '，状态不错，' + (planned ? '今天的' + planned.title + '可以按计划练。' : '今天适合练一次，这周' + (S.weekWorkouts ? '还差 ' + Math.max(0, GOALS.workoutsPerWeek - S.weekWorkouts) + ' 次。' : '还没练过。')) })
  }
  // 几点起的 → 今晚几点睡
  if (S.lastNight && h < 22) {
    const wake = hourOf(S.lastNight.t + S.lastNight.hours * 3600000)
    list.push({ id: 'sleep-tonight', from: 'sleep', to: 'time', tone: 'info', ev: ['sleep.last', 'dial'],
      text: '今天 ' + hm2(wake) + ' 起床，想睡够 ' + GOALS.sleep + ' 小时，今晚 ' + hm2(wake - GOALS.sleep) + ' 前睡下。' })
  }
  // 体重 → 每天吃多少合适
  if (S.wNow != null) {
    const tdee = Math.round((S.wNow * 30) / 50) * 50, gap = tdee - GOALS.kcal
    if (gap > 150) list.push({ id: 'body-food', from: 'body', to: 'food', tone: 'info', ev: ['body.num', 'energy.num'],
      text: '按 ' + S.wNow + ' kg 估，你每天大约消耗 ' + num(tdee) + ' 千卡；每天吃到 ' + num(GOALS.kcal) + '，一周约轻 ' + ((gap * 7) / 7700).toFixed(1) + ' kg。' })
  }

  const rank = (x) => (x.from !== x.to ? 0 : 2) + (x.tone === 'warn' ? 0 : 1)
  return list.sort((a, b) => rank(a) - rank(b))
}

function adviceFor(S) {
  const n = S.next
  if (!n) return null
  if (n.domain === 'move' && S.lastNight && S.lastNight.hours < 6.5) return '没睡够，建议改成 30 分钟轻量'
  if (n.domain === 'move' && S.allowance < 0) return '今天吃多了，正好练掉 ' + num(-S.allowance) + ' 千卡'
  if (n.domain === 'move') return '练完约消耗 ' + num(n.kcal || 300) + ' 千卡，自动记入'
  return null
}

// ---------- 示例数据：最近 5 周 ----------
export function seed(now = Date.now()) {
  let s = 7
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const R = []
  const today = startOfDay(now)
  const at = (day, h) => day + h * 3600000
  const add = (r) => { r.id = uid(); r.sample = true; R.push(r); return r }
  const lunches = [['牛肉面', 32, 620], ['黄焖鸡米饭', 28, 760], ['轻食沙拉', 36, 380], ['麻辣烫', 31, 650], ['饺子', 26, 540], ['盖饭', 30, 720]]
  const dinners = [['番茄炒蛋 + 米饭', 0, 620], ['外卖烧烤', 88, 900], ['火锅', 126, 1100], ['鸡胸沙拉', 0, 420], ['米线', 29, 560]]
  for (let i = 34; i >= 0; i--) {
    const day = today - i * DAY, dow = new Date(day).getDay(), weekend = dow === 0 || dow === 6
    const bed = 23 + rnd() * 1.4 + (weekend ? 0.6 : 0), hours = 6.1 + rnd() * 2 + (weekend ? 0.7 : 0)
    if (i > 0 || true) add({ type: 'sleep', t: at(day - DAY, bed), hours: +hours.toFixed(2), title: '睡了 ' + fmtHM(hours) })
    const short = hours < 7
    if (i === 0) continue
    add({ type: 'meal', t: at(day, 7.7), meal: 'breakfast', kcal: 410, title: '燕麦 · 鸡蛋 · 美式' })
    const L = lunches[Math.floor(rnd() * lunches.length)]
    linkAll([add({ type: 'meal', t: at(day, 12.2), meal: 'lunch', kcal: L[2], title: L[0] }), add({ type: 'expense', t: at(day, 12.2), amount: L[1], cat: '餐饮', title: L[0] })])
    const D = dinners[Math.floor(rnd() * (short ? 5 : 3)) + (short ? 0 : 0)]
    const dm = add({ type: 'meal', t: at(day, 19), meal: 'dinner', kcal: D[2], title: D[0] })
    if (D[1]) linkAll([dm, add({ type: 'expense', t: at(day, 19), amount: D[1] + (short ? 20 : 0), cat: '餐饮', title: D[0] })])
    if (short && rnd() > 0.3) linkAll([add({ type: 'meal', t: at(day, 15.5), meal: 'snack', kcal: 380, title: '奶茶' }), add({ type: 'expense', t: at(day, 15.5), amount: 19, cat: '餐饮', title: '奶茶' })])
    if (!weekend) add({ type: 'expense', t: at(day, 8.6), amount: 6, cat: '交通', title: '地铁' })
    if (rnd() > 0.82) add({ type: 'expense', t: at(day, 20.5), amount: Math.round(60 + rnd() * 240), cat: '购物', title: ['日用品', '书', 'T 恤', '耳机套'][Math.floor(rnd() * 4)] })
    if ([1, 3, 5].includes(dow) || (dow === 0 && rnd() > 0.4)) {
      const k = dow === 0 ? ['骑行', 90, 8] : dow === 3 ? ['跑步', 35, 10.5] : ['力量训练', 55, 6.5]
      add({ type: 'workout', t: at(day, 19.5), minutes: k[1], kcal: Math.round(MET_KCAL_PER_MIN(k[2]) * k[1]), kind: k[0], title: k[0] + ' ' + k[1] + ' 分钟' })
    }
    if (i % 2 === 0) add({ type: 'weight', t: at(day, 7.2), kg: +(69.6 - (34 - i) * 0.035 + (rnd() - 0.5) * 0.3).toFixed(1), title: '称体重' })
  }
  const pdom = new Date(today).getDate()
  if (pdom > 1) add({ type: 'expense', t: new Date(new Date(today).getFullYear(), new Date(today).getMonth(), 1).getTime() + 10 * 3600000, amount: 2800, cat: '居家', title: '房租' })
  else add({ type: 'expense', t: today + 10 * 3600000, amount: 2800, cat: '居家', title: '房租' })
  add({ type: 'expense', t: today - 26 * DAY + 20 * 3600000, amount: 680, cat: '运动', title: '跑鞋' })
  // 今天
  add({ type: 'meal', t: at(today, 7.7), meal: 'breakfast', kcal: 410, title: '燕麦 · 鸡蛋 · 美式' })
  add({ type: 'expense', t: at(today, 8.6), amount: 6, cat: '交通', title: '地铁' })
  linkAll([add({ type: 'meal', t: at(today, 12.17), meal: 'lunch', kcal: 620, title: '牛肉面' }), add({ type: 'expense', t: at(today, 12.17), amount: 32, cat: '餐饮', title: '牛肉面' })])
  add({ type: 'weight', t: at(today, 7.2), kg: 68.4, title: '称体重' })
  const ev = (d, h1, h2, title, domain, extra) => add(Object.assign({ type: 'event', t: at(today + d * DAY, h1), end: at(today + d * DAY, h2), title, domain }, extra || {}))
  ev(0, 9.5, 10.5, '项目周会', 'time'); ev(0, 14, 15.5, '设计评审', 'time')
  ev(0, 19.5, 20.5, '力量训练 · 胸背', 'move', { minutes: 60, kcal: 450 }); ev(0, 22, 22.5, '遛狗', 'time')
  ev(1, 14, 15, '季度复盘', 'time'); ev(1, 19.5, 20.2, '跑步 5 公里', 'move', { minutes: 35, kcal: 420 })
  ev(2, 15, 16, '供应商会议', 'time'); ev(2, 15, 16.5, '方案评审', 'time')
  ev(3, 19.5, 20.5, '力量训练 · 腿', 'move', { minutes: 60, kcal: 450 }); ev(4, 10, 11, '带狗洗澡', 'time', {})
  add({ type: 'todo', t: at(today, 9), title: '续费视频会员', amount: 25, cat: '订阅', done: false })
  add({ type: 'todo', t: at(today, 9.1), title: '买狗粮', amount: 189, cat: '宠物', done: false })
  add({ type: 'todo', t: at(today, 9.2), title: '整理季度复盘材料', amount: null, done: false })
  add({ type: 'todo', t: at(today, 9.3), title: '交方案初稿', amount: null, done: true })
  return R.filter((r) => r.t <= now || r.type === 'event' || r.type === 'todo')
}

// 每条记录会动到哪些卡
export function effectsOf(records) {
  const e = new Set()
  records.forEach((r) => {
    if (r.type === 'meal') { e.add('food'); e.add('body'); e.add('time') }
    if (r.type === 'expense' || r.type === 'income') e.add('money')
    if (r.type === 'workout') { e.add('move'); e.add('food'); e.add('time') }
    if (r.type === 'sleep') { e.add('sleep'); e.add('move') }
    if (r.type === 'weight') e.add('body')
    if (r.type === 'event') { e.add('time'); if (r.domain === 'move') e.add('move') }
    if (r.type === 'todo') { e.add('time'); if (r.amount) e.add('money') }
  })
  e.add('link')
  return e
}

// ---------- AI 结果 → 记录 ----------
const MEAL_KEYS = new Set(['breakfast', 'lunch', 'dinner', 'snack'])
const CATS = new Set(['餐饮', '交通', '购物', '居家', '订阅', '宠物', '运动', '医疗', '娱乐', '社交', '其他'])
const nOr = (v, d) => (typeof v === 'number' && isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && isFinite(+v) ? +v : d)

export function fromAI(res, input, now = Date.now()) {
  const out = { tokens: [], records: [], effects: new Set(), text: input, ai: true, note: (res && res.note) || '' }
  const day0 = startOfDay(now)
  const hm = (s, base) => { const m = /^(\d{1,2})[:：](\d{2})/.exec(String(s || '')); return m ? base + (+m[1] + +m[2] / 60) * 3600000 : null }
  const dayOf = (d) => { if (!d) return day0; const t = new Date(String(d) + 'T00:00:00').getTime(); return isNaN(t) ? day0 : t }
  // 发生在过去某天的记录：AI 给了 date 就用，没给就从原话里找「一周前」「上周三」之类
  const past = pastDay(input, now)
  const baseOf = (r) => { const d = r.date ? dayOf(r.date) : null; return d != null && d < day0 ? d : past ? past.day : day0 }
  const at = (r, h) => { const b = baseOf(r); return b === day0 ? null : hm(r.time, b) ?? b + h * 3600000 }
  if (past) out.tokens.push({ text: past.str, domain: 'time' })
  let mealT = null
  for (const r of (res && res.records) || []) {
    if (!r || typeof r !== 'object') continue
    if (r.type === 'meal') {
      const items = (Array.isArray(r.items) ? r.items : []).filter((i) => i && i.name).map((i) => ({
        name: String(i.name).slice(0, 30), qty: nOr(i.qty, 1), unit: i.unit || '份', kcal: Math.max(0, Math.round(nOr(i.kcal, 0))), source: 'ai',
      }))
      if (!items.length) continue
      let t = at(r, { breakfast: 8, lunch: 12.2, dinner: 18.7, snack: 15 }[r.meal] || 12) ?? hm(r.time, day0)
      if (t == null || t > now + 3600000) t = now
      mealT = t
      const meal = MEAL_KEYS.has(r.meal) ? r.meal : guessMeal(t)
      out.records.push({ id: uid(), type: 'meal', t, meal, kcal: items.reduce((a, i) => a + i.kcal, 0), title: items.map((i) => i.name + (i.qty !== 1 ? ' ×' + i.qty : '')).join(' · '), items, estimated: true, ai: true })
    } else if (r.type === 'expense' && nOr(r.amount, 0) > 0) {
      const title = String(r.title || '一笔花销').slice(0, 30)
      out.records.push({ id: uid(), type: 'expense', t: at(r, 12) ?? now, amount: nOr(r.amount, 0), cat: CATS.has(r.cat) ? r.cat : catOf(title), title, ai: true })
    } else if (r.type === 'income' && nOr(r.amount, 0) > 0) {
      out.records.push({ id: uid(), type: 'income', t: at(r, 10) ?? now, amount: nOr(r.amount, 0), title: String(r.title || '收入'), ai: true })
    } else if (r.type === 'workout') {
      const steps = nOr(r.steps, null) || stepsIn(input)
      const minutes = Math.max(1, Math.round(nOr(r.minutes, steps ? steps / 110 : 45)))
      const kind = String(r.kind || (steps ? '走路' : '运动'))
      out.records.push({ id: uid(), type: 'workout', t: at(r, 18.5) ?? now - minutes * 60000, minutes, kcal: Math.round(nOr(r.kcal, steps ? steps * 0.04 : MET_KCAL_PER_MIN(6) * minutes)), kind, km: nOr(r.km, null), steps: steps || null, title: kind + ' ' + (steps ? stepsText(steps) : minutes + ' 分钟'), ai: true })
    } else if (r.type === 'sleep') {
      const sb = baseOf(r)
      let wake = hm(r.wake, sb), bed = hm(r.bed, sb)
      if (bed != null && new Date(bed).getHours() >= 12) bed -= DAY
      if (wake != null && wake > now) wake -= DAY
      let hours = nOr(r.hours, null)
      if (bed != null && wake != null) { if (wake <= bed) wake += DAY; hours = (wake - bed) / 3600000 }
      if (!hours || hours <= 0 || hours > 16) continue
      if (bed == null) bed = (wake != null ? wake : sb + 7 * 3600000) - hours * 3600000
      out.records.push({ id: uid(), type: 'sleep', t: bed, hours: +hours.toFixed(2), title: '睡了 ' + fmtHM(hours), ai: true })
    } else if (r.type === 'weight' && nOr(r.kg, 0) > 20) {
      out.records.push({ id: uid(), type: 'weight', t: at(r, 8) ?? now, kg: nOr(r.kg, 0), title: '体重 ' + nOr(r.kg, 0) + ' kg', ai: true })
    } else if (r.type === 'event' && r.title) {
      const base = dayOf(r.date)
      const t = hm(r.start, base) ?? base + 9 * 3600000
      const minutes = nOr(r.minutes, null)
      const end = hm(r.end, base) ?? t + (minutes || 60) * 60000
      const domain = r.domain === 'move' ? 'move' : 'time'
      out.records.push({ id: uid(), type: 'event', t, end: end > t ? end : t + 3600000, title: String(r.title).slice(0, 40), domain, ...(domain === 'move' ? { minutes: minutes || Math.round((end - t) / 60000), kcal: Math.round(nOr(r.kcal, 400)) } : {}), ai: true })
    } else if (r.type === 'todo' && r.title) {
      const amount = nOr(r.amount, null)
      out.records.push({ id: uid(), type: 'todo', t: now, title: String(r.title).slice(0, 40), amount: amount && amount > 0 ? amount : null, cat: amount ? catOf(String(r.title)) : null, done: false, ai: true })
    }
  }
  // 吃的和它的花销连在一起
  const meal = out.records.find((r) => r.type === 'meal'), exp = out.records.filter((r) => r.type === 'expense' && r.cat === '餐饮')
  if (meal && exp.length) { exp.forEach((e) => { e.t = meal.t }); linkAll([meal, ...exp]) }
  ;((res && res.tokens) || []).forEach((tk) => { if (tk && tk.text && input.includes(tk.text) && DOMAIN[tk.domain]) out.tokens.push({ text: tk.text, domain: tk.domain }) })
  return out
}

// ---------- 常记：从自己的历史里挑最常记的几句 ----------
const MEAL_WORD = { breakfast: '早饭', lunch: '午饭', dinner: '晚饭', snack: '加餐' }
export function frequent(records, now = Date.now(), n = 6) {
  const since = now - 30 * DAY, groups = new Map()
  records.filter((r) => r.t >= since && r.t <= now).forEach((r) => {
    const k = r.link || r.id
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k).push(r)
  })
  const count = new Map()
  for (const g of groups.values()) {
    const meal = g.find((r) => r.type === 'meal'), exp = g.find((r) => r.type === 'expense'), w = g.find((r) => r.type === 'workout')
    let s = null
    if (meal) s = MEAL_WORD[meal.meal] + ' ' + meal.title.replace(/\s*·\s*/g, ' ') + (exp ? ' ' + Math.round(exp.amount) : '')
    else if (exp) s = exp.title + ' ' + Math.round(exp.amount)
    else if (w) s = w.kind + ' ' + (w.steps ? Math.round(w.steps) + ' 步' : w.minutes + ' 分钟')
    if (s && s.length <= 24) count.set(s, (count.get(s) || 0) + 1)
  }
  return [...count.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, n).map(([s]) => s)
}

// ---------- 今天还空着的格子：按自己的习惯推出来 ----------
// 返回还没记的「空位」：{ key, h(小时), title, hint, phrase, domain }
export function ghostSlots(records, now = Date.now()) {
  const today = startOfDay(now), since = today - 30 * DAY
  const past = records.filter((r) => r.t >= since && r.t < today)
  const T = records.filter((r) => r.t >= today && r.t < today + DAY)
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }
  const top = (arr) => { const c = new Map(); arr.forEach((p) => c.set(p, (c.get(p) || 0) + 1)); const b = [...c].sort((a, b) => b[1] - a[1])[0]; return b && b[1] >= 2 ? b[0] : null }
  const slots = []

  // 昨晚的睡眠
  const sleptToday = records.some((r) => r.type === 'sleep' && startOfDay(r.t + r.hours * 3600000) === today)
  if (!sleptToday) {
    const ss = past.filter((r) => r.type === 'sleep')
    const bed = ss.length >= 3 ? med(ss.map((r) => (hourOf(r.t) < 12 ? hourOf(r.t) + 24 : hourOf(r.t)))) : 23.5
    const wake = ss.length >= 3 ? med(ss.map((r) => hourOf(r.t + r.hours * 3600000))) : 7
    const hm = (h) => Math.floor(h % 24) + ':' + pad(Math.round((h % 1) * 60 / 5) * 5 % 60)
    slots.push({ key: 'sleep', h: wake, title: '昨晚睡得怎么样', hint: ss.length >= 3 ? '平时大约 ' + hm(bed) + ' 睡、' + hm(wake) + ' 起' : '几点睡、几点起？', phrase: '昨晚 ' + hm(bed) + ' 睡 ' + hm(wake) + ' 起', domain: 'sleep' })
  }

  // 称体重
  const ws = past.filter((r) => r.type === 'weight')
  if (ws.length >= 4 && !T.some((r) => r.type === 'weight')) {
    const last = ws.sort((a, b) => a.t - b.t)[ws.length - 1]
    slots.push({ key: 'weight', h: med(ws.map((r) => hourOf(r.t))), title: '称一下体重', hint: '上次 ' + last.kg + ' kg', phrase: '体重 ', domain: 'body' })
  }

  // 三餐
  const DEF = { breakfast: 7.75, lunch: 12.25, dinner: 18.75 }
  for (const m of ['breakfast', 'lunch', 'dinner']) {
    if (T.some((r) => r.type === 'meal' && r.meal === m)) continue
    const ms = past.filter((r) => r.type === 'meal' && r.meal === m)
    const phrase = top(ms.map((r) => {
      const exp = r.link && past.find((e) => e.link === r.link && e.type === 'expense')
      return MEAL_WORD[m] + ' ' + r.title.replace(/\s*·\s*/g, ' ') + (exp ? ' ' + Math.round(exp.amount) : '')
    }))
    slots.push({
      key: m, h: ms.length >= 3 ? med(ms.map((r) => hourOf(r.t))) : DEF[m], title: MEAL_NAME[m],
      hint: phrase ? '常吃 ' + phrase.slice(3) : '吃了什么？', phrase: phrase || MEAL_WORD[m] + ' ', domain: 'food',
    })
  }

  // 工作日的通勤
  const dow = new Date(now).getDay()
  if (dow > 0 && dow < 6) {
    const cm = past.filter((r) => r.type === 'expense' && r.cat === '交通' && hourOf(r.t) < 10.5)
    const phrase = top(cm.map((r) => r.title + ' ' + Math.round(r.amount)))
    if (cm.length >= 5 && phrase && !T.some((r) => r.type === 'expense' && r.cat === '交通')) {
      slots.push({ key: 'commute', h: med(cm.map((r) => hourOf(r.t))), title: '通勤', hint: '平时 ' + phrase, phrase, domain: 'money' })
    }
  }
  return slots
}
