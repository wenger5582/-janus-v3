"use client"
import { useState, useMemo, useEffect } from "react"

type Chain = { id:string, country:string, flag:string }
const CHAINS: Chain[] = [
  {id:"WSJ", country:"USA", flag:"🇺🇸"}, {id:"REUTERS", country:"UK", flag:"🇬🇧"},
  {id:"BLOOMBERG", country:"USA", flag:"🇺🇸"}, {id:"BBC", country:"UK", flag:"🇬🇧"},
  {id:"CNN", country:"USA", flag:"🇺🇸"}, {id:"AP", country:"USA", flag:"🇺🇸"},
  {id:"FT", country:"UK", flag:"🇬🇧"}, {id:"NYT", country:"USA", flag:"🇺🇸"},
  {id:"W.POST", country:"USA", flag:"🇺🇸"}, {id:"GUARDIAN", country:"UK", flag:"🇬🇧"},
  {id:"ECONOMIST", country:"UK", flag:"🇬🇧"}, {id:"FORBES", country:"USA", flag:"🇺🇸"},
  {id:"EFE", country:"ESPAÑA", flag:"🇪🇸"}, {id:"AFP", country:"FRANCIA", flag:"🇫🇷"},
  {id:"EL PAIS", country:"ESPAÑA", flag:"🇪🇸"},
  {id:"LA TERCERA", country:"CHILE", flag:"🇨🇱"}, {id:"DF", country:"CHILE", flag:"🇨🇱"},
  {id:"EMOL", country:"CHILE", flag:"🇨🇱"}, {id:"BIOBIO", country:"CHILE", flag:"🇨🇱"},
  {id:"T13", country:"CHILE", flag:"🇨🇱"}, {id:"MEGA", country:"CHILE", flag:"🇨🇱"},
  {id:"CHV", country:"CHILE", flag:"🇨🇱"}, {id:"CNN CHILE", country:"CHILE", flag:"🇨🇱"},
  {id:"THE CLINIC", country:"CHILE", flag:"🇨🇱"}, {id:"EX-ANTE", country:"CHILE", flag:"🇨🇱"},
  {id:"PULSO", country:"CHILE", flag:"🇨🇱"},
]
const GOLD="#D4AF37", BG="#080800", CARD="#121208", BORDER="#2A2610"
const COUNTRIES = [
  {name:"ALL", flag:"🌐"},
  {name:"USA", flag:"🇺🇸"}, {name:"UK", flag:"🇬🇧"},
  {name:"ESPAÑA", flag:"🇪🇸"}, {name:"FRANCIA", flag:"🇫🇷"},
  {name:"CHILE", flag:"🇨🇱"},
]

