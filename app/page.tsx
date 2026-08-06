"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page(){
 const [all,setAll]=useState<any[]>([])
 const [sel,setSel]=useState<string|null>(null)
 
 useEffect(()=>{
   supabase.from("news").select("*").order("created_at",{ascending:false}).limit(300).then(r=>setAll(r.data||[]))
 },[])

 const f = sel ? all.filter(n=>JSON.stringify(n).toUpperCase().includes(sel)) : all

 return(
  <div style={{background:"#000",minHeight:"100vh",color:"#FCEE0A",padding:12}}>
    <h1 style={{fontWeight:900,margin:0,fontFamily:"monospace"}}>JANUS V3 LIMPIO ✓</h1>
    <div style={{fontSize:10,color:"#888"}}>{f.length} noticias {sel?"- Filtro: "+sel:""}</div>
    
    <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"12px 0"}}>
     {["WSJ","REUTERS","BBC","CNN","BLOOMBERG","AP"].map(c=>
       <button key={c} onClick={()=>setSel(c===sel?null:c)} style={{background:sel===c?"#fcee0a":"#111",color:sel===c?"#000":"#fff",borderRadius:20,padding:"7px 14px",fontWeight:900,border:"1px solid #333",cursor:"pointer"}}>{c}</button>
     )}
     <button onClick={()=>setSel(null)} style={{background:"#000",color:"#fcee0a",border:"1px solid #fcee0a",borderRadius:20,padding:"7px 14px",cursor:"pointer"}}>LIMPIAR</button>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
     {f.slice(0,100).map((n:any)=>
       <div key={n.id} style={{background:"#0f0f00",border:"1px solid #222",borderLeft:"3px solid #fcee0a",borderRadius:10,overflow:"hidden"}}>
        {n.image_url && <img src={n.image_url} style={{width:"100%",height:100,objectFit:"cover"}} alt="" />}
        <div style={{padding:6,fontSize:11,color:"#fff",fontWeight:700}}>{n.title?.slice(0,80)}</div>
        <div style={{padding:"0 6px 6px",fontSize:8,color:"#666"}}>{n.source||"NEWS"}</div>
       </div>
     )}
    </div>
  </div>
 )
}
