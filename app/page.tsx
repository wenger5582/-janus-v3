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
    const url = (item.link || item.url || '').toLowerCase()
    const host = new URL(item.link || item.url).hostname.toLowerCase()
    if (host.includes('bbc') || url.includes('bbc')) return 'BBC'
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
    if (host.includes('cooperativa')) return 'COOP'
    if (host.includes('t13')) return 'T13'
    return host.replace('www.','').split('.')[0].toUpperCase()
  } catch { return 'OTROS' }
}

export default function Page() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [pais, setPais] = useState('UK')
  const [cadena, setCadena] = useState('ALL')
  const [buscar, setBuscar] = useState('')
  const [hora, setHora] = useState('')
  const [segundos, setSegundos] = useState(248)
  const [sel, setSel] = useState<any>(null)

  const cargar = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(150)
    if (data) setNoticias(data.map((n: any) => ({...n, cadena: sacarCadena(n) })))
    setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    setSegundos(300)
  }

  useEffect(() => {
    cargar()
    const t = setInterval(() => setSegundos(s => { if (s <= 1) { cargar(); return 300 } return s - 1 }), 1000)
    return () => clearInterval(t)
  }, [])

  const porPais = noticias.filter(n => pais === 'ALL' || n.source?.toUpperCase() === pais)
  const cadenas = Array.from(new Set(porPais.map(n => n.cadena))).sort()
  const contar: any = {}; porPais.forEach(n => contar[n.cadena] = (contar[n.cadena] || 0) + 1)
  const final = porPais.filter(n => (cadena === 'ALL' || n.cadena === cadena) && n.title?.toLowerCase().includes(buscar.toLowerCase()))
  const esRojo = segundos <= 60

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white' }}>
      <style>{`@keyframes latir { 0% { transform: scale(1) } 50% { transform: scale(1.2) } 100% { transform: scale(1) } }.latir { animation: latir 0.7s infinite }`}</style>

      <div style={{ padding: '16px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#c9a86a', margin: 0, fontWeight: 900, letterSpacing: 1 }}>JANUS V3</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className={esRojo? 'latir' : ''} style={{ width: 38, height: 38, borderRadius: 99, background: esRojo? 'radial-gradient(circle at 30% 30%, #fecaca, #ef4444 45%, #7f1d1d)' : 'radial-gradient(circle at 30% 30%, #bbf7d0, #22c55e 45%, #14532d)', boxShadow: esRojo? '0 0 15px rgba(239,68,68,0.8)' : '0 0 15px rgba(34,197,94,0.6)' }}></div>
          <div style={{ background: '#22c55e', color: 'black', borderRadius: 20, padding: '8px 14px', fontWeight: 900, fontSize: 14 }}>● {Math.floor(segundos/60)}:{(segundos%60).toString().padStart(2,'0')}</div>
        </div>
      </div>

      <div style={{ padding: '0 12px', color: '#666', fontSize: 12, marginBottom: 10 }}>Actualizado: {hora} • {final.length}/{noticias.length}</div>

      <div style={{ padding: '0 12px', marginBottom: 12 }}>
        <input placeholder="Buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 14, padding: '14px', color: 'white' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 12px' }}>
        {PAISES.map(p => {
          const cant = p.id === 'ALL'? noticias.length : noticias.filter(n => n.source?.toUpperCase() === p.id).length
          const activo = pais === p.id
          return (
            <button key={p.id} onClick={() => { setPais(p.id); setCadena('ALL') }} style={{ background: activo? '#c9a86a' : '#141414', color: activo? 'black' : 'white', borderRadius: 20, padding: '16px 6px', border: '1px solid #2a2a2a', fontWeight: 800 }}>
              <div style={{ fontSize: 28 }}>{p.flag}</div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>{p.label} <span style={{ background: activo? 'black' : '#c9a86a', color: activo? '#c9a86a' : 'black', borderRadius: 12, padding: '2px 8px', fontSize: 12 }}>{cant}</span></div>
            </button>
          )
        })}
      </div>

      <div style={{ background: '#0f0f0f', margin: 12, borderRadius: 20, padding: 14, border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ color: '#c9a86a', fontWeight: 800, fontSize: 13 }}>CADENAS EN {pais}</span><span style={{ color: '#888', fontSize: 13 }}>{porPais.length} noticias</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button onClick={() => setCadena('ALL')} style={{ background: cadena === 'ALL'? '#c9a86a' : '#1e1e1e', color: cadena === 'ALL'? 'black' : '#555', borderRadius: 20, padding: '10px 16px', fontWeight: 900, border: '1px solid #333' }}>TODAS ({porPais.length})</button>
          {cadenas.map(c => (
            <button key={c} onClick={() => setCadena(c)} style={{ background: cadena === c? '#c9a86a' : '#1e1e1e', color: cadena === c? 'black' : 'white', borderRadius: 20, padding: '10px 16px', fontWeight: 800, border: '1px solid #333' }}>{c} ({contar[c]})</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 12px 20px' }}>
        {final.map(n => (
          <div key={n.id} onClick={() => setSel(n)} style={{ background: '#141414', borderRadius: 20, overflow: 'hidden', border: '1px solid #222' }}>
            <div style={{ position: 'relative', height: 120 }}>
              <img src={n.image || n.image_url || `https://picsum.photos/seed/${n.id}/300/200`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#c9a86a', borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>{n.cadena}</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: '18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', minHeight: 54 }}>{n.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#666', fontSize: 11 }}><span>{new Date(n.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span><span style={{ color: '#c9a86a' }}>Ver →</span></div>
            </div>
          </div>
        ))}
      </div>

      {sel && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: 20, width: '100%', maxWidth: 400, overflow: 'hidden' }}>
            <img src={sel.image || sel.image_url || `https://picsum.photos/seed/${sel.id}/400/250`} style={{ width: '100%', height: 200, objectFit: 'cover' }} alt="" />
            <div style={{ padding: 16 }}><h3 style={{ margin: '0 0 12px' }}>{sel.title}</h3><a href={sel.link || sel.url} target="_blank" style={{ display: 'block', background: '#c9a86a', color: 'black', textAlign: 'center', padding: 14, borderRadius: 12, fontWeight: 900, textDecoration: 'none' }}>Leer completa →</a><button onClick={() => setSel(null)} style={{ width: '100%', marginTop: 8, background: '#222', color: 'white', padding: 12, borderRadius: 12, border: '1px solid #333' }}>Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
