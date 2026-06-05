import { useCallback, useState } from 'react'

export function useContextMenu() {
  const [menu, setMenu] = useState(null)

  const showMenu = useCallback((e, title, body) => {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY, title, body })
  }, [])

  const closeMenu = useCallback(() => setMenu(null), [])

  return { menu, showMenu, closeMenu }
}
