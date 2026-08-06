import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const feeds = [
    {id:'BBC', url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
    {id:'EMOL', url:'https://www.emol.com/rss/Emol.xml'},
    {id:'BIOBIO', url:'https://www.biobiochile.cl/feed/'},
    {id:'T13', url:'https://www.t13.cl/rss/'},
    {id:'LA TERCERA', url:'https://www.latercera.com/feed/'},
  ]
  let total = 0
  for (const f of feeds) {
    try {
      const r = await fetch(f.url, { cache: 'no-store' })
      const xml = await r.text()
      const regex = /<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>/g
      let match: RegExpExecArray | null
      let count = 0
      while ((match = regex.exec(xml))!== null && count < 10) {
        if (count === 0) { count++; continue }
        const title = match[1].replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]*>/g,'').slice(0,200).trim()
        const link = match[2].replace(/<!\[CDATA\[|\]\]>/g,'').trim()
        if (title.length > 5) {
          await supabase.from('news').upsert({ title, source: f.id, link }, { onConflict: 'link' })
          total++
        }
        count++
      }
    } catch (e) {}
  }
  return Response.json({ ok: true, inserted: total })
}
