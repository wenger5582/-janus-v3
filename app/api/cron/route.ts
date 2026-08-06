import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const feeds = [
    { url: 'https://news.google.com/rss?hl=es-419&gl=CL&ceid=CL:es-419&hl=es', source: 'CHILE' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'USA' },
    { url: 'https://news.google.com/rss?hl=es&gl=ES&ceid=ES:es', source: 'ESPAÑA' },
    { url: 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en', source: 'UK' },
  ]

  let allNews: any[] = []

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const rss = await res.text()
      const re = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>/g
      let m
      let count = 0
      while ((m = re.exec(rss))!== null && count < 10) {
        const title = m[1].replace('<![CDATA[','').replace(']]>','').split(' - ')[0].trim()
        allNews.push({ title: title, link: m[2].trim(), source: feed.source })
        count++
      }
    } catch {}
  }

  if (allNews.length === 0) {
    return Response.json({ ok: false, error: 'No feeds' })
  }

  const { data, error } = await supabase.from('news').upsert(allNews, { onConflict: 'link' }).select()

  if (error) return Response.json({ ok: false, supabase_error: error })

  return Response.json({ ok: true, inserted: data?.length })
}
