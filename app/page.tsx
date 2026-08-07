'use client'
import { useState, useEffect, useMemo } from 'react'

const FILTERS = [
  { id: 'TODOS', label: 'TODOS', flag: '🌎' },
  { id: 'CHILE', label: 'CHILE', flag: '🇨🇱' },
  { id: 'ESPAÑA', label: 'ESPAÑA', flag: '🇪🇸' },
  { id: 'FRANCIA', label: 'FRANCIA', flag: '🇫🇷' },
  { id: 'USA', label: 'USA', flag: '🇺🇸' },
  { id: 'UK', label: 'UK', flag: '🇬🇧' },
]

export default function Home() {
  const [news, setNews] = useState<any[]>([])
  const [filter, setFilter] = useState('TODOS')
  const [selected, setSelected] = useState<any>(null)
  const [lang, setLang] = useState<'es' | 'en' | 'ru'>('es')
  const [tTitle, setTTitle] = useState('')
  const [tDesc, setTDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [transLoading, setTransLoading] = useState(false)

  useEffect(() => { fetch('/api/news').then(r => r.json()).then(d => { setNews(d || []); setLoading(false) }) }, [])

  const filtered = useMemo(() => filter === 'TODOS' ? news : news.filter((n: any) => n.source === filter), [news, filter])

  useEffect(() => {
    if (!selected) return
    setTTitle(selected.title); setTDesc(selected.description)
    if ((lang === 'es' && (selected.source === 'CHILE' || selected.source === 'ESPAÑA')) || (lang === 'en' && (selected.source === 'USA' || selected.source === 'UK'))) return
    ;(async () => {
      setTransLoading(true)
      const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: selected.title + ' ||| ' + selected.description, target: lang, source: selected.source }) })
      const data = await res.json()
      const parts = (data.translated || '').split(' ||| ')
      setTTitle(parts[0] || selected.title); setTDesc(parts[1] || selected.description); setTransLoading(false)
    })()
  }, [lang, selected])

  if (loading) return <div style={{ minHeight: '100vh', background: 'black', color: 'white', display: 'grid', placeItems: 'center' }}>JANUS V3</div>

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white' }}>
      <div style={{ textAlign: 'center', padding: '40px 0 10px' }}>
        <h1 style={{ fontSize: 46, fontWeight: 900, letterSpacing: 14, margin: 0, fontFamily: 'serif' }}>JANUS V3</h1>
        <div style={{ color: '#C7A46B', fontSize: 11, letterSpacing: 4, fontWeight: 800, marginTop: 8 }}>{filtered.length} NOTICIAS • 5 PAISES</div>
      </div>

      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '22px 16px', maxWidth: 800, margin: '0 auto' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderRadius: 99, fontWeight: 900, fontSize: 12, background: filter === f.id ? '#C7A46B' : '#1A1A1A', color: filter === f.id ? 'black' : 'white', border: '1px solid #222' }}>
            <span>{f.flag}</span> {f.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {filtered.map((n: any) => (
          <div key={n.link} onClick={() => setSelected(n)} style={{ background: '#131313', border: '1px solid #222', borderRadius: 28, overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <img src={`https://picsum.photos/seed/${n.link.slice(-20)}/600/340`} style={{ width: '100%', height: 200, objectFit: 'cover' }} alt="" />
              <div style={{ position: 'absolute', top: 12, left: 12, background: '#C7A46B', color: 'black', fontSize: 10, fontWeight: 900, padding: '6px 10px', borderRadius: 99, letterSpacing: 1 }}>{n.source}</div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.25 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: '#777', marginTop: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{n.description}</div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: '#050505', zIndex: 50, overflowY: 'auto' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', background: '#0E0E0E', minHeight: '100vh' }}>
            <div style={{ position: 'relative' }}>
              <img src={`https://picsum.photos/seed/${selected.link.slice(-20)}/800/500`} style={{ width: '100%', height: 420, objectFit: 'cover' }} alt="" />
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', fontSize: 20 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {[{ id: 'es', f: '🇪🇸', l: 'Español' }, { id: 'en', f: '🇬🇧', l: 'English' }, { id: 'ru', f: '🇷🇺', l: 'Русский' }].map((b: any) => (
                  <button key={b.id} onClick={() => setLang(b.id)} style={{ flex: 1, padding: '16px 8px', borderRadius: 30, background: lang === b.id ? '#C7A46B' : '#1C1C1C', color: lang === b.id ? 'black' : 'white', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 26 }}>{b.f}</span><span style={{ fontWeight: 900, fontSize: 13 }}>{b.l}</span>
                  </button>
                ))}
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px' }}>{transLoading ? 'Traduciendo...' : tTitle}</h1>
              <div style={{ background: '#080808', border: '1px solid #1F1F1F', borderRadius: 22, padding: 22 }}>
                <div style={{ color: '#C7A46B', fontSize: 11, fontWeight: 900, letterSpacing: 3, marginBottom: 12 }}>NOTICIA COMPLETA</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.8, color: '#CFCFCF', whiteSpace: 'pre-wrap' }}>{transLoading ? 'Cargando...' : tDesc}</div>
              </div>
              <a href={selected.link} target="_blank" style={{ display: 'block', marginTop: 24, background: '#C7A46B', color: 'black', textAlign: 'center', padding: 20, borderRadius: 16, fontWeight: 900, textDecoration: 'none' }}>Leer fuente original →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
