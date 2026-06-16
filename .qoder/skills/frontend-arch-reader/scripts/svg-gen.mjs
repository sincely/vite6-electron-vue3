/**
 * SVG scaffold helper for frontend-arch-reader skill.
 *
 * Usage (called by the agent):
 *   node .qoder/skills/frontend-arch-reader/scripts/svg-gen.mjs \
 *     --type architecture \
 *     --layers UI,Router,Store,API,Infrastructure \
 *     --modules 'Login:负责登录表单交互,Dashboard:仪表盘页面渲染,...'
 *
 * Outputs an SVG string to stdout. The agent then saves it to ./docs/.
 */

import { parseArgs } from 'node:util'

// ─── Skin constants ──────────────────────────────────────────────
const CANVAS_BG = '#F8FAFC'
const TEXT_COLOR = '#0F172A'
const SIDEBAR_WIDTH = 56
const CARD_RX = 6
const CONTAINER_RX = 8
const CARD_GAP_X = 14
const CARD_GAP_Y = 12
const TITLE_HEIGHT = 32
const LINE_HEIGHT = 13
const TITLE_FONT = 11
const DESC_FONT = 9

// ─── Text pixel estimation ──────────────────────────────────────
function estimateTextPixels(text) {
  let px = 0
  for (const ch of text) {
    // CJK range + Chinese punctuation
    if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch)) {
      px += 11
    } else {
      px += 5.5
    }
  }
  return px
}

// ─── Card dimensions ────────────────────────────────────────────
function cardDims(title, desc) {
  const titlePx = estimateTextPixels(title)
  const descPx = estimateTextPixels(desc)
  const maxTextPx = Math.max(titlePx, descPx)
  const width = Math.ceil(maxTextPx + 40)  // +40 padding
  const availWidth = width - 16             // usable inside padding
  const totalLines = Math.ceil(descPx / availWidth) || 1
  const height = TITLE_HEIGHT + totalLines * LINE_HEIGHT
  return { width, height, totalLines }
}

// ─── Layer sidebar colors ───────────────────────────────────────
const LAYER_COLORS = {
  UI: '#3B82F6',
  Router: '#8B5CF6',
  Store: '#10B981',
  API: '#F59E0B',
  Infrastructure: '#6366F1',
}

// ─── Build SVG ──────────────────────────────────────────────────
function buildSvg(type, layers, modulesRaw) {
  const modules = modulesRaw.split(',').map(s => {
    const [name, ...rest] = s.split(':')
    return { name: name.trim(), desc: rest.join(':').trim() || '' }
  })

  if (type === 'architecture') {
    return buildArchitectureSvg(layers, modules)
  }
  // Default: simple card grid
  return buildGenericSvg(modules)
}

