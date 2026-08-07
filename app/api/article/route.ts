export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  if (!url) return Response.json({ text: '' })

  try {
    // Fetch directo del servidor, sigue redirects de Google News al diario real
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      },
      redirect: 'follow',
      cache: 'no-store'
    })
    const html = await res.text()

    // Extrae solo <p>
    const paragraphs = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
     .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
     .filter(t => t.length > 40)

    let text = paragraphs.join('\n\n')
    if (!text || text.length < 100) {
      text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
    }
    return Response.json({ text: text.slice(0, 6000) })
  } catch (e: any) {
    return Response.json({ text: '', error: e.message })
  }
}
