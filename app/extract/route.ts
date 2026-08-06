import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ text: '' })

  try {
    const r = await fetch('https://r.jina.ai/' + url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const txt = await r.text()
    if (txt && txt.length > 300 && txt.indexOf('AbuseAlleviation') === -1) {
      return NextResponse.json({ text: txt.slice(0, 6000) })
    }
  } catch (e) {}

  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 JanusBot' } })
    const html = await r.text()
    const matches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || []
    const paras = matches.map(function(m){ return m.replace(/<[^>]+>/g, '').trim() }).filter(function(t){ return t.length > 50 }).slice(0, 12).join('\n\n')
    if (paras) return NextResponse.json({ text: paras.slice(0, 6000) })
  } catch (e) {}

  return NextResponse.json({ text: '' })
}
