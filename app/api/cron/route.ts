function cleanDescription(raw: string) {
  if (!raw) return ''
  let t = raw.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')
  t = t.replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim()
  return t.slice(0,480)
}
