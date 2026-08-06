import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
export async function GET(){
 const supa=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
 const feeds=[
  {id:'EMOL',url:'https://www.emol.com/rss/Emol.xml'},
  {id:'BIOBIO',url:'https://www.biobiochile.cl/feed/'},
  {id:'T13',url:'https://www.t13.cl/rss/'},
 ]
 let t=0
 for(const f of feeds){
  try{
   const xml=await (await fetch(f.url,{cache:'no-store'})).text()
   const re=/<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>/g
   let m:any; let c=0
   while((m=re.exec(xml))&&c<10){
    if(c>0){
     const title=m[1].replace(/<!\[CDATA\[|\]\]>/g,'').slice(0,200)
     const link=m[2].replace(/<!\[CDATA\[|\]\]>/g,'').trim()
     await supa.from('news').upsert({title,source:f.id,link},{onConflict:'link'})
     t++
    }
    c++
   }
  }catch{}
 }
 return Response.json({ok:true,inserted:t})
}
