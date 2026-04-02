import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import Widget from './Widget'

function initWidget(config: { orgId: string }) {
  const container = document.createElement('div')
  container.id = 'tinfin-widget-root'
  document.body.appendChild(container)
  
  const root = createRoot(container)
  root.render(createElement(Widget, { orgId: config.orgId }))
}

// Auto-init from script tag
const script = document.currentScript as HTMLScriptElement
const orgId = script?.getAttribute('data-org-id') || ''

if (orgId) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initWidget({ orgId }))
  } else {
    initWidget({ orgId })
  }
}

export { initWidget }