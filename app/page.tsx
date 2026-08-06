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

function matchSource(source:string, chainId:string){
  const s=(source||"").toUpperCase().trim()
  const c=chainId.toUpperCase().trim()
  if(c==="W.POST") return s.includes("WASHINGTON")||s==="W.POST"
  if(c==="CNN CHILE") return s==="CNN CHILE"
  return s===c
}

export default function Page(){
 const [all,setAll]=useState<any[]>([])
 const [countrySel,setCountrySel]=useState("ALL")
 const [chainSel,setChainSel]=useState<string|null>(null)
 const [q,setQ]=useState("")
 const [secondsLeft,setSecondsLeft]=useState(300)
 const [lastUpdate,setLastUpdate]=useState<Date>(new Date())

 const fetchNews = async()=>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if(!url||!key) return
  const {createClient}=await import("@supabase/supabase-js")
  const supa=createClient(url,key)
  const {data}=await supa.from("news").select("*").order("created_at",{ascending:false}).limit(500)
  if(data){ setAll(data); setLastUpdate(new Date()); setSecondsLeft(300) }
 }

 useEffect(()=>{ fetchNews() },[])

 // TIMER 5 MIN
 useEffect(()=>{
  const iv=setInterval(()=>{
   setSecondsLeft(s=>{
    if(s<=1){ fetchNews(); return 300 }
    return s-1
   })
  },1000)
  return ()=>clearInterval(iv)
 },[])

 const isRed = secondsLeft <= 60
 const mins = Math.floor(secondsLeft/60)
 const secs = secondsLeft%60

 const counts=useMemo(()=>{
  const m:any={}
  CHAINS.forEach(c=>{ m[c.id]=all.filter(n=>matchSource(n.source,c.id)).length })
  return m
 },[all])

 const countryTotals=useMemo(()=>{
  const t:any={ALL:all.length}
  COUNTRIES.forEach(co=>{
   if(co.name==="ALL") return
   const ids=CHAINS.filter(c=>c.country===co.name).map(c=>c.id)
   t[co.name]=all.filter(n=>ids.some(id=>matchSource(n.source,id))).length
  })
  return t
 },[all])

 let f=all
 if(chainSel) f=f.filter(n=>matchSource(n.source,chainSel))
 if(q) f=f.filter(n=>(n.title||"").toLowerCase().includes(q.toLowerCase()))

 const chainsToShow=countrySel==="ALL"?[]:CHAINS.filter(c=>c.country===countrySel)

 return (
  <div style={{background:BG,minHeight:"100vh",padding:"0 0 100px"}}>
   <div style={{position:"sticky",top:0,zIndex:20,background:BG,padding:"12px",borderBottom:"1px solid "+BORDER}}>

    {/* HEADER CON SEMAFORO */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
     <h1 style={{fontWeight:900,margin:0,fontSize:22,color:GOLD}}>JANUS V3 ✓ <span style={{fontSize:11,color:"#666"}}>{f.length}/{all.length}</span></h1>
     <button onClick={fetchNews} style={{
      display:"flex",alignItems:"center",gap:6,
      background:isRed?"#FF1A1A":"#00C853", color:isRed?"#fff":"#000",
      border:"none", borderRadius:20, padding:"6px 12px", fontWeight:900, fontSize:12,
      boxShadow: isRed? "0 0 12px #FF1A1A" : "0 0 10px #00C853",
      transition:"all 0.3s"
     }}>
      <span style={{width:8,height:8,borderRadius:"50%",background:"#fff",display:"inline-block",animation:isRed?"pulse 0.8s infinite":"none"}}></span>
      {mins}:{secs.toString().padStart(2,"0")}
     </button>
    </div>
    <div style={{fontSize:9,color:"#666",marginTop:4}}>Actualizado: {lastUpdate.toLocaleTimeString("es-CL")} • Próxima en {mins}m {secs}s {isRed?"⚠️":""}</div>

    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en 26 cadenas..." style={{width:"100%",marginTop:8,background:"#151308",border:"1px solid "+BORDER,borderRadius:10,padding:"10px 12px",color:"#fff",outline:"none"}}/>

    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:5,marginTop:10}}>
     {COUNTRIES.map(co=>{
      const active=countrySel===co.name
      const total=countryTotals[co.name]||0
      return (
       <button key={co.name} onClick={()=>{setCountrySel(co.name);setChainSel(null)}} style={{background:active?GOLD:"#151308",color:active?"#000":total>0?"#FFEB99":"#555",border:"1.5px solid "+(active?GOLD:BORDER),borderRadius:12,padding:"8px 1px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minHeight:64}}>
        <span style={{fontSize:20}}>{co.flag}</span>
        <span style={{fontSize:7.5,fontWeight:900}}>{co.name}</span>
        <span style={{fontSize:10,fontWeight:900,background:active?"#000":GOLD,color:active?GOLD:"#000",borderRadius:10,padding:"1px 6px"}}>{total}</span>
       </button>
      )
     })}
    </div>

    {countrySel!=="ALL"&&(
     <div style={{marginTop:10,background:"#0F0F06",border:"1px solid "+BORDER,borderRadius:12,padding:8}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
       {chainsToShow.map(c=>{
        const active=chainSel===c.id
        const cnt=counts[c.id]||0
        return (
         <button key={c.id} onClick={()=>setChainSel(active?null:c.id)} style={{background:active?GOLD:cnt>0?"#1F1B08":"#111",color:active?"#000":cnt>0?"#FFEB99":"#333",border:"1px solid "+(active?GOLD:BORDER),borderRadius:10,padding:"6px 2px",minHeight:42,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
          <span style={{fontSize:9,fontWeight:900}}>{c.id}</span>
          <span style={{fontSize:10,fontWeight:900,background:active?"#000":cnt>0?GOLD:"#222",color:active?GOLD:cnt>0?"#000":"#555",borderRadius:8,padding:"1px 6px"}}>{cnt}</span>
         </button>
        )
       })}
      </div>
     </div>
    )}
   </div>

   <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:10,padding:"0 10px"}}>
    {f.map((n:any)=>(
     <div key={n.id} style={{background:CARD,border:"1px solid "+BORDER,borderTop:"2px solid "+GOLD,borderRadius:12,padding:10}}>
      <div style={{fontSize:12,fontWeight:700,color:"#fff",lineHeight:"14px",minHeight:38}}>{n.title}</div>
      <div style={{fontSize:9,marginTop:6,color:GOLD,display:"flex",justifyContent:"space-between"}}><span>{n.source}</span><span style={{color:"#666"}}>{new Date(n.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span></div>
     </div>
    ))}
   </div>

   <style>{`@keyframes pulse{0%{opacity:1}50%{opacity:0.3}100%{opacity:1}}`}</style>
  </div>
 )
}
