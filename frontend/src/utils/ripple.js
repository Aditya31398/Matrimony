/**
 * Material-style ripple on every button (and button-styled link), added with one
 * delegated listener so components don't need any changes.
 */
const TARGET = 'button, [role="button"], a'

function hasFill(el, style) {
  return style.backgroundImage !== 'none' ||
    !/rgba\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor) ||
    el.tagName === 'BUTTON'
}

/** White ripple on dark/colourful fills, brand-tinted ripple on light ones. */
function rippleColor(style) {
  if (style.backgroundImage !== 'none') return 'rgba(255, 255, 255, 0.45)'
  const [r, g, b, a = 1] = (style.backgroundColor.match(/[\d.]+/g) || []).map(Number)
  if (a === 0) return 'rgba(91, 42, 78, 0.12)'
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.6 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(91, 42, 78, 0.14)'
}

function spawn(e) {
  if (e.button !== 0) return
  const el = e.target.closest(TARGET)
  if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return

  const style = getComputedStyle(el)
  // Plain text links (no background, not a button) keep their normal look
  if (el.tagName === 'A' && !hasFill(el, style)) return
  if (style.position === 'static') el.style.position = 'relative'

  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  // Clipping layer, so the button itself never needs overflow:hidden
  const layer = document.createElement('span')
  layer.className = 'ripple-layer'
  const wave = document.createElement('span')
  wave.className = 'ripple-wave'
  wave.style.width = wave.style.height = `${size}px`
  wave.style.left = `${e.clientX - rect.left - size / 2}px`
  wave.style.top = `${e.clientY - rect.top - size / 2}px`
  wave.style.background = rippleColor(style)
  layer.appendChild(wave)
  el.appendChild(layer)

  wave.addEventListener('animationend', () => layer.remove(), { once: true })
}

export function initRipple() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.addEventListener('pointerdown', spawn, { passive: true })
}
