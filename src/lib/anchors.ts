export function slugifyAnchor(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeHeadingText(raw: string): string {
  return raw
    .replace(/^#+\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractH2Headings(content: string): Array<{ title: string; id: string }> {
  const lines = content.split(/\r?\n/)
  const used = new Map<string, number>()
  const result: Array<{ title: string; id: string }> = []

  for (const line of lines) {
    if (!line.startsWith('## ')) continue
    const title = normalizeHeadingText(line)
    const base = slugifyAnchor(title)
    if (!base) continue

    const current = used.get(base) ?? 0
    const next = current + 1
    used.set(base, next)

    const id = next === 1 ? base : `${base}-${next}`
    result.push({ title, id })
  }

  return result
}

export function getUniqueAnchorId(title: string, used: Map<string, number>): string {
  const base = slugifyAnchor(title)
  if (!base) return ''

  const current = used.get(base) ?? 0
  const next = current + 1
  used.set(base, next)

  return next === 1 ? base : `${base}-${next}`
}
