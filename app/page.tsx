"use client"
import { useState, useEffect, useMemo } from "react"

type Chain = { id:string, country:string, flag:string }

const CHAINS: Chain[] = [
  {id:"WSJ", country:"USA", flag:"🇺🇸"},
  {id:"REUTERS", country:"UK", flag:"🇬🇧"},
  {id:"BLOOMBERG", country:"USA", flag:"🇺🇸"},
  {id:"BBC", country:"UK", flag:"🇬🇧"},
  {id:"CNN", country:"USA", flag:"🇺🇸"},
  {id:"AP", country:"USA", flag:"🇺🇸"},
  {id:"FT", country:"UK", flag:"🇬🇧"},
  {id:"NYT", country:"USA", flag:"🇺🇸"},
  {id:"W.POST", country:"USA", flag:"🇺🇸"},
  {id:"GUARDIAN", country:"UK", flag:"🇬🇧"},
  {id:"ECONOMIST", country:"UK", flag:"🇬🇧"},
  {id:"FORBES", country:"USA", flag:"🇺🇸"},
  {id:"EFE", country:"ESPAÑA", flag:"🇪🇸"},
  {id:"AFP", country:"FRANCIA", flag:"🇫🇷"},
  {id:"EL PAIS", country:"ESPAÑA", flag:"🇪🇸"},
  {id:"LA TERCERA", country:"CHILE", flag:"🇨🇱"},
  {id:"DF", country:"CHILE", flag:"🇨🇱"},
  {id:"EMOL", country:"CHILE", flag:"🇨🇱"},
  {id:"BIOBIO", country:"CHILE", flag:"🇨🇱"},
  {id:"T13", country:"CHILE", flag:"🇨🇱"},
  {id:"MEGA", country:"CHILE", flag:"🇨🇱"},
  {id:"CHV", country:"CHILE", flag:"🇨🇱"},
  {id:"CNN CHILE", country:"CHILE", flag:"🇨🇱"},
  {id:"THE CLINIC", country:"CHILE", flag:"🇨🇱"},
  {id:"EX-ANTE", country:"CHILE", flag:"🇨🇱"},
  {id:"PULSO", country:"CHILE", flag:"🇨🇱"},
]

const GOLD = "#D4AF37"
const BG = "#080800"
const CARD = "#121208"
const BORDER = "#2A2610"

const COUNTRY_ORDER = ["USA","UK","ESPAÑA","FRANCIA","CHILE"]

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

 const counts = useMemo(()=>{
  const m:Record<string,number>={}
  CHAINS.forEach(c=>{
   m[c.id]=all.filter(n=>{
    const t=(JSON.stringify(n)+" "+(n.source||"")).toUpperCase()
    if(c.id==="W.POST") return t.includes("WASHINGTON")
    return t.includes(c.id)
   }).length
  })
  return m
 },[all])

 const grouped = useMemo(()=>{
  const g:Record<string, Chain[]> = {}
  CHAINS.forEach(c=>{
   if(!g[c.country]) g[c.country]=[]
   g[c.country].push(c)
  })
  return g
 },[])

 let f = all
 if(sel) f = f.filter(n=>{
  const t=(JSON.stringify(n)+" "+(n.source||"")).toUpperCase()
  if(sel==="W.POST") return t.includes("WASHINGTON")
  return t.includes(sel)
 })
 if(q) f = f.filter(n=> (n.title||"").toLowerCase().includes(q.toLowerCase()))

 return(
  <div style={{background:BG,minHeight:"100vh",color:GOLD,padding:"0 0 100px"}}>
    <div style={{position:"sticky",top:0,zIndex:20,background:BG,padding:"12px",borderBottom:`1px solid ${BORDER}`}}>
     <h1 style={{fontWeight:900,margin:0,fontSize:28}}>JANUS V3 ✓ <span style={{fontSize:11,color:"#666"}}>{f.length}/{all.length}</span></h1>
     <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en 26 cadenas..." style={{width:"100%",marginTop:10,background:"#151308",border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 12px",color:"#fff",outline:"none"}}/>
    </div>

    <div style={{padding:"10px 8px",display:"flex",flexDirection:"column",gap:14}}>
     {COUNTRY_ORDER.map(country=>{
      const chains = grouped[country]||[]
      const total = chains.reduce((s,c)=>s+(counts[c.id]||0),0)
      const flag = chains[0]?.flag||""
      return (
        <div key={country} style={{background:"#0F0F06",border:`1px solid ${BORDER}`,borderRadius:14,padding:"8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"0 4px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16}}>{flag}</span>
              <span style={{fontWeight:900,fontSize:12,letterSpacing:1,color:"#FFEB99"}}>{country}</span>
              <span style={{fontSize:10,color:"#666"}}>{chains.length} cadenas</span>
            </div>
            <div style={{background:GOLD,color:"#000",fontWeight:900,fontSize:11,borderRadius:20,padding:"3px 9px"}}>{total} noticias</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
            {chains.map(c=>{
              const active=sel===c.id
              const cnt=counts[c.id]||0
              return(
                <button key={c.id} onClick={()=>setSel(active?null:c.id)} style={{
                  background:active?GOLD: cnt>0?"#1F1B08":"#111",
                  color:active?"#000": cnt>0?"#FFEB99":"#444",
                  border:`1.5px solid ${active?GOLD: cnt>0?"#3A3518":"#222"}`,
                  borderRadius:10,padding:"6px 2px 4px",minHeight:44,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2
                }}>
                  <span style={{fontSize:9.5,fontWeight:900,lineHeight:"10px"}}>{c.id}</span>
                  <span style={{fontSize:10,fontWeight:900,background:active?"#000": cnt>0?GOLD:"#333",color:active?GOLD: cnt>0?"#000":"#666",borderRadius:10,padding:"1px 6px"}}>{cnt}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
     })}
    </div>

    <div style={{padding:"0 10px",marginTop:6,display:"flex",justifyContent:"space-between",fontSize:11,color:"#666"}}>
      <span>{sel?`Filtrando: ${sel}`:"Todas las cadenas"}</span>
      <button onClick={()=>setSel(null)} style={{background:"transparent",border:`1px solid ${GOLD}`,color:GOLD,borderRadius:20,padding:"2px 10px",fontSize:10}}>LIMPIAR</button>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:10,padding:"0 10px"}}>
     {f.map((n:any)=>
       <div key={n.id} style={{background:CARD,border:`1px solid ${BORDER}`,borderTop:`2px solid ${GOLD}`,borderRadius:12,padding:10}}>
        <div style={{fontSize:12,fontWeight:700,color:"#fff",lineHeight:"14px",minHeight:42}}>{n.title}</div>
        <div style={{fontSize:9,marginTop:8,color:GOLD,fontWeight:800,display:"flex",justifyContent:"space-between"}}><span>{n.source}</span><span style={{color:"#666"}}>{new Date(n.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span></div>
       </div>
     )}
    </div>
  </div>
 )
}
