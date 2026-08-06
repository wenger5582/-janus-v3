import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') || ''
  if (!url) return NextResponse.json({ text: '' })

  const fetchTimeout = async (u: string, ms = 4000) => {
    const ctrl = new AbortController()
    const id = setTimeout(() => ctrl.abort(), ms)
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: ctrl.signal } as any)
      return r
    } finally { clearTimeout(id) }
  }

  const proxies = [
    'https://r.jina.ai/' + url,
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
    'https://corsproxy.io/?' + encodeURIComponent(url),
  ]

  for (const p of proxies) {
    try {
      const r = await fetchTimeout(p)
      if (!r || !r.ok) continue
      const html = await r.text()
      if (!html || html.length < 200) continue
      if (html.indexOf('AbuseAlleviation')!== -1) continue
      if (html.length > 400 && html.indexOf('<html') === -1) {
        return NextResponse.json({ text: html.slice(0, 6000) })
      }
      const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []
      const paras = matches.map(function(m){ return m.replace(/<[^>]+>/g, '').trim() }).filter(function(t){ return t.length > 45 }).slice(0, 10).join('\n\n')
      if (paras.length > 100) return NextResponse.json({ text: paras.slice(0, 6000) })
    } catch (e) { continue }
  }
  return NextResponse.json({ text: '' })
}
