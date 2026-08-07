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

const IDIOMAS = [
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
]

function sacarCadena(item: any) {
  const t = `${item.link || ''} ${item.url || ''} ${item.title || ''}`.toLowerCase()
  if (t.includes('bbc')) return 'BBC'
  if (t.includes('guardian')) return 'GUARDIAN'
  if (t.includes('sky')) return 'SKY NEWS'
  if (t.includes('cnn')) return 'CNN'
  if (t.includes('biobio')) return 'BIOBIO'
  if (t.includes('emol')) return 'EMOL'
  if (t.includes('tercera')) return 'LA TERCERA'
  if (t.includes('elpais')) return 'EL PAIS'
  if (t.includes('elmundo')) return 'EL MUNDO'
  if (t.includes('lemonde')) return 'LE MONDE'
  if (t.includes('lefigaro')) return 'LE FIGARO'
  return 'GOOGLE'
}

export default function Page() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [pais, setPais] = useState('ALL')
  const [cadena, setCadena] = useState('ALL')
  const [buscar, setBuscar] = useState('')
  const [hora, setHora] = useState('')
  const [segundos, setSegundos] = useState(300)
  const [sel, setSel] = useState<any>(null)
  const [idioma, setIdioma] = useState('es')
  const [tituloTrad, setTituloTrad] = useState('')
  const [contenidoOrig, setContenidoOrig] = useState('')
  const [contenidoTrad, setContenidoTrad] = useState('')
  const [cargando, setCargando] = useState(false)
  const [traduciendo, setTraduciendo] = useState(false)

  const cargar = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(200)
    if (data) setNoticias(data.map((n: any) => ({...n, cadena: sacarCadena(n) })))
    setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    setSegundos(300)
  }

  useEffect(() => {
    cargar()
    const t = setInterval(() => setSegundos(s => s <= 1? (cargar(), 300) : s - 1), 1000)
    return () => clearInterval(t)
  }, [])

  const traducir = async (texto: string, lang: string) => {
    if (!texto) return ''
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(texto.slice(0, 3500))}`)
      const j = await res.json()
      return j[0].map((x: any) => x[0]).join('')
    } catch { return texto }
  }

  const traerArticulo = async (url: string) => {
    if (!url) return ''
    setCargando(true)
    try {
      const r = await fetch(`/api/article?url=${encodeURIComponent(url)}`)
      const j = await r.json()
      return (j.text || '').slice(0, 5000)
    } catch { return '' }
    finally { setCargando(false) }
  }

  const abrir = async (item: any) => {
    setSel(item)
    setIdioma('es')
    setTituloTrad(item.title)
    setContenidoOrig('')
    setContenidoTrad('Extrayendo noticia completa...')
    const full = await traerArticulo(item.link || item.url)
    const base = full || item.description || ''
    setContenidoOrig(base)
    setTraduciendo(true)
    const t1 = await traducir(item.title, 'es')
    const t2 = await traducir(base.slice(0, 2000), 'es')
    setTituloTrad(t1)
    setContenidoTrad(t2 || 'Pulsa abajo para leer fuente original')
    setTraduciendo(false)
  }

  const cambiarIdioma = async (lang: string) => {
    setIdioma(lang)
    setTraduciendo(true)
    const t1 = await traducir(sel.title, lang)
    const t2 = await traducir(contenidoOrig.slice(0, 2000), lang)
    setTituloTrad(t1)
    setContenidoTrad(t2)
    setTraduciendo(false)
  }

  const porPais = noticias.filter(n => {
    if (pais === 'ALL') return true
    if (pais === 'FRANCIA') return n.source?.toUpperCase() === 'FRANCIA' || ['LE MONDE', 'LE FIGARO'].includes(n.cadena)
    if (pais === 'ESPAÑA') return n.source?.toUpperCase() === 'ESPAÑA' || ['EL PAIS', 'EL MUNDO'].includes(n.cadena)
    return n.source?.toUpperCase() === pais
  })

  const cadenas = Array.from(new Set(porPais.map(n => n.cadena))).sort()
  const contar: any = {}
  porPais.forEach(n => { contar[n.cadena] = (contar[n.cadena] || 0) + 1 })
  const final = porPais.filter(n => (cadena === 'ALL' || n.cadena === cadena) && n.title.toLowerCase().includes(buscar.toLowerCase()))

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white' }}>
      <style>{`@keyframes latir{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}.latir{animation:latir 1s infinite}`}</style>
      <div style={{ padding: '16px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#c9a86a', margin: 0, fontWeight: 900 }}>JANUS V3</h1>
        <div style={{ background: '#c9a86a', borderRadius: 20, padding: '8px 14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, color: 'black' }}>
          <div className={segundos <= 60? 'latir' : ''} style={{ width: 10, height: 10, borderRadius: 99, background: segundos <= 60? '#ef4444' : '#22c55e' }} />
          {Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, '0')}
        </div>
      </div>
      <div style={{ padding: '0 12px', color: '#666', fontSize: 12, marginBottom: 10 }}>Actualizado: {hora} • {final.length}/{noticias.length}</div>
      <div style={{ padding: '0 12px', marginBottom: 12 }}>
        <input placeholder="Buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 14, padding: '14px', color: 'white' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 12px' }}>
        {PAISES.map(p => {
          const activo = pais === p.id
          return (
            <button key={p.id} onClick={() => { setPais(p.id); setCadena('ALL') }} style={{ background: activo? '#c9a86a' : '#141414', color: activo? 'black' : 'white', borderRadius: 20, padding: '16px 6px', border: '1px solid #2a2a2a', fontWeight: 800 }}>
              <div style={{ fontSize: 28 }}>{p.flag}</div>
              <div style={{ marginTop: 6 }}>{p.label} <span style={{ background: activo? 'black' : '#c9a86a', color: activo? '#c9a86a' : 'black', borderRadius: 12, padding: '2px 8px', fontSize: 12 }}>{p.id === 'ALL'? noticias.length : porPais.length}</span></div>
            </button>
          )
        })}
      </div>
      <div style={{ background: '#0f0f0f', margin: 12, borderRadius: 20, padding: 14, border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: '#c9a86a', fontWeight: 800, fontSize: 13 }}>CADENAS EN {pais}</span>
          <span style={{ color: '#888', fontSize: 13 }}>{porPais.length} noticias</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button onClick={() => setCadena('ALL')} style={{ background: cadena === 'ALL'? '#c9a86a' : '#1e1e1e', color: cadena === 'ALL'? 'black' : '#888', borderRadius: 20, padding: '10px 16px', fontWeight: 900, border: '1px solid #333' }}>TODAS ({porPais.length})</button>
          {cadenas.map(c => (
            <button key={c} onClick={() => setCadena(c)} style={{ background: cadena === c? '#c9a86a' : '#1e1e1e', color: cadena === c? 'black' : 'white', borderRadius: 20, padding: '10px 16px', fontWeight: 800, border: '1px solid #333' }}>{c} ({contar[c]})</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 12px 20px' }}>
        {final.map(n => (
          <div key={n.id} onClick={() => abrir(n)} style={{ background: '#141414', borderRadius: 20, overflow: 'hidden', border: '1px solid #222' }}>
            <div style={{ position: 'relative', height: 120 }}>
              <img src={n.image || n.image_url || `https://picsum.photos/seed/${n.id}/300/200`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.75)', color: '#c9a86a', borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>{n.cadena}</div>
              <div style={{ position: 'absolute', top: 8, right: 8, background: '#c9a86a', color: 'black', borderRadius: 12, padding: '3px 7px', fontSize: 10, fontWeight: 900 }}>🌐</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: '18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', minHeight: 54 }}>{n.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#666', fontSize: 11 }}>
                <span>{new Date(n.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ color: '#c9a86a' }}>Ver →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: 20, width: '100%', maxWidth: 460, border: '1px solid #333', marginTop: 10, overflow: 'hidden' }}>
            <img src={sel.image || sel.image_url || `https://picsum.photos/seed/${sel.id}/400/250`} style={{ width: '100%', height: 220, objectFit: 'cover' }} alt="" />
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {IDIOMAS.map(id => (
                  <button key={id.id} onClick={() => cambiarIdioma(id.id)} style={{ flex: 1, background: idioma === id.id? '#c9a86a' : '#222', color: idioma === id.id? 'black' : 'white', borderRadius: 12, padding: '10px 4px', fontWeight: 800, border: '1px solid #333' }}>{id.flag} {id.label}</button>
                ))}
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 19, lineHeight: '26px' }}>{traduciendo? 'Traduciendo...' : tituloTrad}</h2>
              <div style={{ background: '#0f0f0f', borderRadius: 12, padding: 12, marginBottom: 14, border: '1px solid #222' }}>
                <div style={{ color: '#c9a86a', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>{cargando? 'EXTRAYENDO...' : 'NOTICIA COMPLETA'}</div>
                <div style={{ color: '#ddd', fontSize: 14, lineHeight: '21px', whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto' }}>{cargando? 'Leyendo artículo original...' : traduciendo? 'Traduciendo contenido...' : contenidoTrad}</div>
              </div>
              <a href={sel.link || sel.url} target="_blank" style={{ display: 'block', background: '#c9a86a', color: 'black', textAlign: 'center', padding: 14, borderRadius: 12, fontWeight: 900, textDecoration: 'none' }}>Leer fuente original →</a>
              <button onClick={() => setSel(null)} style={{ width: '100%', marginTop: 8, background: '#222', color: 'white', padding: 12, borderRadius: 12, border: '1px solid #333' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
