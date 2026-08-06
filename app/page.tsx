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

function decodificarGoogleNews(url) {
  try {
    if (!url || url.indexOf('news.google.com') === -1) return url
    if (typeof atob === 'undefined') return url
    const m = url.match(/articles\/([A-Za-z0-9_-]+)/)
    if (!m) return url
    let str = m[1].replace(/-/g, '+').replace(/_/g, '/')
    while (str.length % 4) str += '='
    const decoded = atob(str)
    const found = decoded.match(/https?:\/\/[^"\x00-\x1F\s]+/g)
    if (found && found.length) {
      const real = found.filter(function(u){ return u.indexOf('google') === -1 }).sort(function(a,b){ return b.length - a.length })[0] || found[0]
      return real.replace(/[\x08\x0B\x0C]+/g, '').split('\x00')[0]
    }
    return url
  } catch(e) { return url }
}

function sacarCadena(item) {
  const t = (item.realLink || item.link || item.url || '') + ' ' + (item.title || '')
  const low = t.toLowerCase()
  if (low.indexOf('bbc')!== -1) return 'BBC'
  if (low.indexOf('guardian')!== -1) return 'GUARDIAN'
  if (low.indexOf('bio')!== -1) return 'BIOBIO'
  if (low.indexOf('emol')!== -1) return 'EMOL'
  if (low.indexOf('tercera')!== -1) return 'LA TERCERA'
  if (low.indexOf('elpais')!== -1) return 'EL PAIS'
  return 'OTROS'
}

export default function Page() {
  const [noticias, setNoticias] = useState([])
  const [pais, setPais] = useState('ALL')
  const [cadena, setCadena] = useState('ALL')
  const [buscar, setBuscar] = useState('')
  const [limite, setLimite] = useState('20')
  const [pagina, setPagina] = useState(1)
  const [hora, setHora] = useState('')
  const [segundos, setSegundos] = useState(300)
  const [sel, setSel] = useState(null)
  const [idioma, setIdioma] = useState('es')
  const [tituloTrad, setTituloTrad] = useState('')
  const [contenidoOrig, setContenidoOrig] = useState('')
  const [contenidoTrad, setContenidoTrad] = useState('')
  const [cargando, setCargando] = useState(false)
  const [traduciendo, setTraduciendo] = useState(false)

  const cargar = async () => {
    const res = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(200)
    if (res.data) {
      const conReal = res.data.map(function(n){
        const realLink = decodificarGoogleNews(n.link || n.url || '')
        return {...n, realLink: realLink, cadena: sacarCadena({...n, realLink: realLink }) }
      })
      setNoticias(conReal)
    }
    setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    setSegundos(300)
  }

  useEffect(() => {
    cargar()
    const t = setInterval(function(){
      setSegundos(function(s){
        if(s <= 1){ cargar(); return 300 }
        return s - 1
      })
    }, 1000)
    return function(){ clearInterval(t) }
  }, [])

  useEffect(() => { setPagina(1) }, [pais, cadena, buscar, limite])

  const traducir = async (texto, lang) => {
    if(!texto) return ''
    try{
      const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + lang + '&dt=t&q=' + encodeURIComponent(texto.slice(0, 3500))
      const res = await fetch(url)
      const j = await res.json()
      return j[0].map(function(x){ return x[0] }).join('')
    }catch(e){ return texto }
  }

  const traerArticulo = async (url) => {
    setCargando(true)
    try{
      const r = await fetch('https://r.jina.ai/' + url)
      const txt = await r.text()
      if(txt && txt.indexOf('AbuseAlleviation') === -1 && txt.length > 200){
        return txt.slice(0, 6000)
      }
      return ''
    }catch(e){ return '' }
    finally{ setCargando(false) }
  }

  const abrir = async (item) => {
    setSel(item)
    setIdioma('es')
    setTituloTrad(item.title)
    setContenidoTrad('Extrayendo noticia completa...')
    setContenidoOrig('')
    const realUrl = item.realLink || decodificarGoogleNews(item.link || item.url || '')
    const full = await traerArticulo(realUrl)
    const base = full || item.description || ''
    setContenidoOrig(base)
    setTraduciendo(true)
    const t1 = await traducir(item.title, 'es')
    const t2 = base? await traducir(base.slice(0, 2500), 'es') : 'Pulsa Leer fuente original.'
    setTituloTrad(t1)
    setContenidoTrad(t2)
    setTraduciendo(false)
  }

  const cambiarIdioma = async (lang) => {
    setIdioma(lang)
    setTraduciendo(true)
    const t1 = await traducir(sel.title, lang)
    const t2 = contenidoOrig? await traducir(contenidoOrig.slice(0, 2500), lang) : contenidoTrad
    setTituloTrad(t1)
    if(t2) setContenidoTrad(t2)
    setTraduciendo(false)
  }

  const getCountPais = (id) => {
    if(id === 'ALL') return noticias.length
    return noticias.filter(function(n){ return n.source && n.source.toUpperCase() === id }).length
  }

  const porPais = noticias.filter(function(n){
    if(pais === 'ALL') return true
    return n.source && n.source.toUpperCase() === pais
  })

  const cadenas = Array.from(new Set(porPais.map(function(n){ return n.cadena }))).sort()
  const contar = {}
  porPais.forEach(function(n){ contar[n.cadena] = (contar[n.cadena] || 0) + 1 })

  const final = porPais.filter(function(n){
    const okCadena = cadena === 'ALL' || n.cadena === cadena
    const okBuscar = n.title.toLowerCase().indexOf(buscar.toLowerCase())!== -1
    return okCadena && okBuscar
  })

  const itemsPorPagina = limite === 'TODAS'? final.length : parseInt(limite)
  const totalPaginas = Math.ceil(final.length / itemsPorPagina) || 1
  const inicio = (pagina - 1) * itemsPorPagina
  const visibles = final.slice(inicio, inicio + itemsPorPagina)

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white' }}>
      <style>{'@keyframes latir{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}.latir{animation:latir 1s infinite}'}</style>

      <div style={{ padding: '16px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#c9a86a', margin: 0, fontWeight: 900 }}>JANUS V3</h1>
        <div style={{ background: '#c9a86a', borderRadius: 20, padding: '8px 14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, color: 'black' }}>
          <div className={segundos <= 60? 'latir' : ''} style={{ width: 10, height: 10, borderRadius: 99, background: segundos <= 60? '#ef4444' : '#22c55e' }} />
          <div>{Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, '0')}</div>
        </div>
      </div>

      <div style={{ padding: '0 12px', color: '#666', fontSize: 12, marginBottom: 10 }}>Actualizado: {hora} - Pagina {pagina} de {totalPaginas} - {final.length}/{noticias.length}</div>

      <div style={{ padding: '0 12px', marginBottom: 8 }}>
        <input placeholder="Buscar..." value={buscar} onChange={function(e){ setBuscar(e.target.value) }} style={{ width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 14, padding: '14px', color: 'white' }} />
      </div>

      <div style={{ padding: '0 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#888', fontSize: 13 }}>Por pagina:</div>
        <select value={limite} onChange={function(e){ setLimite(e.target.value) }} style={{ background: '#141414', color: 'white', border: '1px solid #2a2a2a', borderRadius: 12, padding: '10px 16px', fontWeight: 800 }}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="TODAS">TODAS</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 12px' }}>
        {PAISES.map(function(p){
          const cant = getCountPais(p.id)
          const activo = pais === p.id
          return (
            <button key={p.id} onClick={function(){ setPais(p.id); setCadena('ALL') }} style={{ background: activo? '#c9a86a' : '#141414', color: activo? 'black' : 'white', borderRadius: 20, padding: '16px 6px', border: '1px solid #2a2a2a', fontWeight: 800 }}>
              <div style={{ fontSize: 28 }}>{p.flag}</div>
              <div style={{ marginTop: 6 }}>{p.label} <span style={{ background: activo? 'black' : '#c9a86a', color: activo? '#c9a86a' : 'black', borderRadius: 12, padding: '2px 8px', fontSize: 11, marginLeft: 4 }}>{cant}</span></div>
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
          <button onClick={function(){ setCadena('ALL') }} style={{ background: cadena === 'ALL'? '#c9a86a' : '#1e1e1e', color: cadena === 'ALL'? 'black' : '#888', borderRadius: 20, padding: '10px 16px', fontWeight: 900, border: '1px solid #333' }}>TODAS ({porPais.length})</button>
          {cadenas.map(function(c){
            return <button key={c} onClick={function(){ setCadena(c) }} style={{ background: cadena === c? '#c9a86a' : '#1e1e1e', color: cadena === c? 'black' : 'white', borderRadius: 20, padding: '10px 16px', fontWeight: 800, border: '1px solid #333' }}>{c} ({contar[c]})</button>
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 12px 12px' }}>
        {visibles.map(function(n){
          return (
            <div key={n.id} onClick={function(){ abrir(n) }} style={{ background: '#141414', borderRadius: 20, overflow: 'hidden', border: '1px solid #222' }}>
              <div style={{ position: 'relative', height: 120 }}>
                <img src={n.image || n.image_url || 'https://picsum.photos/seed/' + n.id + '/300/200'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.75)', color: '#c9a86a', borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>{n.cadena}</div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: '18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 54 }}>{n.title}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '0 12px 24px' }}>
        <button disabled={pagina === 1} onClick={function(){ setPagina(pagina - 1); window.scrollTo(0,0) }} style={{ background: pagina === 1? '#222' : '#c9a86a', color: pagina === 1? '#666' : 'black', borderRadius: 20, padding: '12px 18px', fontWeight: 900, border: '1px solid #333', opacity: pagina === 1? 0.5 : 1 }}>‹ Anterior</button>
        <div style={{ background: '#141414', borderRadius: 20, padding: '10px 16px', border: '1px solid #2a2a2a', fontWeight: 800, fontSize: 13 }}>{pagina} / {totalPaginas}</div>
        <button disabled={pagina === totalPaginas} onClick={function(){ setPagina(pagina + 1); window.scrollTo(0,0) }} style={{ background: pagina === totalPaginas? '#222' : '#c9a86a', color: pagina === totalPaginas? '#666' : 'black', borderRadius: 20, padding: '12px 18px', fontWeight: 900, border: '1px solid #333', opacity: pagina === totalPaginas? 0.5 : 1 }}>Siguiente ›</button>
      </div>

      {sel && (
        <div onClick={function(){ setSel(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={function(e){ e.stopPropagation() }} style={{ background: '#1a1a1a', borderRadius: 20, width: '100%', maxWidth: 460, border: '1px solid #333', marginTop: 10, overflow: 'hidden' }}>
            <img src={sel.image || sel.image_url || 'https://picsum.photos/seed/' + sel.id + '/400/250'} style={{ width: '100%', height: 220, objectFit: 'cover' }} alt="" />
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {IDIOMAS.map(function(id){
                  return <button key={id.id} onClick={function(){ cambiarIdioma(id.id) }} style={{ flex: 1, background: idioma === id.id? '#c9a86a' : '#222', color: idioma === id.id? 'black' : 'white', borderRadius: 12, padding: '10px 4px', fontWeight: 800, border: '1px solid #333' }}>{id.flag} {id.label}</button>
                })}
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 19, lineHeight: '26px' }}>{traduciendo? 'Traduciendo...' : tituloTrad}</h2>
              <div style={{ background: '#0f0f0f', borderRadius: 12, padding: 12, marginBottom: 14, border: '1px solid #222' }}>
                <div style={{ color: '#c9a86a', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>{cargando? 'EXTRAYENDO...' : 'NOTICIA COMPLETA'}</div>
                <div style={{ color: '#ddd', fontSize: 14, lineHeight: '21px', whiteSpace: 'pre-wrap', maxHeight: 380, overflowY: 'auto' }}>{cargando? 'Leyendo articulo...' : traduciendo? 'Traduciendo...' : contenidoTrad}</div>
              </div>
              <a href={sel.realLink || sel.link || sel.url} target="_blank" style={{ display: 'block', background: '#c9a86a', color: 'black', textAlign: 'center', padding: 14, borderRadius: 12, fontWeight: 900, textDecoration: 'none' }}>Leer fuente original</a>
              <button onClick={function(){ setSel(null) }} style={{ width: '100%', marginTop: 8, background: '#222', color: 'white', padding: 12, borderRadius: 12, border: '1px solid #333' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
