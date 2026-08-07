import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') || ''
  const target = req.nextUrl.searchParams.get('target') || 'es'
  if (!text) return NextResponse.json({ translated: '' })

  const clean = text.slice(0, 800).trim()
  if (!clean) return NextResponse.json({ translated: '' })

  // 1. MyMemory primero - el mas confiable
  try {
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(clean) + '&langpair=auto|' + target
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const j = await r.json()
    const t = j?.responseData?.translatedText
    if (t && t.length > 2 && t.toLowerCase().indexOf('mymemory warning') === -1) {
      return NextResponse.json({ translated: t })
    }
  } catch (e) {}

  // 2. Google como respaldo
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + target + '&dt=t&q=' + encodeURIComponent(clean)
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const j = await r.json()
    if (j && j[0]) {
      const t = j[0].map(function(x:any){ return x[0] }).join('')
      if (t) return NextResponse.json({ translated: t })
    }
  } catch (e) {}

  return NextResponse.json({ translated: text })
}
