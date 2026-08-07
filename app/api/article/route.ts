// @ts-nocheck
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function decodeGoogleNewsUrl(googleUrl: string): string | null {
  try {
    const m = googleUrl.match(/\/articles\/([^?&#]+)/)
    if (!m) return null
    let id = m[1]
    let b64 = id.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const buf = Buffer.from(b64, 'base64')
    const str = buf.toString('latin1')
    const urls = str.match(/https?:\/\/[^\s\x00-\x1F"]+/g)
    if (!urls) return null
    const candidates = urls.filter(u =>!u.includes('google.com') &&!u.includes('gstatic') && u.length > 25)
    if (!candidates.length) return null
    // el más largo suele ser el real
    return candidates.sort((a,b)=>b.length-a.length)[0].split('\x08')[0].split('\x13')[0].split('\x22')[0]
  } catch { return null }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  let url = searchParams.get('url')
  if (!url) return Response.json({ text: '' })

  let realUrl = url

  // Si es link de Google News, decodifica a franceinfo, bbc, etc.
  if (url.includes('news.google.com')) {
    const decoded = decodeGoogleNewsUrl(url)
    if (decoded) {
      realUrl = decoded
    } else {
      try {
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, cache: 'no-store' })
        const html = await r.text()
        const hrefs = [...html.matchAll(/href="(https:\/\/[^"]+)"/gi)].map(x=>x[1]).filter(u=>!u.includes('google.com') &&!u.includes('googleusercontent'))
        if (hrefs[0]) realUrl = hrefs[0]
      } catch {}
    }
  }

  try {
    const res = await fetch(realUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      redirect: 'follow',
      cache: 'no-store'
    })
    const html = await res.text()
    const paragraphs: string[] = []
    const regex = /<p[^>]*>(.*?)<\/p>/gi
    let match
    while ((match = regex.exec(html))!== null) {
      const clean = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (clean.length > 40) paragraphs.push(clean)
    }
    let text = paragraphs.join('\n\n')
    if (!text || text.length < 120) {
      text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }
    return Response.json({ text: text.slice(0, 7000), realUrl })
  } catch (e) {
    return Response.json({ text: '', realUrl })
  }
}
