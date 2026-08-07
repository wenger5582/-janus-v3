import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
function getTag(str: string, tag: string) {
  const m = str.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[(.*?)\\]\\]>|([^<]*))</${tag}>`, 'i'))
  return (m? (m[1] || m[2] || '') : '').trim()
}
function cleanDescription(raw: string) {
  if (!raw) return ''
  let t = raw.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim()
  return t.slice(0, 480)
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
  let all: any[] = []
  for (const f of feeds) {
    try {
      const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' })
      const rss = await res.text()
      const items = rss.match(/<item>[\s\S]*?<\/item>/g) || []
      for (const it of items) {
        const title = getTag(it, 'title').replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        const link = getTag(it, 'link').trim()
        let desc = cleanDescription(getTag(it, 'description'))
        if (!desc || desc.toLowerCase().includes('cobertura')) desc = title
        all.push({ title, link, description: desc, source: f.source, created_at: new Date(getTag(it, 'pubDate') || Date.now()).toISOString() })
      }
    } catch {}
  }
  const unique = Array.from(new Map(all.map(n => [n.link, n])).values())
  await supabase.from('news').upsert(unique, { onConflict: 'link' })
  return Response.json({ ok: true, inserted: unique.length })
}
