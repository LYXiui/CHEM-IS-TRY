/** 依背景色亮度決定文字用深色或淺色 */
export function contrastTextColor(bgHex, dark = '#0f172a', light = '#ffffff') {
  if (!bgHex || typeof bgHex !== 'string') return dark
  const hex = bgHex.replace('#', '').trim()
  if (hex.length !== 6 && hex.length !== 3) return dark
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return dark
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.52 ? light : dark
}
