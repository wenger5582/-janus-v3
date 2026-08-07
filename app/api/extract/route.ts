import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') || ''
  if (!url) return NextResponse.json({ text: '' })

  try {
    const r = await fetch('https://r.jina.ai/' + url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const txt = await r.text()
    if (txt && txt.length > 300 && txt.indexOf('AbuseAlleviation') === -1) {
      return NextResponse.json({ text: txt.slice(0, 6000) })
    }
  } catch (e) {}

  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await r.text()

    // Intenta sacar descripcion OG si no hay <p>
    const og = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) || html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
    const ogText = og? og[1] : ''

    const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []
    let paras = matches.map(function(m){ return m.replace(/<[^>]+>/g, '').trim() }).filter(function(t){ return t.length > 50 }).slice(0, 10).join('\n\n')

    if (!paras && ogText) paras = ogText
    if (paras && paras.length > 50) return NextResponse.json({ text: paras.slice(0, 6000) })
  } catch (e) {}

  return NextResponse.json({ text: '' })
}
