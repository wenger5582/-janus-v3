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
    const paragraphs = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
     .map(m => m[1].replace(/<[^>]+>/g, ' ').trim())
     .filter(t => t.length > 40)
    let text = paragraphs.join('\n\n')
    if (!text) text = html.replace(/<[^>]+>/g, ' ').slice(0, 6000)
    return Response.json({ text: text.slice(0, 6000) })
  } catch (e: any) {
    return Response.json({ text: '' })
  }
}
