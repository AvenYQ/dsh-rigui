import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import LifeApp from './App.jsx'
import DialIcon from './icon.jsx'

// 只用于预览：模拟 DSH 左侧边栏，看入口长什么样
const Row = ({ icon, label, on, onClick }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 36, padding: '0 10px', border: 0, borderRadius: 8, background: on ? '#E9EAED' : 'transparent', color: on ? '#111' : '#555', fontSize: 13.5, cursor: 'pointer', font: 'inherit' }}>
    {icon}<span>{label}</span>
  </button>
)
const dot = <span style={{ width: 18, height: 18, borderRadius: 5, background: '#D6D8DC' }} />
function Shell() {
  const [on, setOn] = useState(true)
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'PingFang SC, system-ui, sans-serif' }}>
      <aside style={{ width: 232, flex: 'none', background: '#F7F7F8', borderRight: '1px solid #E6E7EA', padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 600, padding: '4px 10px 14px', color: '#222' }}>DeepSeek Harness</div>
        <Row icon={dot} label="新会话" onClick={() => setOn(false)} />
        <Row icon={dot} label="插件" onClick={() => setOn(false)} />
        <Row icon={dot} label="自动化任务" onClick={() => setOn(false)} />
        <Row icon={<DialIcon />} label="日晷" on={on} onClick={() => setOn(true)} />
        <Row icon={dot} label="DeepSeek Bot" onClick={() => setOn(false)} />
        <div style={{ fontSize: 12, color: '#999', padding: '18px 10px 6px' }}>最近会话</div>
        {['周末去哪儿', '读书笔记整理', '换季衣橱清单'].map((s) => <Row key={s} icon={null} label={s} onClick={() => setOn(false)} />)}
      </aside>
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto', background: on ? '#E8EAE5' : '#fff' }}>
        {on ? <LifeApp /> : <div style={{ padding: 40, color: '#999' }}>（DSH 原本的页面）</div>}
      </main>
    </div>
  )
}
createRoot(document.getElementById('root')).render(<Shell />)
