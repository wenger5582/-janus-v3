import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const rss = await fetch('https://www.biobiochile.cl/lista-categorias/nacional/rss.xml').then(r=>r.text())
    const regex = /<title><!\[CDATA\[(.*?)\]\]><\/title>.*?<link>(.*?)<\/link>/gs
    const matches = Array.from(rss.matchAll(regex)).slice(1, 15) as any[]

    const news = matches.map((m:any)=>({
      title: m[1].trim(),
      link: m[2].trim(),
      source: 'BIOBIO'
    }))

    if(news.length === 0) return Response.json({ ok:false, error: 'RSS vacio' })

    const { data, error } = await supabase.from('news').upsert(news, { onConflict: 'link' }).select()

    if(error) return Response.json({ ok:false, supabase_error: error })

    return Response.json({ ok:true, inserted: data?.length || 0 })
  } catch(e:any) {
    return Response.json({ ok:false, crash: e.message })
  }
}
