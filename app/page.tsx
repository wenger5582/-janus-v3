// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export default function Page(){
const [noticias,setNoticias]=useState<any[]>([])
const [pais,setPais]=useState('ALL')
const [cadena,setCadena]=useState('ALL')
const [buscar,setBuscar]=useState('')
const [hora,setHora]=useState('')
const [segundos,setSegundos]=useState(300)
const [sel,setSel]=useState<any>(null)
const cargar=async()=>{
const {data}=await supabase.from('news').select('*').order('created_at',{ascending:false}).limit(150)
if(data){setNoticias(data.map((n:any)=>{let c='OTROS';try{const h=new URL(n.link||n.url).hostname.toLowerCase();if(h.includes('bbc'))c='BBC';else if(h.includes('guardian'))c='GUARDIAN';else if(h.includes('biobio'))c='BIOBIO';else if(h.includes('emol'))c='EMOL';else if(h.includes('tercera'))c='LA TERCERA';else c=h.replace('www.','').split('.')[0].toUpperCase()}catch{c='OTROS'}return{...n,cadena:c}}))}
setHora(new Date().toLocaleTimeString('es-CL'))
setSegundos(300)
}
useEffect(()=>{cargar();const t=setInterval(()=>setSegundos(s=>s<=1?(cargar(),300):s-1),1000);return()=>clearInterval(t)},[])
const porPais=noticias.filter(n=>pais==='ALL'||n.source?.toUpperCase()===pais)
const cadenas=Array.from(new Set(porPais.map(n=>n.cadena)))
const contar:any={};porPais.forEach(n=>contar[n.cadena]=(contar[n.cadena]||0)+1)
const final=porPais.filter(n=>(cadena==='ALL'||n.cadena===cadena)&&n.title?.toLowerCase().includes(buscar.toLowerCase()))
return<div style={{background:'#0a0a0a',minHeight:'100vh',color:'white',padding:12}}>
<h1 style={{color:'#c9a86a'}}>JANUS V3 ● {Math.floor(segundos/60)}:{(segundos%60).toString().padStart(2,'0')}</h1>
<p style={{color:'#666',fontSize:11}}>{hora} • {final.length}/{noticias.length}</p>
<input placeholder="Buscar..." value={buscar} onChange={e=>setBuscar(e.target.value)} style={{width:'100%',background:'#1a1a1a',border:'1px solid #333',borderRadius:12,padding:10,color:'white',marginBottom:12}}/>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
{['ALL','USA','UK','ESPAÑA','FRANCIA','CHILE'].map(p=>{const cant=p==='ALL'?noticias.length:noticias.filter(n=>n.source?.toUpperCase()===p).length;return<button key={p} onClick={()=>{setPais(p);setCadena('ALL')}} style={{background:pais===p?'#c9a86a':'#1a1a1a',color:pais===p?'black':'white',borderRadius:12,padding:8}}>{p} ({cant})</button>})}
</div>
{pais!=='ALL'&&<div style={{background:'#141414',borderRadius:12,padding:10,marginBottom:12,display:'flex',flexWrap:'wrap',gap:6}}><button onClick={()=>setCadena('ALL')} style={{background:cadena==='ALL'?'#c9a86a':'#222',color:cadena==='ALL'?'black':'white',borderRadius:20,padding:'6px 10px'}}>TODAS ({porPais.length})</button>{cadenas.map(c=><button key={c} onClick={()=>setCadena(c)} style={{background:cadena===c?'#c9a86a':'#2a2a2a',color:cadena===c?'black':'white',borderRadius:20,padding:'6px 10px'}}>{c} ({contar[c]})</button>)}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{final.map(n=><div key={n.id} onClick={()=>setSel(n)} style={{background:'#141414',borderRadius:16,overflow:'hidden',border:'1px solid #333'}}><img src={n.image||n.image_url||`https://picsum.photos/seed/${n.id}/300/200`} style={{width:'100%',height:100,objectFit:'cover'}} alt=""/><div style={{padding:8}}><div style={{fontSize:10,background:'#c9a86a',color:'black',display:'inline-block',borderRadius:6,padding:'2px 6px',fontWeight:900}}>{n.cadena}</div><div style={{fontSize:12,marginTop:4}}>{n.title}</div></div></div>)}</div>
{sel&&<div onClick={()=>setSel(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div onClick={e=>e.stopPropagation()} style={{background:'#1a1a1a',borderRadius:16,padding:16,maxWidth:400,width:'100%'}}><h3>{sel.title}</h3><a href={sel.link||sel.url} target="_blank" style={{display:'block',background:'#c9a86a',color:'black',textAlign:'center',padding:12,borderRadius:12,marginTop:12,fontWeight:900,textDecoration:'none'}}>Leer completa</a><button onClick={()=>setSel(null)} style={{width:'100%',marginTop:8,background:'#333',color:'white',padding:10,borderRadius:12}}>Cerrar</button></div></div>}
</div>
}
