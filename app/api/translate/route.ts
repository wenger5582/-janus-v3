import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') || ''
  const target = req.nextUrl.searchParams.get('target') || 'es'
  if (!text) return NextResponse.json({ translated: '' })
  const q = text.slice(0, 1500)

  // 1. Google
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + target + '&dt=t&q=' + encodeURIComponent(q)
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const j = await r.json()
    if (j && j[0]) {
      const t = j[0].map(function(x:any){ return x[0] }).join('')
      if (t && t.length > 2) return NextResponse.json({ translated: t })
    }
  } catch (e) {}

  // 2. MyMemory
  try {
    const url2 = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(q) + '&langpair=auto|' + target
    const r2 = await fetch(url2)
    const j2 = await r2.json()
    const t2 = j2?.responseData?.translatedText
    if (t2) return NextResponse.json({ translated: t2 })
  } catch (e) {}

  // 3. LibreTranslate
  try {
    const r3 = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q, source: 'auto', target: target, format: 'text' })
    })
    const j3 = await r3.json()
    if (j3?.translatedText) return NextResponse.json({ translated: j3.translatedText })
  } catch (e) {}

  return NextResponse.json({ translated: text })
}
