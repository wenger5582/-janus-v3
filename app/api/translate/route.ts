import { NextRequest, NextResponse } from 'next/server'

function adivinarIdioma(texto: string) {
  const t = texto.toLowerCase()
  if (/[а-яё]/.test(t)) return 'ru'
  if (/[áéíóúñ¿¡]/.test(t) || t.includes(' de la ') || t.includes(' de los ') || t.includes(' que ') || t.includes(' los ')) return 'es'
  if (t.includes(' le ') && t.includes(' de ')) return 'fr'
  return 'en'
}

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') || ''
  const target = req.nextUrl.searchParams.get('target') || 'es'
  if (!text) return NextResponse.json({ translated: '' })

  const clean = text.slice(0, 600).trim()
  if (!clean) return NextResponse.json({ translated: '' })

  const source = adivinarIdioma(clean)
  if (source === target) return NextResponse.json({ translated: clean })

  // 1. MyMemory con idioma detectado ES|RU, EN|ES, etc.
  try {
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(clean) + '&langpair=' + source + '|' + target
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const j = await r.json()
    const t = j?.responseData?.translatedText
    if (t && t.length > 2) {
      return NextResponse.json({ translated: t })
    }
  } catch (e) {}

  // 2. Intento cruzado EN|target si el primero falla
  if (source!== 'en') {
    try {
      const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(clean) + '&langpair=en|' + target
      const r = await fetch(url)
      const j = await r.json()
      const t = j?.responseData?.translatedText
      if (t) return NextResponse.json({ translated: t })
    } catch (e) {}
  }

  // 3. Google como ultimo respaldo
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + source + '&tl=' + target + '&dt=t&q=' + encodeURIComponent(clean)
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const j = await r.json()
    if (j && j[0]) {
      const t = j[0].map(function(x:any){ return x[0] }).join('')
      if (t) return NextResponse.json({ translated: t })
    }
  } catch (e) {}

  return NextResponse.json({ translated: text })
}
