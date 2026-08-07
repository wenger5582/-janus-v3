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
    fetch('/api/news').then(r => r.json()).then(d => { setNews(Array.isArray(d)? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function translateText(text: string, target: string, source: string) {
    try {
      const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.slice(0, 800), target, source }) })
      const data = await res.json()
      return data.translated || text
    } catch { return text }
  }

  useEffect(() => {
    if (!selected) return
    if (lang === 'es' && (selected.source === 'CHILE' || selected.source === 'ESPAÑA')) { setTTitle(selected.title); setTDesc(selected.description); return }
    if (lang === 'en' && (selected.source === 'USA' || selected.source === 'UK')) { setTTitle(selected.title); setTDesc(selected.description); return }
    const run = async () => {
      setLoadingTrans(true)
      const [tt, td] = await Promise.all([translateText(selected.title, lang, selected.source), translateText(selected.description, lang, selected.source)])
      setTTitle(tt); setTDesc(td); setLoadingTrans(false)
    }
    run()
  }, [lang, selected])

  if (loading) return <div style={{ minHeight: '100vh', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando JANUS V3...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', paddingBottom: 40 }}>
      <h1 style={{ textAlign: 'center', fontSize: 42, fontWeight: 900, letterSpacing: 12, padding: '36px 0 20px', fontFamily: 'Times New Roman, serif' }}>JANUS V3</h1>
      
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px', display: 'grid', gap: 16 }}>
        {news.map((n: any) => (
          <div key={n.link} onClick={() => { setSelected(n); setLang('es'); setTTitle(n.title); setTDesc(n.description) }} style={{ background: '#141414', border: '1px solid #262626', borderRadius: 26, padding: '22px 24px', cursor: 'pointer' }}>
            <div style={{ fontSize: 11, color: '#C7A46B', fontWeight: 900, letterSpacing: 2.5, marginBottom: 10 }}>{n.source}</div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>{n.title}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 50, overflowY: 'auto' }}>
          <div style={{ maxWidth: 740, margin: '0 auto', background: '#0F0F0F', minHeight: '100vh' }}>
            <img src={`https://picsum.photos/seed/${selected.link.slice(-30)}/800/480`} alt="" style={{ width: '100%', height: 360, objectFit: 'cover' }} />
            <div style={{ padding: '22px 18px' }}>
              
              {/* BANDERITAS FORMATO ORIGINAL */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <button onClick={() => setLang('es')} style={{ flex: 1, padding: '14px 8px', borderRadius: 28, background: lang === 'es'? '#C7A46B' : '#1E1E1E', color: lang === 'es'? 'black' : 'white', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22 }}>🇪🇸</span>
                  <span style={{ fontSize: 14, fontWeight: 900 }}>Español</span>
                </button>
                <button onClick={() => setLang('en')} style={{ flex: 1, padding: '14px 8px', borderRadius: 28, background: lang === 'en'? '#C7A46B' : '#1E1E1E', color: lang === 'en'? 'black' : 'white', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22 }}>🇬🇧</span>
                  <span style={{ fontSize: 14, fontWeight: 900 }}>English</span>
                </button>
                <button onClick={() => setLang('ru')} style={{ flex: 1, padding: '14px 8px', borderRadius: 28, background: lang === 'ru'? '#C7A46B' : '#1E1E1E', color: lang === 'ru'? 'black' : 'white', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22 }}>🇷🇺</span>
                  <span style={{ fontSize: 14, fontWeight: 900 }}>Русский</span>
                </button>
              </div>

              <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: 34, fontWeight: 900, lineHeight: 1.15, marginBottom: 20 }}>{loadingTrans? 'Traduciendo...' : tTitle}</h2>
              
              <div style={{ background: '#080808', border: '1px solid #222', borderRadius: 20, padding: 20 }}>
                <div style={{ fontSize: 11, color: '#C7A46B', fontWeight: 900, letterSpacing: 3, marginBottom: 12 }}>NOTICIA COMPLETA</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.75, color: '#D8D8D8', whiteSpace: 'pre-wrap' }}>{loadingTrans? 'Cargando...' : tDesc}</p>
              </div>

              <a href={selected.link} target="_blank" style={{ display: 'block', marginTop: 22, background: '#C7A46B', color: 'black', textAlign: 'center', padding: 18, borderRadius: 14, fontWeight: 900, textDecoration: 'none', letterSpacing: 0.5 }}>Leer fuente original</a>
              <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: 12, background: '#1E1E1E', color: 'white', padding: 16, borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 15 }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
