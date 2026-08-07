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
      if (Array.isArray(d)) setNews(d)
      else if (d.data) setNews(d.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function translateText(text: string, target: string) {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 800), target }),
      })
      const data = await res.json()
      return data.translated || text
    } catch { return text }
  }

  useEffect(() => {
    if (!selected) return
    setTTitle(selected.title)
    setTDesc(selected.description)
    if (lang === 'es') return
    const run = async () => {
      setLoadingTrans(true)
      const [tt, td] = await Promise.all([
        translateText(selected.title, lang),
        translateText(selected.description, lang),
      ])
      setTTitle(tt)
      setTDesc(td)
      setLoadingTrans(false)
    }
    run()
  }, [lang, selected])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando JANUS V3...</div>

  return (
    <div style={{ background: 'black', color: 'white', minHeight: '100vh', padding: 16 }}>
      <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 4, padding: '20px 0' }}>JANUS V3</h1>
      
      {news.length === 0 && <div style={{ textAlign: 'center', color: '#888' }}>No hay noticias. Ve a /api/cron</div>}

      <div style={{ maxWidth: 700, margin: '0 auto', display: 'grid', gap: 12 }}>
        {news.map((n: any) => (
          <div key={n.link} onClick={() => setSelected(n)} style={{ background: '#171717', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, cursor: 'pointer' }}>
            <div style={{ fontSize: 10, color: '#C7A46B', fontWeight: 700 }}>{n.source}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{n.title}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 50, overflowY: 'auto' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', background: '#171717', minHeight: '100vh' }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button onClick={() => setLang('es')} style={{ padding: '8px 16px', borderRadius: 20, background: lang === 'es' ? '#C7A46B' : '#2a2a2a', color: lang === 'es' ? 'black' : 'white', fontWeight: 700 }}>Español</button>
                <button onClick={() => setLang('en')} style={{ padding: '8px 16px', borderRadius: 20, background: lang === 'en' ? '#C7A46B' : '#2a2a2a', color: lang === 'en' ? 'black' : 'white', fontWeight: 700 }}>English</button>
                <button onClick={() => setLang('ru')} style={{ padding: '8px 16px', borderRadius: 20, background: lang === 'ru' ? '#C7A46B' : '#2a2a2a', color: lang === 'ru' ? 'black' : 'white', fontWeight: 700 }}>Русский</button>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{loadingTrans ? 'Traduciendo...' : tTitle}</h2>
              <div style={{ background: 'black', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginTop: 16 }}>
                <div style={{ fontSize: 10, color: '#C7A46B', fontWeight: 700, marginBottom: 8 }}>NOTICIA COMPLETA</div>
                <div style={{ color: '#ccc', lineHeight: 1.6 }}>{loadingTrans ? 'Cargando...' : tDesc}</div>
              </div>
              <a href={selected.link} target="_blank" style={{ display: 'block', background: '#C7A46B', color: 'black', textAlign: 'center', padding: 16, borderRadius: 12, marginTop: 16, fontWeight: 800, textDecoration: 'none' }}>Leer fuente original</a>
              <button onClick={() => setSelected(null)} style={{ display: 'block', width: '100%', background: '#2a2a2a', color: 'white', padding: 12, borderRadius: 12, marginTop: 8 }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
