"use client"
import { useState, useEffect } from "react"

const CADENAS = [
 "WSJ","REUTERS","BLOOMBERG","BBC","CNN",
 "AP","FT","NYT","W.POST","GUARDIAN",
 "ECONOMIST","FORBES","EFE","AFP","EL PAIS",
 "LA TERCERA","DF","EMOL","BIOBIO","T13",
 "MEGA","CHV","CNN CHILE","THE CLINIC","EX-ANTE","PULSO"
]

const GOLD = "#D4AF37"
const GOLD_LIGHT = "#FFD700"
const BG = "#080800"
const CARD = "#121208"
const BORDER = "#2A2610"

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
  <div style={{background:BG,minHeight:"100vh",color:GOLD,padding:"0 0 100px"}}>
    <div style={{position:"sticky",top:0,zIndex:10,background:BG,padding:"12px",borderBottom:`1px solid ${BORDER}`}}>
     <h1 style={{fontWeight:900,margin:0,fontSize:28,color:GOLD}}>JANUS V3 ✓ <span style={{fontSize:11,color:"#666",fontWeight:400}}>{f.length}/{all.length}</span></h1>
     
     <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en 26 cadenas..." 
      style={{width:"100%",marginTop:10,background:"#151308",border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 12px",color:"#fff",outline:"none"}}/>

     {/* 5 COLUMNAS x 6 FILAS */}
     <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:6,marginTop:12}}>
      {CADENAS.map(c=>{
       const active = sel===c
       return (
        <button key={c} onClick={()=>setSel(active?null:c)} 
         style={{
          background: active ? GOLD : "#1A1808",
          color: active ? "#000" : "#FFE9A0",
          border: `1.5px solid ${active?GOLD:"#3A3518"}`,
          borderRadius:8,
          padding:"10px 2px",
          fontSize:10,
          fontWeight:900,
          letterSpacing:0.3,
          textAlign:"center",
          lineHeight:"11px",
          minHeight:36,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          boxShadow: active ? `0 0 10px ${GOLD}60` : "none",
          textShadow: active ? "none" : `0 0 5px ${GOLD}40`
         }}>
         {c}
        </button>
       )
      })}
     </div>

     {sel&&<button onClick={()=>{setSel(null);setQ("")}} style={{marginTop:10,background:GOLD,color:"#000",border:"none",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:900}}>✕ LIMPIAR: {sel}</button>}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:12,padding:"0 10px"}}>
     {f.map((n:any)=>
       <a key={n.id} href={n.url||"#"} target="_blank" style={{textDecoration:"none",background:CARD,border:`1px solid ${BORDER}`,borderTop:`2px solid ${GOLD}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:10}}>
         <div style={{fontSize:12,fontWeight:700,color:"#fff",lineHeight:"14px",minHeight:42}}>{n.title}</div>
         <div style={{fontSize:9,marginTop:8,color:GOLD,fontWeight:800,display:"flex",justifyContent:"space-between"}}>
          <span>{n.source}</span><span style={{color:"#666"}}>{new Date(n.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span>
         </div>
        </div>
       </a>
     )}
    </div>
  </div>
 )
}
