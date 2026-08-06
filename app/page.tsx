"use client"
import { useState, useEffect, useMemo } from "react"

const CHAINS = [
 {id:"WSJ",country:"USA",flag:"🇺🇸"}, {id:"REUTERS",country:"UK",flag:"🇬🇧"},
 {id:"BLOOMBERG",country:"USA",flag:"🇺🇸"}, {id:"BBC",country:"UK",flag:"🇬🇧"},
 {id:"CNN",country:"USA",flag:"🇺🇸"}, {id:"AP",country:"USA",flag:"🇺🇸"},
 {id:"FT",country:"UK",flag:"🇬🇧"}, {id:"NYT",country:"USA",flag:"🇺🇸"},
 {id:"W.POST",country:"USA",flag:"🇺🇸"}, {id:"GUARDIAN",country:"UK",flag:"🇬🇧"},
 {id:"ECONOMIST",country:"UK",flag:"🇬🇧"}, {id:"FORBES",country:"USA",flag:"🇺🇸"},
 {id:"EFE",country:"ESPAÑA",flag:"🇪🇸"}, {id:"AFP",country:"FRANCIA",flag:"🇫🇷"},
 {id:"EL PAIS",country:"ESPAÑA",flag:"🇪🇸"},
 {id:"LA TERCERA",country:"CHILE",flag:"🇨🇱"}, {id:"DF",country:"CHILE",flag:"🇨🇱"},
 {id:"EMOL",country:"CHILE",flag:"🇨🇱"}, {id:"BIOBIO",country:"CHILE",flag:"🇨🇱"},
 {id:"T13",country:"CHILE",flag:"🇨🇱"}, {id:"MEGA",country:"CHILE",flag:"🇨🇱"},
 {id:"CHV",country:"CHILE",flag:"🇨🇱"}, {id:"CNN CHILE",country:"CHILE",flag:"🇨🇱"},
 {id:"THE CLINIC",country:"CHILE",flag:"🇨🇱"}, {id:"EX-ANTE",country:"CHILE",flag:"🇨🇱"},
 {id:"PULSO",country:"CHILE",flag:"🇨🇱"},
]
const GOLD="#D4AF37", BG="#080800", CARD="#121208", BORDER="#2A2610"
const COUNTRIES=[{name:"ALL",flag:"🌐"},{name:"USA",flag:"🇺🇸"},{name:"UK",flag:"🇬🇧"},{name:"ESPAÑA",flag:"🇪🇸"},{name:"FRANCIA",flag:"🇫🇷"},{name:"CHILE",flag:"🇨🇱"}]
function matchSource(s:string,c:string){
 const src=(s||"").toUpperCase().trim()
 const cid=c.toUpperCase().trim()
 if(cid==="W.POST") return src.includes("WASHINGTON")||src==="W.POST"
 if(cid==="CNN CHILE") return src==="CNN CHILE"
 return src===cid
}

