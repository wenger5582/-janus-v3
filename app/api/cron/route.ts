import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const res = await fetch('https://www.emol.com/rss/rss.asp', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const rss = await res.text()

    const items: any[] = []
    const re = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>/g
    let m
    while ((m = re.exec(rss))!== null) {
      if (items.length >= 20) break
      const title = m[1].replace('<![CDATA[','').replace(']]>','').trim()
      items.push({ title: title, link: m[2].trim(), source: 'EMOL' })
    }

    if (items.length === 0) {
      return Response.json({ ok: false, error: 'RSS vacio', preview: rss.slice(0,300) })
    }

    const { data, error } = await supabase.from('news').upsert(items, { onConflict: 'link' }).select()

    if (error) return Response.json({ ok: false, supabase_error: error })

    return Response.json({ ok: true, inserted: data?.length || 0 })
  } catch (e: any) {
    return Response.json({ ok: false, crash: e.message })
  }
}
