import { createClient } from '@supabase/supabase-js'

function getTag(str: string, tag: string) {
  const m = str.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[(.*?)\\]\\]>|([^<]*))</${tag}>`, 'i'))
  return (m? (m[1] || m[2] || '') : '').trim()
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const feeds = [
    { url: 'https://news.google.com/rss?hl=es-419&gl=CL&ceid=CL:es-419', source: 'CHILE' },
    { url: 'https://news.google.com/rss?hl=es&gl=ES&ceid=ES:es', source: 'ESPAÑA' },
    { url: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr', source: 'FRANCIA' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'USA' },
    { url: 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en', source: 'UK' },
  ]

  let allNews: any[] = []

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const rss = await res.text()
      const items = rss.match(/<item>[\s\S]*?<\/item>/g) || []
      for (const it of items) {
        const title = getTag(it, 'title').replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        const link = getTag(it, 'link').trim()
        let description = getTag(it, 'description').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim()
        const pubDate = getTag(it, 'pubDate')
        if (!title ||!link) continue
        if (description.includes('Cobertura')) description = ''
        allNews.push({
          title,
          link,
          description,
          source: feed.source,
          created_at: pubDate? new Date(pubDate).toISOString() : new Date().toISOString(),
        })
      }
    } catch (e) {}
  }

  if (allNews.length === 0) return Response.json({ ok: false, error: 'no news' })
  const unique = Array.from(new Map(allNews.map((n: any) => [n.link, n])).values())
  const { error } = await supabase.from('news').upsert(unique, { onConflict: 'link' })
  if (error) return Response.json({ ok: false, error: error.message })
  return Response.json({ ok: true, inserted: unique.length })
}
