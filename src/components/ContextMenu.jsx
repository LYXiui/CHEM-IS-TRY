import { useEffect } from 'react'

export default function ContextMenu({ menu, onClose }) {
  useEffect(() => {
    if (!menu) return
    const close = () => onClose()
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [menu, onClose])

  if (!menu) return null

  return (
    <div
      className="context-menu"
      style={{ left: menu.x, top: menu.y }}
      role="dialog"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="context-menu-title">{menu.title}</div>
      <p className="context-menu-body">{menu.body}</p>
    </div>
  )
}
