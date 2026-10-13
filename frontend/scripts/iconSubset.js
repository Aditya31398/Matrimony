import fs from 'node:fs'
import path from 'node:path'

/**
 * Production builds request only the Material Symbols glyphs the app uses
 * (≈4 MB → a few KB). Any lowercase string literal or JSX text in src/ that is
 * a real icon name counts as "used", so new icons are picked up automatically;
 * a few extra glyphs from ordinary words like "home" are harmless.
 */
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0..1,0'

function collectIcons(srcDir, valid) {
  const used = new Set()
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const code = fs.readFileSync(full, 'utf8')
        for (const m of code.matchAll(/['"`>]([a-z][a-z0-9_]{1,40})['"`<]/g)) {
          if (valid.has(m[1])) used.add(m[1])
        }
      }
    }
  }
  walk(srcDir)
  return [...used].sort()
}

export default function iconSubset() {
  let isBuild = false
  return {
    name: 'material-symbols-subset',
    configResolved(config) { isBuild = config.command === 'build' },
    // 'pre' so the placeholder is replaced before Vite parses the HTML
    transformIndexHtml: { order: 'pre', handler(html) {
      let href = FONT_URL
      if (isBuild) {
        const names = fs.readFileSync(new URL('./material-symbols-names.txt', import.meta.url), 'utf8')
        const icons = collectIcons(path.resolve('src'), new Set(names.split('\n').filter(Boolean)))
        href += `&icon_names=${icons.join(',')}`
      }
      return html.replace('%MATERIAL_SYMBOLS_URL%', href)
    } },
  }
}
