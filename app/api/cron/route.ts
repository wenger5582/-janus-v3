import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const rss = await fetch('https://www.biobiochile.cl/lista-categorias/nacional/rss.xml').then(r=>r.text())
    const items: any[] = []
    const re = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<link>(.*?)<\/link>/g
    let m
    while ((m = re.exec(rss))!== null) {
      if (items.length >= 15) break
      items.push({ title: m[1].trim(), link: m[2].trim(), source: 'BIOBIO' })
    }
    if (items.length === 0) {
      return Response.json({ ok: false, error: 'RSS vacio' })
    }
    const { data, error } = await supabase.from('news').upsert(items, { onConflict: 'link' }).select()
    if (error) {
      return Response.json({ ok: false, supabase_error: error })
    }
    return Response.json({ ok: true, inserted: data?.length || 0 })
  } catch (e: any) {
    return Response.json({ ok: false, crash: e.message })
  }
}
