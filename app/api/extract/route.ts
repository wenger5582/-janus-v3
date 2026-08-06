import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') || ''
  if (!url) return NextResponse.json({ text: '' })

  const proxies = [
    'https://r.jina.ai/' + url,
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
    'https://api.allorigins.win/get?url=' + encodeURIComponent(url),
    'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url),
    'https://thingproxy.freeboard.io/fetch/' + url,
    'https://corsproxy.io/?' + encodeURIComponent(url),
  ]

  for (const p of proxies) {
    try {
      const r = await fetch(p, { headers: { 'User-Agent': 'Mozilla/5.0 JanusBot' } })
      let html = ''
      if (p.indexOf('allorigins.win/get')!== -1) {
        const j = await r.json()
        html = j.contents || ''
      } else {
        html = await r.text()
      }
      if (!html || html.length < 200) continue
      if (html.indexOf('AbuseAlleviation')!== -1) continue

      if (html.length > 400 && html.indexOf('<html') === -1) {
        return NextResponse.json({ text: html.slice(0, 6000) })
      }

      const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []
      const paras = matches.map(function(m){ return m.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() })
       .filter(function(t){ return t.length > 45 && t.toLowerCase().indexOf('cookie') === -1 })
       .slice(0, 12).join('\n\n')

      if (paras && paras.length > 120) {
        return NextResponse.json({ text: paras.slice(0, 6000) })
      }
    } catch (e) { continue }
  }

  return NextResponse.json({ text: '' })
}
