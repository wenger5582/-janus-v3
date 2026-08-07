// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
function getTag(s: string, t: string) {
  const m = s.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[(.*?)\\]\\]>|([^<]*))</${t}>`, 'i'))
  return (m? (m[1] || m[2] || '') : '').trim()
}
export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const feeds = [
    { url: 'https://news.google.com/rss?hl=es-419&gl=CL&ceid=CL:es-419', source: 'CHILE' },
    { url: 'https://news.google.com/rss?hl=es&gl=ES&ceid=ES:es', source: 'ESPAÑA' },
    { url: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr', source: 'FRANCIA' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'USA' },
    { url: 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en', source: 'UK' },
  ]
  let all = []
  for (const f of feeds) {
    try {
      const rss = await (await fetch(f.url, { cache: 'no-store' })).text()
      const items = rss.match(/<item>[\s\S]*?<\/item>/g) || []
      for (const it of items) {
        const title = getTag(it, 'title').replace(/<!\[CDATA\[|\]\]>/g, '')
        const link = getTag(it, 'link')
        const desc = getTag(it, 'description').replace(/<[^>]+>/g, ' ').slice(0, 480)
        if (title && link) all.push({ title, link, description: desc, source: f.source, created_at: new Date(getTag(it, 'pubDate') || Date.now()).toISOString() })
      }
    } catch {}
  }
  const unique = Array.from(new Map(all.map(n => [n.link, n])).values())
  if (unique.length) await supabase.from('news').upsert(unique, { onConflict: 'link' })
  return Response.json({ ok: true, count: unique.length })
}
