import React from 'react'
// 侧边栏图标：一个带指针的 24 小时表盘
export default function DialIcon(props) {
  const s = (props && props.size) || 18
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" strokeOpacity=".35" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.2 6.3" />
      <path d="M5.2 17.1a8.5 8.5 0 0 0 4.6 3.1" />
      <path d="M12 12l4.2 3" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
