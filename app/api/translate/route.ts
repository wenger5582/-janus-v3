import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') || ''
  const target = req.nextUrl.searchParams.get('target') || 'es'
  if (!text) return NextResponse.json({ translated: '' })

  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + target + '&dt=t&q=' + encodeURIComponent(text.slice(0, 3000))
    const r = await fetch(url)
    const j = await r.json()
    const translated = j[0].map(function(x:any){ return x[0] }).join('')
    return NextResponse.json({ translated: translated })
  } catch (e) {
    try {
      const url2 = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 500)) + '&langpair=auto|' + target
      const r2 = await fetch(url2)
      const j2 = await r2.json()
      return NextResponse.json({ translated: j2.responseData.translatedText || text })
    } catch (e2) {
      return NextResponse.json({ translated: text })
    }
  }
}
