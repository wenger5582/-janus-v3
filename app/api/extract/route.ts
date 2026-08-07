import { NextRequest, NextResponse } from 'next/server'

function sacarRealDeGoogleNews(url: string) {
  try {
    const m = url.match(/articles\/([A-Za-z0-9_-]+)/)
    if (!m) return null
    let str = m[1].replace(/-/g, '+').replace(/_/g, '/')
    while (str.length % 4) str += '='
    const decoded = atob(str)
    const found = decoded.match(/https?:\/\/[^"\x00-\x1F\s]+/g)
    if (found) {
      return found.filter(u => u.indexOf('google') === -1).sort((a,b)=>b.length-a.length)[0]
    }
  } catch(e) {}
  return null
}

export async function GET(req: NextRequest) {
  let url = req.nextUrl.searchParams.get('url') || ''
  if (!url) return NextResponse.json({ text: '' })

  // Si es link de Google, intenta sacar el real
  if (url.indexOf('news.google.com')!== -1) {
    const real = sacarRealDeGoogleNews(url)
    if (real) url = real
    else {
      try {
        const r = await fetch('https://r.jina.ai/' + url)
        const txt = await r.text()
        const links = txt.match(/https?:\/\/(?!news\.google\.com|www\.google)[^\s"<>]+/gi) || []
        const candidato = links.filter(l=>l.length>30).sort((a,b)=>b.length-a.length)[0]
        if (candidato) url = candidato.replace(/[\W]+$/, '')
      } catch(e) {}
    }
  }

  try {
    const r = await fetch('https://r.jina.ai/' + url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const txt = await r.text()
    if (txt && txt.length > 300 && txt.indexOf('AbuseAlleviation') === -1 && txt.indexOf('Cobertura de noticias completa') === -1) {
      return NextResponse.json({ text: txt.slice(0, 6000) })
    }
  } catch(e) {}

  return NextResponse.json({ text: '' })
}
