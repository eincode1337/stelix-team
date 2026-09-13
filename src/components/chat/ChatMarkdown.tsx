

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}


function renderInline(text: string): string {
  let out = ''
  for (const part of text.split(/(`[^`]+`)/g)) {
    if (part === '') continue
    if (/^`[^`]+`$/.test(part)) {
      out += `<code>${esc(part.slice(1, -1))}</code>`
      continue
    }
    for (const bp of part.split(/(\*\*[^*]+\*\*)/g)) {
      if (bp === '') continue
      if (/^\*\*[^*]+\*\*$/.test(bp)) {
        out += `<strong>${esc(bp.slice(2, -2))}</strong>`
        continue
      }
      for (const ip of bp.split(/(\*[^*]+\*)/g)) {
        if (ip === '') continue
        if (/^\*[^*]+\*$/.test(ip)) out += `<em>${esc(ip.slice(1, -1))}</em>`
        else out += esc(ip)
      }
    }
  }
  return out
}

const HR_RE = /^(?:---|\*\*\*|___)$/
const HEADING_RE = /^(#{1,6})\s+(.*)$/
const LIST_RE = /^[-*]\s+/

export function renderChatMarkdownHtml(md: string): string {
  const blocks = md
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean)

  const nodes: string[] = []
  blocks.forEach((block, bi) => {
    if (bi > 0) nodes.push('<div class="md-blank-line"></div>')

    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l !== '')

    let i = 0
    while (i < lines.length) {
      const line = lines[i]

      if (HR_RE.test(line)) {
        nodes.push('<hr>')
        i++
        continue
      }

      const heading = HEADING_RE.exec(line)
      if (heading) {
        const level = Math.min(6, heading[1].length)
        nodes.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
        i++
        continue
      }

      if (LIST_RE.test(line)) {
        const items: string[] = []
        while (i < lines.length && LIST_RE.test(lines[i])) {
          items.push(`<li>${renderInline(lines[i].replace(LIST_RE, ''))}</li>`)
          i++
        }
        nodes.push(`<ul>\n${items.join('\n')}\n</ul>`)
        continue
      }

      const paras: string[] = []
      while (i < lines.length) {
        const l = lines[i]
        if (HR_RE.test(l) || HEADING_RE.test(l) || LIST_RE.test(l)) break
        paras.push(renderInline(l))
        i++
      }
      nodes.push(`<p>${paras.join('<br>\n')}</p>`)
    }
  })

  return nodes.join('\n')
}
