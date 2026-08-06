import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const rss = await fetch('https://www.biobiochile.cl/lista-categorias/nacional/rss.xml').then(r=>r.text())
    const matches = [...rss.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>.*?<link>(.*?)<\/link>/gs)].slice(1, 15)

    const news = matches.map(m=>({
      title: m[1].trim(),
      link: m[2].trim(),
      source: 'BIOBIO'
    }))

    if(news.length === 0) return Response.json({ ok:false, error: 'RSS vacio', rss_preview: rss.slice(0,200) })

    const { data, error } = await supabase.from('news').upsert(news, { onConflict: 'link', ignoreDuplicates: false }).select()

    if(error) return Response.json({ ok:false, supabase_error: error })

    return Response.json({ ok:true, inserted: data?.length || 0, sample: news[0] })
  } catch(e:any) {
    return Response.json({ ok:false, crash: e.message })
  }
}
