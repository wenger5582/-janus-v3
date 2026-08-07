function cleanDescription(raw: string) {
  if (!raw) return ''
  let t = raw
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  t = t.replace(/<[^>]+>/g, ' ') // quita tags
  t = t.replace(/https?:\/\/\S+/g, '')
  t = t.replace(/\s+/g, ' ').trim()
  return t.slice(0, 480) // IMPORTANTE: ya lo dejamos <500
}

 // y adentro del loop:
let description = cleanDescription(getTag(it, 'description'))
