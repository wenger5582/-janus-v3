'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [news, setNews] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [lang, setLang] = useState<'es' | 'en' | 'ru'>('es')
  const [tTitle, setTTitle] = useState("")
  const [tDesc, setTDesc] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingTrans, setLoadingTrans] = useState(false)

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(d => {
      setNews(Array.isArray(d)? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function translateText(text: string, target: string) {
    try {
      const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.slice(0, 800), target }) })
      const data = await res.json()
      return data.translated || text
    } catch { return text }
  }

  useEffect(() => {
    if (!selected) return
    setTTitle(selected.title)
    setTDesc(selected.description)
    if (lang === 'es' && (selected.source === 'CHILE' || selected.source === 'ESPAÑA')) return
    const run = async () => {
      setLoadingTrans(true)
      const [tt, td] = await Promise.all([translateText(selected.title, lang), translateText(selected.description, lang)])
      setTTitle(tt); setTDesc(td); setLoadingTrans(false)
    }
    run()
  }, [lang, selected])

  if (loading) return <div style={{ minHeight: '100vh', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando JANUS V3...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', paddingBottom: 40 }}>
      <h1 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, letterSpacing: 8, padding: '32px 0 16px', fontFamily: 'serif' }}>JANUS V3</h1>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px', display: 'grid', gap: 14 }}>
        {news.map((n: any) => (
          <div key={n.link} onClick={() => { setSelected(n); setLang('es'); setTTitle(n.title); setTDesc(n.description) }} style={{ background: '#151515', border: '1px solid #232323', borderRadius: 20, padding: '18px 20px', cursor: 'pointer' }}>
            <div style={{ fontSize: 11, color: '#C7A46B', fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>{n.source}</div>
            <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.25 }}>{n.title}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 50, overflowY: 'auto' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', background: '#111', minHeight: '100vh' }}>
            <img src={`https://picsum.photos/seed/${selected.link.slice(-30)}/800/450`} alt="" style={{ width: '100%', height: 320, objectFit: 'cover' }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button onClick={() => setLang('es')} style={{ padding: '10px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13, background: lang === 'es'? '#C7A46B' : '#222', color: lang === 'es'? 'black' : 'white', border: 'none' }}>🇪🇸 Español</button>
                <button onClick={() => setLang('en')} style={{ padding: '10px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13, background: lang === 'en'? '#C7A46B' : '#222', color: lang === 'en'? 'black' : 'white', border: 'none' }}>🇬🇧 English</button>
                <button onClick={() => setLang('ru')} style={{ padding: '10px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13, background: lang === 'ru'? '#C7A46B' : '#222', color: lang === 'ru'? 'black' : 'white', border: 'none' }}>🇷🇺 Русский</button>
              </div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>{loadingTrans? 'Traduciendo...' : tTitle}</h2>
              <div style={{ background: '#080808', border: '1px solid #1f1f1f', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 10, color: '#C7A46B', fontWeight: 900, letterSpacing: 2, marginBottom: 10 }}>NOTICIA COMPLETA</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, lineHeight: 1.7, color: '#d0d0d0', whiteSpace: 'pre-wrap' }}>{loadingTrans? 'Cargando...' : tDesc}</p>
              </div>
              <a href={selected.link} target="_blank" style={{ display: 'block', marginTop: 20, background: '#C7A46B', color: 'black', textAlign: 'center', padding: 18, borderRadius: 14, fontWeight: 900, textDecoration: 'none', letterSpacing: 1 }}>Leer fuente original</a>
              <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: 10, background: '#222', color: 'white', padding: 14, borderRadius: 14, border: 'none', fontWeight: 700 }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
