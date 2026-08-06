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
  const todo = `${item.link || ''} ${item.url || ''} ${item.title || ''}`.toLowerCase()
  let host = ''
  try { host = new URL(item.link || item.url).hostname.toLowerCase() } catch { host = '' }
  if (todo.includes('bbc')) return 'BBC'
  if (todo.includes('guardian')) return 'GUARDIAN'
  if (todo.includes('sky')) return 'SKY NEWS'
  if (todo.includes('cnn')) return 'CNN'
  if (todo.includes('nytimes') || todo.includes('nyt')) return 'NYT'
  if (todo.includes('fox')) return 'FOX'
  if (todo.includes('wsj')) return 'WSJ'
  if (todo.includes('biobio')) return 'BIOBIO'
  if (todo.includes('emol')) return 'EMOL'
  if (todo.includes('tercera')) return 'LA TERCERA'
  if (todo.includes('cooperativa')) return 'COOP'
  if (todo.includes('t13')) return 'T13'
  if (todo.includes('chv')) return 'CHV'
  if (todo.includes('mega')) return 'MEGA'
  if (todo.includes('adn')) return 'ADN'
  if (todo.includes('elpais')) return 'EL PAIS'
  if (todo.includes('elmundo')) return 'EL MUNDO'
  if (todo.includes('lemonde')) return 'LE MONDE'
  if (todo.includes('lefigaro')) return 'LE FIGARO'
  if (host.includes('google')) return 'GOOGLE'
  return host? host.replace('www.','').split('.')[0].toUpperCase().slice(0,12) : 'OTROS'
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
  const [traducidoTitulo, setTraducidoTitulo] = useState('')
  const [contenidoOriginal, setContenidoOriginal] = useState('')
  const [contenidoTraducido, setContenidoTraducido] = useState('')
  const [cargandoContenido, setCargandoContenido] = useState(false)
  const [traduciendo, setTraduciendo] = useState(false)

  const cargar = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(200)
    if (data) setNoticias(data.map((n: any) => ({...n, cadena: sacarCadena(n)})))
    setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    setSegundos(300)
  }

  useEffect(() => { cargar(); const t = setInterval(() => setSegundos(s => s <= 1? (cargar(), 300) : s - 1), 1000); return () => clearInterval(t) }, [])

  const traducir = async (texto: string, lang: string) => {
    if (!texto) return ''
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(texto.slice(0,4000))}`)
      const json = await res.json()
      return json[0]?.map((p:any)=>p[0]).join('') || texto
    } catch { return texto }
  }

  const obtenerContenidoCompleto = async (url: string) => {
    if (!url) return ''
    setCargandoContenido(true)
    try {
      // Jina AI extrae el articulo limpio gratis
      const r = await fetch(`https://r.jina.ai/${url}`, { headers: { 'X-Return-Format': 'text' } })
      let txt = await r.text()
      // Limpiamos un poco el markdown que devuelve Jina
      txt = txt.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[[^\]]*\]\([^)]*\)/g, '').slice(0, 4000)
      return txt || ''
    } catch {
      return ''
    } finally {
      setCargandoContenido(false)
    }
  }

  const abrirNoticia = async (item: any) => {
    setSel(item)
    setIdioma('es')
    setContenidoOriginal('')
    setContenidoTraducido('')
    setTraducidoTitulo(item.title)

    // 1. Traer contenido real
    const original = await obtenerContenidoCompleto(item.link || item.url)
    const base = original || item.description || item.content || item.summary || ''
    setContenidoOriginal(base)

    // 2. Traducir a español por defecto
    if (base) {
      setTraduciendo(true)
      const tTitulo = await traducir(item.title, 'es')
      const tCont = await traducir(base.slice(0,2000), 'es')
      setTraducidoTitulo(tTitulo)
      setContenidoTraducido(tCont)
      setTraduciendo(false)
    } else {
      setContenidoTraducido('No se pudo extraer el contenido. Pulsa abajo para leer la fuente original.')
    }
  }

  const cambiarIdioma = async (lang: string) => {
    setIdioma(lang)
    setTraduciendo(true)
    const tTitulo = await traducir(sel.title, lang)
    const tCont = await traducir((contenidoOriginal || sel.description || '').slice(0,2000), lang)
    setTraducidoTitulo(tTitulo)
    setContenidoTraducido(tCont)
    setTraduciendo(false)
  }

  const porPais = noticias.filter(n => {
    if (pais === 'ALL') return true
    if (pais === 'FRANCIA') return n.source?.toUpperCase() === 'FRANCIA' || ['LE MONDE','LE FIGARO'].includes(n.cadena)
    if (pais === 'ESPAÑA') return n.source?.toUpperCase() === 'ESPAÑA' || ['EL PAIS','EL MUNDO'].includes(n.cadena)
    return n.source?.toUpperCase() === pais
  })
  const cadenas = Array.from(new Set(porPais.map(n => n.cadena))).filter(c => c!== 'OTROS').sort()
  const contar: any = {}; porPais.forEach(n => { if (n.cadena!== 'OTROS') contar[n.cadena] = (contar[n.cadena] || 0) + 1 })
  const final = porPais.filter(n => (cadena === 'ALL' || n.cadena === cadena) && n.title?.toLowerCase().includes(buscar.toLowerCase()))

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white' }}>
      <style>{`@keyframes latir { 0% { transform: scale(1) } 50% { transform: scale(1.4) } 100% { transform: scale(1) } }.latir { animation: latir 1s infinite }`}</style>
      <div style={{ padding: '16px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#c9a86a', margin: 0, fontWeight: 900 }}>JANUS V3</h1>
        <div style={{ background: '#c9a86a', borderRadius: 20, padding: '8px 14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, color: 'black' }}>
          <div className={segundos <= 60? 'latir' : ''} style={{ width: 10, height: 10, borderRadius: 99, background: segundos <= 60? '#ef4444' : '#22c55e' }}></div>
          {Math.floor(segundos/60)}:{(segundos%60).toString().padStart(2,'0')}
        </div>
      <div style={{ padding: '0 12px', color: '#666', fontSize: 12, marginBottom: 10 }}>Actualizado: {hora} • {final.length}/{noticias.length}</div>
      <div style={{ padding: '0 12px', marginBottom: 12 }}><input placeholder="Buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 14, padding: '14px', color: 'white' }} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 12px' }}>
        {PAISES.map(p => {
          let cant = p.id === 'ALL'? noticias.length : noticias.filter(n => n.source?.toUpperCase() === p.id || (p.id==='FRANCIA' && ['LE MONDE','LE FIGARO'].includes(n.cadena)) || (p.id==='ESPAÑA' && ['EL PAIS','EL MUNDO'].includes(n.cadena))).length
          const activo = pais === p.id
          return (<button key={p.id} onClick={() => { setPais(p.id); setCadena('ALL') }} style={{ background: activo? '#c9a86a' : '#141414', color: activo? 'black' : 'white', borderRadius: 20, padding: '16px 6px', border: '1px solid #2a2a2a', fontWeight: 800 }}><div style={{ fontSize: 28 }}>{p.flag}</div><div style={{ marginTop: 6 }}>{p.label} <span style={{ background: activo? 'black' : '#c9a86a', color: activo? '#c9a86a' : 'black', borderRadius: 12, padding: '2px 8px', fontSize: 12 }}>{cant}</span></div></button>)
        })}
      </div>
      <div style={{ background: '#0f0f0f', margin: 12, borderRadius: 20, padding: 14, border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ color: '#c9a86a', fontWeight: 800, fontSize: 13 }}>CADENAS EN {pais}</span><span style={{ color: '#888', fontSize: 13 }}>{porPais.length} noticias</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button onClick={() => setCadena('ALL')} style={{ background: cadena === 'ALL'? '#c9a86a' : '#1e1e1e', color: cadena === 'ALL'? 'black' : '#888', borderRadius: 20, padding: '10px 16px', fontWeight: 900, border: '1px solid #333' }}>TODAS ({porPais.length})</button>
          {cadenas.map(c => (<button key={c} onClick={() => setCadena(c)} style={{ background: cadena === c? '#c9a86a' : '#1e1e1e', color: cadena === c? 'black' : 'white', borderRadius: 20, padding: '10px 16px', fontWeight: 800, border: '1px solid #333' }}>{c} ({contar[c]})</button>))}
        </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 12px 20px' }}>
        {final.map(n => (
          <div key={n.id} onClick={() => abrirNoticia(n)} style={{ background: '#141414', borderRadius: 20, overflow: 'hidden', border: '1px solid #222' }}>
            <div style={{ position: 'relative', height: 120 }}>
              <img src={n.image || n.image_url || `https://picsum.photos/seed/${n.id}/300/200`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.75)', color: '#c9a86a', borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>{n.cadena}</div>
              <div style={{ position: 'absolute', top: 8, right: 8, background: '#c9a86a', color: 'black', borderRadius: 12, padding: '3px 7px', fontSize: 10, fontWeight: 900 }}>🌐</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: '18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', minHeight: 54 }}>{n.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#666', fontSize: 11 }}><span>{new Date(n.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span><span style={{ color: '#c9a86a' }}>Ver →</span></div>
            </div>
          </div>
        ))}
      </div>

      {sel && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: 20, width: '100%', maxWidth: 460, overflow: 'hidden', border: '1px solid #333', marginTop: 10, marginBottom: 20 }}>
            <img src={sel.image || sel.image_url || `https://picsum.photos/seed/${sel.id}/400/250`} style={{ width: '100%', height: 220, objectFit: 'cover' }} alt="" />
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {IDIOMAS.map(id => (
                  <button key={id.id} onClick={() => cambiarIdioma(id.id)} style={{ flex: 1, background: idioma === id.id? '#c9a86a' : '#222', color: idioma === id.id? 'black' : 'white', borderRadius: 12, padding: '10px 4px', fontWeight: 800, border: '1px solid #333', fontSize: 13 }}>
                    {id.flag} {id.label}
                  </button>
                ))}
              </div>

              <h2 style={{ margin: '0 0 12px', fontSize: 19, lineHeight: '26px' }}>{traduciendo? 'Traduciendo...' : traducidoTitulo}</h2>

              <div style={{ background: '#0f0f0f', borderRadius: 12, padding: 12, marginBottom: 14, border: '1px solid #222', maxHeight: 350, overflowY: 'auto' }}>
                <div style={{ color: '#c9a86a', fontSize: 11, fontWeight: 900, marginBottom: 8, letterSpacing: 1 }}>{cargandoContenido? 'EXTRAYENDO NOTICIA...' : 'NOTICIA COMPLETA'}</div>
                <div style={{ color: '#ddd', fontSize: 14, lineHeight: '21px', whiteSpace: 'pre-wrap' }}>
                  {cargandoContenido? 'Leyendo artículo original...' : traduciendo? 'Traduciendo contenido...' : contenidoTraducido}
                </div>
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