export default function Page(){
 const [all,setAll]=useState<any[]>([])
 const [countrySel,setCountrySel]=useState<string>("ALL")
 const [chainSel,setChainSel]=useState<string|null>(null)
 const [q,setQ]=useState("")
 useEffect(()=>{
  const load=async()=>{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   if(!url||!key) return
   const {createClient}=await import("@supabase/supabase-js")
   const supa=createClient(url,key)
   const {data}=await supa.from("news").select("*").order("created_at",{ascending:false}).limit(500)
   if(data) setAll(data)
  };load()
 },[])

 const counts=useMemo(()=>{
  const m:Record<string,number>={}
  CHAINS.forEach(c=>{
   m[c.id]=all.filter(n=>{
    const t=(JSON.stringify(n)+" "+(n.source||"")).toUpperCase()
    if(c.id==="W.POST") return t.includes("WASHINGTON")
    return t.includes(c.id)
   }).length
  });return m
 },[all])

 // FIX: TOTALES UNICOS POR PAIS (no suma)
 const countryTotals=useMemo(()=>{
  const t:Record<string,number>={ALL:all.length}
  COUNTRIES.forEach(co=>{
   if(co.name==="ALL") return
   const chainsOfCountry = CHAINS.filter(c=>c.country===co.name).map(c=>c.id)
   const unique = all.filter(n=>{
    const txt = (JSON.stringify(n)+" "+(n.source||"")).toUpperCase()
    return chainsOfCountry.some(cid=>{
      if(cid==="W.POST") return txt.includes("WASHINGTON")
      return txt.includes(cid)
    })
   }).length
   t[co.name]=unique
  });return t
 },[counts,all])

 let f=all
 if(chainSel) f=f.filter(n=>{
  const t=(JSON.stringify(n)+" "+(n.source||"")).toUpperCase()
  if(chainSel==="W.POST") return t.includes("WASHINGTON")
  return t.includes(chainSel)
 })
 if(q) f=f.filter(n=>(n.title||"").toLowerCase().includes(q.toLowerCase()))

 const chainsToShow = countrySel==="ALL"?[]:CHAINS.filter(c=>c.country===countrySel)

 return(
  <div style={{background:BG,minHeight:"100vh",padding:"0 0 100px"}}>
   <div style={{position:"sticky",top:0,zIndex:20,background:BG,padding:"12px",borderBottom:`1px solid ${BORDER}`}}>
    <h1 style={{fontWeight:900,margin:0,fontSize:26,color:GOLD}}>JANUS V3 ✓ <span style={{fontSize:11,color:"#666"}}>{f.length}/{all.length}</span></h1>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en 26 cadenas..." style={{width:"100%",marginTop:8,background:"#151308",border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 12px",color:"#fff",outline:"none"}}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:5,marginTop:12}}>
     {COUNTRIES.map(co=>{
      const active=countrySel===co.name
      const total=countryTotals[co.name]||0
      return(
       <button key={co.name} onClick={()=>{setCountrySel(co.name);setChainSel(null)}} style={{
        background:active?GOLD:"#151308", color:active?"#000": total>0?"#FFEB99":"#555",
        border:`1.5px solid ${active?GOLD:BORDER}`, borderRadius:12, padding:"8px 1px",
        display:"flex",flexDirection:"column",alignItems:"center",gap:3,minHeight:64
       }}>
        <span style={{fontSize:20}}>{co.flag}</span>
        <span style={{fontSize:7.5,fontWeight:900}}>{co.name}</span>
        <span style={{fontSize:10,fontWeight:900,background:active?"#000":GOLD,color:active?GOLD:"#000",borderRadius:10,padding:"1px 6px"}}>{total}</span>
       </button>
      )
     })}
    </div>
    {countrySel!=="ALL" && (
    <div style={{marginTop:10,background:"#0F0F06",border:`1px solid ${BORDER}`,borderRadius:12,padding:8}}>
     <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,padding:"0 4px"}}>
      <span style={{fontSize:10,color:"#FFEB99",fontWeight:900}}>{COUNTRIES.find(c=>c.name===countrySel)?.flag} {countrySel} • {chainsToShow.length} cadenas</span>
      <span style={{fontSize:10,color:"#666"}}>{countryTotals[countrySel]} noticias</span>
     </div>
     <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
      {chainsToShow.map(c=>{
       const active=chainSel===c.id
       const cnt=counts[c.id]||0
       return(
        <button key={c.id} onClick={()=>setChainSel(active?null:c.id)} style={{
         background:active?GOLD: cnt>0?"#1F1B08":"#111", color:active?"#000": cnt>0?"#FFEB99":"#333",
         border:`1px solid ${active?GOLD:BORDER}`, borderRadius:10, padding:"6px 2px", minHeight:42,
         display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2
        }}>
         <span style={{fontSize:9,fontWeight:900}}>{c.id}</span>
         <span style={{fontSize:10,fontWeight:900,background:active?"#000": cnt>0?GOLD:"#222",color:active?GOLD: cnt>0?"#000":"#555",borderRadius:8,padding:"1px 6px"}}>{cnt}</span>
        </button>
       )
      })}
     </div>
    )}
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:10,padding:"0 10px"}}>
    {f.map((n:any)=><div key={n.id} style={{background:CARD,border:`1px solid ${BORDER}`,borderTop:`2px solid ${GOLD}`,borderRadius:12,padding:10}}>
      <div style={{fontSize:12,fontWeight:700,color:"#fff",lineHeight:"14px",minHeight:38}}>{n.title}</div>
      <div style={{fontSize:9,marginTop:6,color:GOLD,display:"flex",justifyContent:"space-between"}}><span>{n.source}</span><span style={{color:"#666"}}>{new Date(n.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span></div>
    </div>)}
   </div>
  </div>
 )
}