export default function Page(){
 const [all,setAll]=useState<any[]>([])
 const [countrySel,setCountrySel]=useState("ALL")
 const [chainSel,setChainSel]=useState<string|null>(null)
 const [q,setQ]=useState("")
 const [sec,setSec]=useState(300)
 const [last,setLast]=useState(new Date())
 const [loading,setLoading]=useState(false)
 const [visible,setVisible]=useState(60) // cuantas muestra al inicio

 const fetchNews=async()=>{
  setLoading(true)
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL
   const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   if(!url||!key) return
   const {createClient}=await import("@supabase/supabase-js")
   const supa=createClient(url,key)
   // AHORA 2000 NOTICIAS
   const {data}=await supa.from("news").select("*").order("created_at",{ascending:false}).limit(2000)
   if(data){ setAll(data); setLast(new Date()); setSec(300); setVisible(60) }
   if("vibrate" in navigator) navigator.vibrate(80)
  } finally { setLoading(false) }
 }

 useEffect(()=>{ fetchNews() },[])
 useEffect(()=>{
  const iv=setInterval(()=>{ setSec(s=>{ if(s===61&&"vibrate" in navigator) navigator.vibrate([100,50,100]); if(s<=1){ fetchNews(); return 300 } return s-1 }) },1000)
  return ()=>clearInterval(iv)
 },[])

 const isRed=sec<=60
 const m=Math.floor(sec/60), s=sec%60

 const counts=useMemo(()=>{ const o:any={}; CHAINS.forEach(c=>o[c.id]=all.filter(n=>matchSource(n.source,c.id)).length); return o },[all])
 const totals=useMemo(()=>{
  const t:any={ALL:all.length}
  COUNTRIES.forEach(co=>{ if(co.name==="ALL") return; const ids=CHAINS.filter(c=>c.country===co.name).map(c=>c.id); t[co.name]=all.filter(n=>ids.some(id=>matchSource(n.source,id))).length })
  return t
 },[all])

 let f=all
 if(chainSel) f=f.filter(n=>matchSource(n.source,chainSel))
 else if(countrySel!=="ALL"){
  const ids=CHAINS.filter(c=>c.country===countrySel).map(c=>c.id)
  f=f.filter(n=>ids.some(id=>matchSource(n.source,id)))
 }
 if(q) f=f.filter(n=>(n.title||"").toLowerCase().includes(q.toLowerCase()))

 const toShow=f.slice(0,visible)

 return (
  <div style={{background:BG,minHeight:"100vh",padding:"0 0 100px"}}>
   <div style={{position:"sticky",top:0,zIndex:20,background:BG,padding:"12px",borderBottom:"1px solid "+BORDER}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
     <h1 style={{fontWeight:900,margin:0,fontSize:20,color:GOLD}}>JANUS V3 ✓ <span style={{fontSize:10,color:"#666"}}>{toShow.length}/{f.length} de {all.length}</span></h1>
     <button onClick={fetchNews} disabled={loading} style={{display:"flex",alignItems:"center",gap:6,background:loading?"#333":isRed?"#FF1A1A":"#00C853",color:loading?"#888":isRed?"#fff":"#000",border:"none",borderRadius:20,padding:"7px 14px",fontWeight:900,fontSize:13,boxShadow:loading?"none":isRed?"0 0 15px #FF1A1A":"0 0 10px #00C853",transform:isRed?"scale(1.05)":"scale(1)",transition:"all 0.3s"}}>
      <span style={{width:9,height:9,borderRadius:"50%",background:"#fff",display:"inline-block",animation:isRed?"pulse 0.7s infinite":"pulseGreen 2s infinite"}}></span>
      {loading?"⟳":`${m}:${s.toString().padStart(2,"0")}`}
     </button>
    </div>
    <div style={{fontSize:9,color:isRed?"#FF6B6B":"#666",marginTop:4}}>{loading?"Cargando 2000 noticias...":`Actualizado: ${last.toLocaleTimeString("es-CL")} • ${isRed?"🔴":"🟢"} ${f.length} filtradas`}</div>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en 26 cadenas..." style={{width:"100%",marginTop:8,background:"#151308",border:"1px solid "+BORDER,borderRadius:10,padding:"10px 12px",color:"#fff",outline:"none"}}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:5,marginTop:10}}>
     {COUNTRIES.map(co=>{const act=countrySel===co.name; return <button key={co.name} onClick={()=>{setCountrySel(co.name);setChainSel(null);setVisible(60)}} style={{background:act?GOLD:"#151308",color:act?"#000":totals[co.name]>0?"#FFEB99":"#555",border:"1.5px solid "+(act?GOLD:BORDER),borderRadius:12,padding:"8px 1px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minHeight:64}}>
       <span style={{fontSize:20}}>{co.flag}</span><span style={{fontSize:7.5,fontWeight:900}}>{co.name}</span><span style={{fontSize:10,fontWeight:900,background:act?"#000":GOLD,color:act?GOLD:"#000",borderRadius:10,padding:"1px 6px"}}>{totals[co.name]||0}</span>
      </button>})}
    </div>
    {countrySel!=="ALL"&&(
     <div style={{marginTop:10,background:"#0F0F06",border:"1px solid "+BORDER,borderRadius:12,padding:8}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
       {CHAINS.filter(c=>c.country===countrySel).map(c=>{const act=chainSel===c.id; return <button key={c.id} onClick={()=>{setChainSel(act?null:c.id);setVisible(60)}} style={{background:act?GOLD:counts[c.id]>0?"#1F1B08":"#111",color:act?"#000":counts[c.id]>0?"#FFEB99":"#333",border:"1px solid "+(act?GOLD:BORDER),borderRadius:10,padding:"6px 2px",minHeight:42,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
         <span style={{fontSize:9,fontWeight:900}}>{c.id}</span><span style={{fontSize:10,fontWeight:900,background:act?"#000":counts[c.id]>0?GOLD:"#222",color:act?GOLD:counts[c.id]>0?"#000":"#555",borderRadius:8,padding:"1px 6px"}}>{counts[c.id]}</span>
        </button>})}
      </div>
     </div>
    )}
   </div>

   <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:10,padding:"0 10px"}}>
    {toShow.map((n:any)=><div key={n.id} style={{background:CARD,border:"1px solid "+BORDER,borderTop:"2px solid "+GOLD,borderRadius:12,padding:10}}>
     <div style={{fontSize:12,fontWeight:700,color:"#fff",lineHeight:"14px",minHeight:38}}>{n.title}</div>
     <div style={{fontSize:9,marginTop:6,color:GOLD,display:"flex",justifyContent:"space-between"}}><span>{n.source}</span><span style={{color:"#666"}}>{new Date(n.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span></div>
    </div>)}
   </div>

   {visible < f.length && (
    <div style={{display:"flex",justifyContent:"center",marginTop:16}}>
     <button onClick={()=>setVisible(v=>v+60)} style={{background:GOLD,color:"#000",border:"none",borderRadius:20,padding:"10px 22px",fontWeight:900,fontSize:13}}>
      Cargar 60 más ({f.length-visible} restantes)
     </button>
    </div>
   )}

   <style>{`@keyframes pulse{0%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.5}100%{transform:scale(1);opacity:1}} @keyframes pulseGreen{0%{opacity:1}50%{opacity:0.6}100%{opacity:1}}`}</style>
  </div>
 )
}
