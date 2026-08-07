// @ts-nocheck
export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  if (!url) return Response.json({ text: '' })
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
      cache: 'no-store'
    })
    const html = await res.text()
    const paragraphs = []
    const regex = /<p[^>]*>(.*?)<\/p>/gi
    let m
    while ((m = regex.exec(html))!== null) {
      const clean = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (clean.length > 40) paragraphs.push(clean)
    }
    let text = paragraphs.join('\n\n')
    if (!text || text.length < 100) {
      text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }
    return Response.json({ text: text.slice(0, 6000) })
  } catch {
    return Response.json({ text: '' })
  }
}
