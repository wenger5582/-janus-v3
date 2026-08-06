"use client"
import { useState, useEffect } from "react"

const CADENAS = [
 "WSJ","REUTERS","BLOOMBERG","BBC","CNN","AP","FT","NYT",
 "WASHINGTON POST","GUARDIAN","ECONOMIST","FORBES","EFE","AFP",
 "EL PAIS","LA TERCERA","DF","EMOL","BIOBIO","T13","MEGANOTICIAS",
 "CHV","CNN CHILE","THE CLINIC","EX-ANTE","PULSO"
]

// DORADO PREMIUM - no amarillo
const GOLD = "#D4AF37"
const GOLD_LIGHT = "#E8C766"
const GOLD_DARK = "#8C7328"
const BG = "#080800"
const CARD = "#121208"
const CARD_BORDER = "#1E1C0A"

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
  <div style={{background:BG,minHeight:"100vh",color:GOLD,padding:"0 0 100px",fontFamily:"ui-serif, Georgia, serif"}}>
    {/* HEADER PREMIUM */}
    <div style={{position:"sticky",top:0,zIndex:10,background:`linear-gradient(180deg, ${BG} 0%, ${BG} 85%, rgba(8,8,0,0) 100%)`,padding:"14px 12px 12px",borderBottom:`1px solid ${CARD_BORDER}`}}>
     <div style={{display:"flex",alignItems:"baseline",gap:8}}>
      <h1 style={{fontWeight:900,margin:0,fontSize:30,letterSpacing:-1.5,color:GOLD,fontFamily:"ui-serif",textShadow:`0 0 20px ${GOLD}30`}}>JANUS<span style={{fontWeight:300,color:"#fff8",fontSize:20,marginLeft:6}}>V3</span></h1>
      <span style={{fontSize:10,color:"#666",letterSpacing:2}}>26 CADENAS • {f.length}/{all.length}</span>
      <span style={{marginLeft:"auto",fontSize:14,color:GOLD}}>✓</span>
     </div>
     
     <div style={{position:"relative",marginTop:12}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en 26 cadenas..." 
       style={{width:"100%",background:"#11110A",border:`1px solid ${CARD_BORDER}`,borderRadius:14,padding:"12px 14px 12px 38px",color:"#fff",outline:"none",fontSize:13}}/>
      <span style={{position:"absolute",left:14,top:13,color:GOLD_DARK}}>⌕</span>
     </div>

     <div style={{display:"flex",gap:6,overflowX:"auto",padding:"12px 0 4px",whiteSpace:"nowrap",scrollbarWidth:"none"}}>
      {CADENAS.map(c=>{
       const active = sel===c
       return <button key={c} onClick={()=>setSel(active?null:c)} 
        style={{
          background: active ? `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})` : "#151308",
          color: active ? "#000" : GOLD_DARK,
          border:`1px solid ${active?GOLD:GOLD_DARK}40`,
          borderRadius:22,padding:"7px 13px",fontSize:10.5,fontWeight:900,letterSpacing:0.5,
          flexShrink:0,boxShadow: active ? `0 2px 12px ${GOLD}40` : "none",
          transition:"all 0.2s"
        }}>{c}</button>
      })}
     </div>
     {sel&&<button onClick={()=>{setSel(null);setQ("")}} style={{marginTop:8,background:"transparent",color:GOLD,border:`1px solid ${GOLD}60`,borderRadius:20,padding:"5px 12px",fontSize:10,letterSpacing:1}}>✕ {sel}</button>}
    </div>

    {/* CARDS PREMIUM GOLD */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9,marginTop:12,padding:"0 10px"}}>
     {f.map((n:any)=>
       <a key={n.id} href={n.url||"#"} target="_blank" style={{textDecoration:"none",background:`linear-gradient(180deg, ${CARD}, #0A0A00)`,border:`1px solid ${CARD_BORDER}`,borderTop:`2px solid ${GOLD}80`,borderRadius:14,overflow:"hidden",display:"block",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
        <div style={{padding:"10px 10px 8px"}}>
         <div style={{fontSize:12.5,fontWeight:700,color:"#FFF8E0",lineHeight:"15px",fontFamily:"ui-serif",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",minHeight:45}}>{n.title}</div>
         <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,borderTop:`1px solid ${CARD_BORDER}`,paddingTop:6}}>
          <span style={{fontSize:9,color:GOLD_DARK,fontWeight:800,letterSpacing:1}}>{n.source||"NEWS"}</span>
          <span style={{fontSize:9,color:"#555"}}>{new Date(n.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span>
         </div>
        </div>
       </a>
     )}
    </div>

    <div style={{textAlign:"center",marginTop:30,color:"#222",fontSize:9,letterSpacing:3}}>JANUS • SISTEMA OPERATIVO • 2025</div>
  </div>
 )
}
