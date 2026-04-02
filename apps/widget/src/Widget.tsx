import { useState } from 'react'

interface WidgetProps {
  orgId: string
}

export default function Widget({ orgId }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {isOpen && (
        <div style={{
          width: '360px',
          height: '500px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
            <strong>Support Chat</strong>
          </div>
          <div style={{ flex: 1, padding: '16px' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Widget org: {orgId}
            </p>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#6366f1',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        }}
      >
        <span style={{ color: '#fff', fontSize: '24px' }}>
          {isOpen ? '✕' : '💬'}
        </span>
      </button>
    </div>
  )
}