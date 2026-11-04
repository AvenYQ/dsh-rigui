import React from 'react'
import LifeApp from './App.jsx'
import DialIcon from './icon.jsx'

const PANEL = 'rigui'

function LifePanel() {
  return (
    <div className="lf-host" style={{ flex: 'auto', width: '100%', minWidth: 0, height: '100%', minHeight: 0, overflowX: 'hidden', overflowY: 'auto', overscrollBehavior: 'contain', background: '#E8EAE5' }}>
      <LifeApp />
    </div>
  )
}

export const isPlugin = true
export const inject = ['slots']
export function apply(ctx) {
  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register({ name: 'sidebar.panellist', id: PANEL, order: 5, label: () => '日晷' }, DialIcon))
  ctx.slots.inject('main', () =>
    ctx.slots.register({ name: 'main', key: PANEL }, LifePanel))
}
