// 日晷 · 主机半边：给页面开一个 /api/rigui 接口，用 DSH 里配好的模型把一句话拆成记录。
// 调模型的方式和 ds-bot 一样：ctx.llm.stream，按块收文字，见到 finish 结束。
export const name = 'dsh-rigui'
export const inject = ['llm', 'connection']

const ROUTE = '/api/rigui'
const TIMEOUT_MS = 25000

const SYSTEM = `你是「日晷」生活记录工具的解析器。把用户随口说的一句话拆成结构化记录。只输出一个 JSON 对象，不要任何解释或代码块标记。

记录类型（字段名必须一致）：
- 吃喝：{"type":"meal","meal":"breakfast|lunch|dinner|snack","time":"HH:MM"|null,"items":[{"name":"麻团","qty":2,"unit":"个","kcal":460}]}
  · 每一样食物或饮料单独一项；kcal 是这一项按数量算好的总热量，按中国大陆日常一份的分量估，整数。
  · 认识的地方小吃、品牌、菜名都要估，不要漏；实在没听过就按最像的东西估。
  · 没说是哪一餐时按时间判断：早于 10:30 早餐，10:30–14:30 午餐，17:00–21:00 晚餐，其余加餐。
- 花销：{"type":"expense","amount":32,"cat":"餐饮|交通|购物|居家|订阅|宠物|运动|医疗|娱乐|社交|其他","title":"牛肉面"}
- 收入：{"type":"income","amount":18000,"title":"工资"}
- 运动：{"type":"workout","kind":"跑步","minutes":30,"km":5|null,"steps":8000|null,"kcal":375}（kcal 是消耗，按用户体重估；用户说的是步数时 steps 原样给出、kind 用「走路」，minutes 按每分钟约 110 步估）
- 睡眠：{"type":"sleep","bed":"HH:MM"|null,"wake":"HH:MM"|null,"hours":7.5}
- 体重：{"type":"weight","kg":68.1}
- 日程（以后要做的、有时间的事）：{"type":"event","title":"…","date":"YYYY-MM-DD","start":"HH:MM","end":"HH:MM"|null,"domain":"move|time","minutes":60|null,"kcal":数字|null}（运动类安排 domain 用 move，并估 minutes 和 kcal）
- 待办（没有具体时间的事）：{"type":"todo","title":"…","amount":数字|null}

规则：
- 吃东西又说了价钱：一条 meal 加一条 expense（cat 用 餐饮，title 用吃的东西）。
- 没写单位的数字，按语境判断是钱、分钟还是数量；不确定时，吃饭语境里的两位数多半是钱。
- 「昨天」「明天」「今早」等按现在的时间换算成具体日期和时间。
- 说的是过去某天的事（「一周前体重 83.2」「上周三跑了 5 公里」「3 天前吃了火锅」「10月28日花了 200」），在那条记录里加 "date":"YYYY-MM-DD"（按现在的日期往前算）；今天的事不加 date。
- 一句话里可以有多条记录。
- tokens 列出原句里起关键作用的片段及领域（food、money、move、sleep、body、time），片段必须是原句里一字不差的子串。
- note：只有在你明显拿不准时写一句很短的中文说明，否则空字符串。

输出格式：{"records":[…],"tokens":[{"text":"…","domain":"…"}],"note":""}`

function userPrompt(p) {
  const lines = [`现在：${p.now || ''}`, `用户体重：约 ${p.weightKg || 68} kg`]
  const mine = p.mine && Object.keys(p.mine).length ? Object.entries(p.mine).slice(0, 60).map(([k, v]) => `${k} 每份 ${v} 千卡`).join('；') : ''
  if (mine) lines.push(`用户亲自改过的热量（以此为准）：${mine}`)
  lines.push(`这句话：${String(p.text || '').slice(0, 300)}`)
  return lines.join('\n')
}

function extractJSON(text) {
  const t = String(text || '').replace(/```(?:json)?/gi, '').trim()
  const a = t.indexOf('{'), b = t.lastIndexOf('}')
  if (a < 0 || b <= a) throw new Error('模型没有给出可用的结果')
  return JSON.parse(t.slice(a, b + 1))
}

export function apply(ctx) {
  // DSH 的默认模型；同一家里有更快的非推理模型就用它（记一笔要快）
  async function pickModel() {
    const sel = ctx.get?.('agentDefaultModel')?.currentSelection?.()
    let provider = sel?.provider, model = sel?.model
    const providers = ctx.llm.listProviders()
    if (!provider) provider = providers[0]?.id
    if (!provider) throw new Error('DSH 里还没有可用的模型，请先在设置里添加')
    try {
      const models = await ctx.llm.listModels(provider)
      const fast = models.find((m) => /flash|chat|lite|mini|turbo|v3/i.test(m.id) && !/reason|r1|think|pro/i.test(m.id))
      if (fast) model = fast.id
      if (!model) model = models[0]?.id
    } catch {}
    if (!model) throw new Error('DSH 里还没有可用的模型，请先在设置里添加')
    return { provider, model }
  }

  async function ask(system, user, signal) {
    const route = await pickModel()
    const info = await ctx.llm.resolveModelInfo?.(route.provider, route.model).catch(() => undefined)
    const efforts = info?.reasoning?.efforts ?? []
    const effort = efforts.some((e) => e.id === 'off') ? 'off' : efforts.at(0)?.id
    let text = '', finish
    for await (const chunk of ctx.llm.stream({
      provider: route.provider,
      model: route.model,
      ...(effort === undefined ? {} : { reasoningEffort: effort }),
      system,
      messages: [{ role: 'user', content: [{ type: 'text', text: user }] }],
      maxTokens: 1600,
      signal,
    })) {
      if (chunk?.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text
      else if (chunk?.type === 'finish') finish = chunk.reason
    }
    if (finish && (finish.kind === 'error' || finish.kind === 'aborted')) throw new Error(finish.failure?.message || '模型调用失败')
    return { text, model: route.model }
  }

  const json = (obj) => new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json' } })

  ctx.effect(() => ctx.connection.fetch.register({
    path: ROUTE,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      let body = {}
      try { body = await request.json() } catch {}
      const timeout = AbortSignal.timeout(TIMEOUT_MS)
      const signal = request.signal && AbortSignal.any ? AbortSignal.any([request.signal, timeout]) : timeout
      try {
        if (body.endpoint === 'ping') return json({ ok: true })
        if (body.endpoint === 'parse') {
          const r = await ask(SYSTEM, userPrompt(body.payload || {}), signal)
          return json({ ok: true, model: r.model, result: extractJSON(r.text) })
        }
        return json({ ok: false, error: '未知接口' })
      } catch (error) {
        return json({ ok: false, error: error?.name === 'TimeoutError' ? '模型响应超时' : String(error?.message || error) })
      }
    },
  }), 'dsh-rigui: api route')
}
