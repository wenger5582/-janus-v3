// @ts-nocheck
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function decodeGoogleNewsUrl(googleUrl: string): string | null {
  try {
    const m = googleUrl.match(/\/articles\/([^?&#]+)/)
    if (!m) return null
    let id = m[1]
    let decoded: string
    try {
      decoded = Buffer.from(id, 'base64url').toString('latin1')
    } catch {
      let b64 = id.replace(/-/g, '+').replace(/_/g, '/')
      while (b64.length % 4) b64 += '='
      decoded = Buffer.from(b64, 'base64').toString('latin1')
    }
    const urls = decoded.match(/https?:\/\/[^\x00-\x1F"\s]+/g)
    if (!urls) return null
    const candidates = urls.filter(u =>!u.includes('google.com') &&!u.includes('gstatic') && u.length > 25)
    if (!candidates.length) return null
    let best = candidates.sort((a, b) => b.length - a.length)[0]
    best = best.replace(/[\x00-\x1F"']+.*$/, '').replace(/"+$/, '')
    return best
  } catch { return null }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  let url = searchParams.get('url')
  if (!url) return Response.json({ text: '' })

  let realUrl = url
  if (url.includes('news.google.com')) {
    const decoded = decodeGoogleNewsUrl(url)
    if (decoded) realUrl = decoded
  }

  // Si sigue siendo google, no lo intentes fetch (te devuelve JS anti-bot)
  if (realUrl.includes('news.google.com')) {
    return Response.json({ text: '', realUrl: null })
  }

  try {
    const res = await fetch(realUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'Accept': 'text/html',
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
    // Filtra basura
    const low = text.toLowerCase()
    if (low.includes('function()') && low.includes('fromcharcode')) text = ''
    if (['google news','noticias de google','новости google'].includes(low)) text = ''
    return Response.json({ text: text.slice(0, 7000), realUrl })
  } catch {
    return Response.json({ text: '', realUrl })
  }
}
