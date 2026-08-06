"use client"
import { useState, useEffect } from "react"

const CADENAS = [
 "WSJ","REUTERS","BLOOMBERG","BBC","CNN","AP","FT","NYT",
 "WASHINGTON POST","GUARDIAN","ECONOMIST","FORBES","EFE","AFP",
 "EL PAIS","LA TERCERA","DF","EMOL","BIOBIO","T13","MEGANOTICIAS",
 "CHV","CNN CHILE","THE CLINIC","EX-ANTE","PULSO"
]

export default function Page(){
 const [all,setAll]=useState<any[]>([])
 const [sel,setSel]=useState<string|null>(null)
 const [q,setQ]=useState("")
 
 useEffect(()=>{
  const load = async()=>{
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL
   const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   if(!url||!key) return
   const { createClient } = await import("@supabase/supabase-js")
   const supabase = createClient(url,key)
   const {data} = await supabase.from("news").select("*").order("created_at",{ascending:false}).limit(500)
   if(data) setAll(data)
  }
  load()
 },[])

 let f = all
 if(sel) f = f.filter(n=>JSON.stringify(n).toUpperCase().includes(sel))
 if(q) f = f.filter(n=> (n.title||"").toLowerCase().includes(q.toLowerCase()))

 return(
  <div style={{background:"#050500",minHeight:"100vh",color:"#FCEE0A",padding:"10px 10px 100px",fontFamily:"system-ui"}}>
    <div style={{position:"sticky",top:0,zIndex:10,background:"#050500",padding:"10px 0 8px",borderBottom:"1px solid #222"}}>
     <h1 style={{fontWeight:900,margin:0,fontSize:28,letterSpacing:-1}}>JANUS V3 ✓ <span style={{fontSize:12,color:"#666",fontWeight:400}}>{f.length} / {all.length}</span></h1>
     <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en 26 cadenas..." style={{width:"100%",marginTop:8,background:"#111",border:"1px solid #333",borderRadius:10,padding:"10px 12px",color:"#fff",outline:"none"}}/>
     <div style={{display:"flex",gap:5,overflowX:"auto",padding:"10px 0 2px",whiteSpace:"nowrap",scrollbarWidth:"none"}}>
      {CADENAS.map(c=><button key={c} onClick={()=>setSel(c===sel?null:c)} style={{background:sel===c?"#FCEE0A":"#161600",color:sel===c?"#000":"#FCEE0A",border:`1px solid ${sel===c?"#FCEE0A":"#333"}`,borderRadius:20,padding:"6px 12px",fontSize:11,fontWeight:900,flexShrink:0}}>{c}</button>)}
     </div>
     {sel&&<button onClick={()=>{setSel(null);setQ("")}} style={{marginTop:6,background:"#000",color:"#FCEE0A",border:"1px solid #FCEE0A",borderRadius:20,padding:"4px 10px",fontSize:10}}>✕ LIMPIAR FILTRO: {sel}</button>}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:12}}>
     {f.map((n:any)=>
       <a key={n.id} href={n.url||"#"} target="_blank" style={{textDecoration:"none",background:"#0e0e00",border:"1px solid #1f1f00",borderLeft:`3px solid ${sel?"#FCEE0A":"#333"}`,borderRadius:12,overflow:"hidden",display:"block"}}>
        {n.image_url ? <img src={n.image_url} style={{width:"100%",height:110,objectFit:"cover"}} alt="" /> : <div style={{height:4,background:"#FCEE0A"}}/>}
        <div style={{padding:8}}>
         <div style={{fontSize:12,fontWeight:800,color:"#fff",lineHeight:"13px",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{n.title}</div>
         <div style={{fontSize:9,marginTop:6,color:"#888",display:"flex",justifyContent:"space-between"}}><span>{n.source||"NEWS"}</span><span>{new Date(n.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span></div>
        </div>
       </a>
     )}
    </div>
  </div>
 )
}
