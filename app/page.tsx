// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PAISES = [
  { id: 'ALL', label: 'ALL', flag: '🌐' },
  { id: 'USA', label: 'USA', flag: '🇺🇸' },
  { id: 'UK', label: 'UK', flag: '🇬🇧' },
  { id: 'ESPAÑA', label: 'ESPAÑA', flag: '🇪🇸' },
  { id: 'FRANCIA', label: 'FRANCIA', flag: '🇫🇷' },
  { id: 'CHILE', label: 'CHILE', flag: '🇨🇱' },
]

function sacarCadena(item: any) {
  try {
    const url = item.link || item.url || ''
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('bbc')) return 'BBC'
    if (host.includes('guardian')) return 'GUARDIAN'
    if (host.includes('telegraph')) return 'TELEGRAPH'
    if (host.includes('dailymail')) return 'DAILY MAIL'
    if (host.includes('sky')) return 'SKY NEWS'
    if (host.includes('cnn')) return 'CNN'
    if (host.includes('nyt') || host.includes('nytimes')) return 'NYT'
    if (host.includes('fox')) return 'FOX'
    if (host.includes('biobio')) return 'BIOBIO'
    if (host.includes('emol')) return 'EMOL'
    if (host.includes('tercera')) return 'LA TERCERA'
    return host.replace('www.','').split('.')[0].toUpperCase()
  } catch {
    return 'OTROS'
  }
}

export default function Page() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [pais, setPais] = useState('ALL')
  const [cadena, setCadena] = useState('ALL')
  const [buscar, setBuscar] = useState('')
  const [hora, setHora] = useState('')
  const [segundos, setSegundos] = useState(300)
  const [seleccionada, setSeleccionada] = useState<any>(null)

  const cargar = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(150)
    if (data) setNoticias(data.map(n => ({...n, cadena: sacarCadena(n)})))
    setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    setSegundos(300)
  }

  useEffect(() => { cargar(); const t = setInterval(() => setSegundos(s => s <= 1? (cargar(), 300) : s - 1), 1000); return () => clearInterval(t) }, [])

  const porPais = noticias.filter(n => pais === 'ALL' || n.source?.toUpperCase() === pais)
  const cadenasDelPais = Array.from(new Set(porPais.map(n => n.cadena))).sort()
  const contar: any = {}; porPais.forEach(n => contar[n.cadena] = (contar[n.cadena] || 0) + 1)
  const final = porPais.filter(n => (cadena === 'ALL' || n.cadena === cadena) && n.title?.toLowerCase().includes(buscar.toLowerCase()))
  const esRojo = segundos <= 60

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <style>{`@keyframes latir { 0% { transform: scale(1) } 50% { transform: scale(1.2) } 100% { transform: scale(1) } }.latir { animation: latir 0.7s infinite }`}</style>
      <div style={{ padding: 12, position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#c9a86a', margin: 0 }}>JANUS V3</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={cargar} className={esRojo? 'latir' : ''} style={{ width: 42, height: 42, borderRadius: 99, background: esRojo? 'radial-gradient(circle at 30% 30%, #fecaca, #ef4444 45%, #7f1d1d)' : 'radial-gradient(circle at 30% 30%, #bbf7d0, #22c55e 45%, #14532d)' }}></button>
            <div className={esRojo? 'latir' : ''} style={{ background: esRojo? '#ef4444' : '#22c55e', color: esRojo? 'white' : 'black', borderRadius: 20, padding: '8px 14px', fontWeight: 900 }}>● {Math.floor(segundos/60)}:{(segundos%60).toString().padStart(2,'0')}</div>
          </div>
        <p style={{ color: '#666', fontSize: 11 }}>Actualizado: {hora} • {final.length}/{noticias.length}</p>
        <input placeholder="Buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 10, color: 'white' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 12 }}>
        {PAISES.map(p => {
          const cant = p.id === 'ALL'? noticias.length : noticias.filter(n => n.source?.toUpperCase() === p.id).length
          return <button key={p.id} onClick={() => { setPais(p.id); setCadena('ALL') }} style={{ background: pais===p.id? '#c9a86a' : '#1a1a1a', color: pais===p.id? 'black' : 'white', borderRadius: 16, padding: 10, fontWeight: 800 }}>{p.flag} {p.label} ({cant})</button>
        })}
      </div>

      {pais!== 'ALL' && (
        <div style={{ background: '#141414', margin: 12, borderRadius: 16, padding: 12, border: '1px solid #333' }}>
          <div style={{ color: '#c9a86a', fontWeight: 800, marginBottom: 8 }}>CADENAS EN {pais} - {porPais.length}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button onClick={() => setCadena('ALL')} style={{ background: cadena==='ALL'? '#c9a86a' : '#222', color: cadena==='ALL'? 'black' : 'white', borderRadius: 20, padding: '8px 14px', fontWeight: 900 }}>TODAS ({porPais.length})</button>
            {cadenasDelPais.map(c => <button key={c} onClick={() => setCadena(c)} style={{ background: cadena===c? '#c9a86a' : '#2a2a2a', color: cadena===c? 'black' : 'white', borderRadius: 20, padding: '8px 14px', fontWeight: 800 }}>{c} ({contar[c]})</button>)}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12 }}>
        {final.map(n => (
          <div key={n.id} onClick={() => setSeleccionada(n)} style={{ background: '#141414', borderRadius: 18, overflow: 'hidden', border: '1px solid #333' }}>
            <img src={n.image || n.image_url || `https://picsum.photos/seed/${n.id}/300/200`} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
            <div style={{ padding: 10 }}><div style={{ background: '#c9a86a', color: 'black', fontSize: 10, fontWeight: 900, display: 'inline-block', borderRadius: 8, padding: '2px 6px' }}>{n.cadena}</div><div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{n.title}</div></div>
          </div>
        ))}
      </div>

      {seleccionada && (
        <div onClick={() => setSeleccionada(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: 20, width: '100%', maxWidth: 400 }}>
            <img src={seleccionada.image || `https://picsum.photos/seed/${seleccionada.id}/400/250`} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            <div style={{ padding: 16 }}><h2>{seleccionada.title}</h2><div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button onClick={() => setSeleccionada(null)} style={{ flex: 1, background: '#333', color: 'white', borderRadius: 12, padding: 12 }}>Cerrar</button><a href={seleccionada.link || seleccionada.url} target="_blank" style={{ flex: 2, background: '#c9a86a', color: 'black', borderRadius: 12, padding: 12, textAlign: 'center', fontWeight: 900, textDecoration: 'none' }}>Leer</a></div></div>
          </div>
        </div>
      )}
    </div>
  )
}
