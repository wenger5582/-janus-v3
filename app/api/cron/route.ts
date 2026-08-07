// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getTag(s: string, t: string) {
  const m = s.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[(.*?)\\]\\]>|([^<]*))</${t}>`, 'i'))
  return (m? (m[1] || m[2] || '') : '').trim()
}
function decodeGoogleNewsUrl(googleUrl: string): string | null {
  try {
    const m = googleUrl.match(/\/articles\/([^?&#]+)/)
    if (!m) return null
    let id = m[1]
    let decoded: string
    try { decoded = Buffer.from(id, 'base64url').toString('latin1') }
    catch { let b64 = id.replace(/-/g, '+').replace(/_/g, '/'); while(b64.length%4) b64+='='; decoded = Buffer.from(b64, 'base64').toString('latin1') }
    const urls = decoded.match(/https?:\/\/[^\x00-\x1F"\s]+/g)
    if (!urls) return null
    const candidates = urls.filter(u=>!u.includes('google.com') && u.length>25)
    if (!candidates.length) return null
    return candidates.sort((a,b)=>b.length-a.length)[0].replace(/[\x00-\x1F"']+.*$/, '')
  } catch { return null }
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
        const googleLink = getTag(it, 'link')
        const realLink = decodeGoogleNewsUrl(googleLink) || googleLink
        const desc = getTag(it, 'description').replace(/<[^>]+>/g, ' ').slice(0, 480)
        if (title && realLink) all.push({ title, link: realLink, url: googleLink, description: desc, source: f.source, created_at: new Date(getTag(it, 'pubDate') || Date.now()).toISOString() })
      }
    } catch {}
  }
  const unique = Array.from(new Map(all.map(n => [n.link, n])).values())
  if (unique.length) await supabase.from('news').upsert(unique, { onConflict: 'link' })
  return Response.json({ ok: true, count: unique.length })
}