function buildArchitectureSvg(layers, modules) {
  const layerList = layers.split(',').map(l => l.trim())
  // Group modules by layer (heuristic: evenly distribute)
  const perLayer = Math.ceil(modules.length / layerList.length)
  const groups = layerList.map((layer, i) =>
    modules.slice(i * perLayer, (i + 1) * perLayer)
  )

  // Compute layout
  let totalHeight = 0
  const layerRows = groups.map((mods, i) => {
    const cards = mods.map(m => ({ ...m, ...cardDims(m.name, m.desc) }))
    const rowHeight = cards.length > 0
      ? Math.max(...cards.map(c => c.height)) + CARD_GAP_Y
      : TITLE_HEIGHT + CARD_GAP_Y  // empty layer row
    totalHeight += rowHeight
    return { layer: layerList[i], cards, rowHeight }
  })
  totalHeight += 20  // top/bottom margin

  const maxRowWidth = Math.max(...layerRows.map(r =>
    r.cards.length > 0
      ? r.cards.reduce((sum, c) => sum + c.width + CARD_GAP_X, 0)
      : 0
  ))
  const svgWidth = SIDEBAR_WIDTH + maxRowWidth + 40

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${totalHeight}" viewBox="0 0 ${svgWidth} ${totalHeight}">\n`
  svg += `  <rect width="${svgWidth}" height="${totalHeight}" rx="${CONTAINER_RX}" fill="${CANVAS_BG}"/>\n`

  let yOffset = 10
  for (const row of layerRows) {
    const color = LAYER_COLORS[row.layer] || '#64748B'
    // Sidebar
    svg += `  <rect x="0" y="${yOffset}" width="${SIDEBAR_WIDTH}" height="${row.rowHeight}" rx="${CONTAINER_RX}" fill="${color}"/>\n`
    // Layer label — vertical center
    const labelY = yOffset + row.rowHeight / 2
    svg += `  <text x="${SIDEBAR_WIDTH / 2}" y="${labelY}" fill="#fff" font-weight="bold" font-size="${TITLE_FONT}" text-anchor="middle" dominant-baseline="middle">${row.layer}</text>\n`

    // Cards
    let xOffset = SIDEBAR_WIDTH + 14
    for (const card of row.cards) {
      // Card background
      svg += `  <rect x="${xOffset}" y="${yOffset}" width="${card.width}" height="${card.height}" rx="${CARD_RX}" fill="#fff" stroke="#E2E8F0" stroke-width="1"/>\n`
      // Title
      svg += `  <text x="${xOffset + 8}" y="${yOffset + 18}" fill="${TEXT_COLOR}" font-weight="bold" font-size="${TITLE_FONT}">${card.name}</text>\n`
      // Desc via foreignObject
      if (card.desc) {
        const foY = yOffset + TITLE_HEIGHT
        svg += `  <foreignObject x="${xOffset + 4}" y="${foY}" width="${card.width - 8}" height="${card.height - TITLE_HEIGHT}">\n`
        svg += `    <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${DESC_FONT}px;color:${TEXT_COLOR};padding:2px 4px;line-height:${LINE_HEIGHT}px;">${card.desc}</div>\n`
        svg += `  </foreignObject>\n`
      }
      xOffset += card.width + CARD_GAP_X
    }
    yOffset += row.rowHeight
  }

  svg += `</svg>`
  return svg
}

function buildGenericSvg(modules) {
  const cards = modules.map(m => ({ ...m, ...cardDims(m.name, m.desc) }))
  const totalWidth = cards.reduce((sum, c) => sum + c.width + CARD_GAP_X, 0) + 40
  const totalHeight = Math.max(...cards.map(c => c.height)) + 40

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">\n`
  svg += `  <rect width="${totalWidth}" height="${totalHeight}" rx="${CONTAINER_RX}" fill="${CANVAS_BG}"/>\n`

  let xOffset = 20
  const yOffset = 20
  for (const card of cards) {
    svg += `  <rect x="${xOffset}" y="${yOffset}" width="${card.width}" height="${card.height}" rx="${CARD_RX}" fill="#fff" stroke="#E2E8F0" stroke-width="1"/>\n`
    svg += `  <text x="${xOffset + 8}" y="${yOffset + 18}" fill="${TEXT_COLOR}" font-weight="bold" font-size="${TITLE_FONT}">${card.name}</text>\n`
    if (card.desc) {
      svg += `  <foreignObject x="${xOffset + 4}" y="${yOffset + TITLE_HEIGHT}" width="${card.width - 8}" height="${card.height - TITLE_HEIGHT}">\n`
      svg += `    <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${DESC_FONT}px;color:${TEXT_COLOR};padding:2px 4px;line-height:${LINE_HEIGHT}px;">${card.desc}</div>\n`
      svg += `  </foreignObject>\n`
    }
    xOffset += card.width + CARD_GAP_X
  }

  svg += `</svg>`
  return svg
}

// ─── CLI entry ──────────────────────────────────────────────────
const { values } = parseArgs({
  options: {
    type: { type: 'string' },
    layers: { type: 'string' },
    modules: { type: 'string' },
  },
})

const svg = buildSvg(values.type || 'architecture', values.layers || 'UI,Router,Store,API,Infrastructure', values.modules || '')
process.stdout.write(svg)
