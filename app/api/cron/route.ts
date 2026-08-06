import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const CHAINS = [
 {id:'WSJ', url:'https://feeds.a.dj.com/rss/RSSWorldNews.xml'},
 {id:'BBC', url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
 {id:'CNN', url:'http://rss.cnn.com/rss/edition.xml'},
 {id:'NYT', url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'},
 {id:'GUARDIAN', url:'https://www.theguardian.com/world/rss'},
 {id:'REUTERS', url:'https://www.reutersagency.com/feed/?best-topics=world&post_type=best'},
 {id:'LA TERCERA', url:'https://www.latercera.com/feed/'},
 {id:'EMOL', url:'https://www.emol.com/rss/Emol.xml'},
 {id:'BIOBIO', url:'https://www.biobiochile.cl/feed/'},
 {id:'T13', url:'https://www.t13.cl/rss/'},
 {id:'MEGA', url:'https://www.meganoticias.cl/rss/'},
 {id:'CHV', url:'https://www.chvnoticias.cl/feed/'},
 {id:'CNN CHILE', url:'https://www.cnnchile.com/feed/'},
 {id:'DF', url:'https://www.df.cl/feed'},
 {id:'PULSO', url:'https://www.pulso.cl/feed/'},
 {id:'EL PAIS', url:'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'},
]

export async function GET(){
 try{
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supa = createClient(url, key)
  let total=0
  let errors:any[]=[]

  for(const chain of CHAINS){
   try{
    const res = await fetch(chain.url, {headers:{'User-Agent':'Mozilla/5.0'}, cache:'no-store', next:{revalidate:0} as any})
    const text = await res.text()
    const matches = [...text.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>/gi)].slice(0,10)
    for(const m of matches){
     const title = m[1].replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]*>/g,'').trim().substring(0,250)
     const link = m[2].replace(/<!\[CDATA\[|\]\]>/g,'').trim()
     if(title.length<10) continue
     const {error} = await supa.from('news').upsert({title, source:chain.id, link, created_at:new Date().toISOString()}, {onConflict:'link'})
     if(!error) total++
    }
   }catch(e:any){ errors.push(chain.id+': '+e.message) }
  }
  return Response.json({ok:true, inserted:total, errors, time:new Date().toISOString()})
 } catch(e:any){
  return Response.json({ok:false, error:e.message}, {status:500})
 }
}
