'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATS = [
  { id: 'ALL', label: 'ALL', flag: '🌐' },
  { id: 'USA', label: 'USA', flag: '🇺🇸' },
  { id: 'UK', label: 'UK', flag: '🇬🇧' },
  { id: 'ESPAÑA', label: 'ESPAÑA', flag: '🇪🇸' },
  { id: 'FRANCIA', label: 'FRANCIA', flag: '🇫🇷' },
  { id: 'CHILE', label: 'CHILE', flag: '🇨🇱' },
]

const ALL_CHAINS: any = {
  USA: ['CNN', 'FOX', 'NYT', 'WASHINGTON POST', 'WSJ', 'ABC NEWS', 'NBC', 'CBS'],
  UK: ['BBC', 'GUARDIAN', 'TELEGRAPH', 'DAILY MAIL', 'INDEPENDENT', 'SKY NEWS'],
  ESPAÑA: ['EL PAIS', 'EL MUNDO', 'ABC', 'LA VANGUARDIA', '20M', 'EL CONFIDENCIAL'],
  FRANCIA: ['LE MONDE', 'LE FIGARO', 'LIBERATION', 'FRANCE 24', 'BFMTV'],
  CHILE: ['BIOBIO', 'EMOL', 'LA TERCERA', 'COOP', 'T13', 'CHV', 'MEGA', 'ADN'],
}

function getChain(link: string) {
  if (!link) return 'OTROS'
  const h = link.toLowerCase()
  if (h.includes('cnn')) return 'CNN'
  if (h.includes('fox')) return 'FOX'
  if (h.includes('nytimes') || h.includes('nyt')) return 'NYT'
  if (h.includes('washingtonpost') || h.includes('washington')) return 'WASHINGTON POST'
  if (h.includes('wsj')) return 'WSJ'
  if (h.includes('bbc')) return 'BBC'
  if (h.includes('theguardian') || h.includes('guardian')) return 'GUARDIAN'
  if (h.includes('telegraph')) return 'TELEGRAPH'
  if (h.includes('elpais')) return 'EL PAIS'
  if (h.includes('elmundo')) return 'EL MUNDO'
  if (h.includes('abc.es')) return 'ABC'
  if (h.includes('lavanguardia')) return 'LA VANGUARDIA'
  if (h.includes('20minutos')) return '20M'
  if (h.includes('lemonde')) return 'LE MONDE'
  if (h.includes('lefigaro')) return 'LE FIGARO'
  if (h.includes('biobio')) return 'BIOBIO'
  if (h.includes('emol')) return 'EMOL'
  if (h.includes('latercera') || h.includes('tercera')) return 'LA TERCERA'
  if (h.includes('cooperativa')) return 'COOP'
  try { return new URL(link).hostname.replace('www.','').split('.')[0].toUpperCase() } catch { return 'OTROS' }
}

function getImage(item: any) {
  if (item.image || item.image_url) return item.image || item.image_url
  return `https://picsum.photos/seed/${item.id}/400/250`
}

export default function Page() {
  const [news, setNews] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [chainFilter, setChainFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [time, setTime] = useState('')
  const [countdown, setCountdown] = useState(300)
  const [selected, setSelected] = useState<any>(null)

  const load = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(150)
    if (data) setNews(data.map(n => ({...n, chain: getChain(n.link) })))
    setTime(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    setCountdown(300)
  }

  useEffect(() => {
    load()
    const c = setInterval(() => setCountdown(p => { if (p <= 1) { load(); return 300 } return p - 1 }), 1000)
    return () => clearInterval(c)
  }, [])

  const countBy = (s: string) => s === 'ALL'? news.length : news.filter(n => n.source?.toUpperCase() === s).length
  const filteredByCountry = news.filter(n => filter === 'ALL' || n.source?.toUpperCase() === filter)
  const chainCounts: any = {}
  filteredByCountry.forEach(n => { chainCounts[n.chain] = (chainCounts[n.chain] || 0) + 1 })
  const finalFiltered = filteredByCountry.filter(n => (chainFilter === 'ALL' || n.chain === chainFilter) && n.title?.toLowerCase().includes(search.toLowerCase()))
  const isRed = countdown <= 60 && countdown > 0

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', paddingBottom: 20 }}>
      <style>{`@keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.25) } 100% { transform: scale(1) } }.pulse { animation: pulse 0.7s infinite; }`}</style>

      <div style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingLeft: 12, paddingRight: 12, paddingBottom: 8, position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#c9a86a', fontWeight: 900, fontSize: 24, margin: 0 }}>JANUS V3</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isRed && <button onClick={load} style={{ width: 40, height: 40, borderRadius: 99, background: 'radial-gradient(circle at 30% 30%, #dcfce7, #22c55e 45%, #14532d)', border: '2px solid #16a34a', boxShadow: 'inset 0 3px 5px rgba(255,255,255,1), 0 0 14px rgba(34,197,94,0.7)', cursor: 'pointer' }}></button>}
            {isRed && <button onClick={load} className="pulse" style={{ width: 48, height: 48, borderRadius: 99, background: 'radial-gradient(circle at 30% 30%, #fee2e2, #ef4444 45%, #7f1d1d)', border: '2px solid #b91c1c', boxShadow: 'inset 0 3px 6px rgba(255,255,255,1), 0 0 22px rgba(239,68,68,0.9)', cursor: 'pointer' }}></button>}
            <div className={isRed? 'pulse' : ''} style={{ background: isRed? 'linear-gradient(180deg, #f87171, #991b1b)' : 'linear-gradient(180deg, #4ade80, #15803d)', color: isRed? 'white' : 'black', borderRadius: 20, padding: '8px 16px', fontWeight: 900, fontSize: 14 }}>● {Math.floor(countdown/60)}:{(countdown%60).toString().padStart(2,'0')}</div>
          </div>
        </div>
        <p style={{ color: '#666', fontSize: 11, margin: '4px 0 10px 0' }}>Actualizado: {time} • {finalFiltered.length}/{news.length}</p>
        <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '10px 14px', color: 'white' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '10px 12px' }}>
        {CATS.map(cat => {
          const cnt = countBy(cat.id)
          const active = filter === cat.id
          return <button key={cat.id} onClick={() => { setFilter(cat.id); setChainFilter('ALL') }} style={{ background: active? '#c9a86a' : '#1a1a1a', color: active? 'black' : 'white', border: '1px solid #333', borderRadius: 16, padding: '12px 6px', fontWeight: 800, fontSize: 11 }}><div style={{ fontSize: 22 }}>{cat.flag}</div>{cat.label}<div style={{ background: active? 'black' : '#c9a86a', color: active? '#c9a86a' : 'black', borderRadius: 10, marginTop: 4, display: 'inline-block', padding: '2px 10px' }}>{cnt}</div></button>
        })}
      </div>

      {/* CADENAS DESPLEGABLES CON GRIS */}
      {filter!== 'ALL' && (
        <div style={{ background: '#141414', margin: '0 12px 12px 12px', borderRadius: 16, padding: 12, border: '1px solid #333' }}>
          <div style={{ color: '#c9a86a', fontSize: 11, fontWeight: 800, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>CADENAS EN {filter}</span>
            <span style={{ color: '#666' }}>{filteredByCountry.length} noticias</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            <button onClick={() => setChainFilter('ALL')} style={{ background: chainFilter==='ALL'? '#c9a86a' : '#222', color: chainFilter==='ALL'?'black':'white', border: '1px solid #333', borderRadius: 20, padding: '7px 12px', fontSize: 11, fontWeight: 800 }}>TODAS ({filteredByCountry.length})</button>
            {ALL_CHAINS[filter]?.map((ch: string) => {
              const cnt = chainCounts[ch] || 0
              const hasNews = cnt > 0
              const active = chainFilter === ch
              return (
                <button
                  key={ch}
                  onClick={() => hasNews && setChainFilter(ch)}
                  disabled={!hasNews}
                  style={{
                    background:!hasNews? '#111' : active? '#c9a86a' : '#2a2a2a',
                    color:!hasNews? '#555' : active? 'black' : 'white',
                    border: `1px solid ${!hasNews? '#222' : active? '#c9a86a' : '#444'}`,
                    borderRadius: 20,
                    padding: '7px 12px',
                    fontSize: 11,
                    fontWeight: hasNews? 800 : 400,
                    opacity: hasNews? 1 : 0.5,
                    cursor: hasNews? 'pointer' : 'not-allowed'
                  }}>
                  {ch} {hasNews? `(${cnt})` : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 12px' }}>
        {finalFiltered.map(item => (
          <div key={item.id} onClick={() => setSelected(item)} style={{ background: '#141414', border: '1px solid #333', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ height: 110, position: 'relative' }}>
              <img src={getImage(item)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', borderRadius: 12, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: '#c9a86a' }}>{item.chain}</div>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: '15px', color: 'white', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', minHeight: 45 }}>{item.title}</div>
              <div style={{ color: '#666', fontSize: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>{new Date(item.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ color: '#c9a86a' }}>Ver →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: 24, width: '100%', maxWidth: 500, maxHeight: '85vh', overflow: 'hidden', border: '1px solid #333' }}>
            <img src={getImage(selected)} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
            <div style={{ padding: 20 }}>
              <span style={{ background: '#c9a86a', color: 'black', borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>{selected.chain}</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: '24px', margin: '12px 0' }}>{selected.title}</h2>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, background: '#222', color: 'white', border: '1px solid #333', borderRadius: 14, padding: '14px', fontWeight: 700 }}>Cerrar</button>
                <a href={selected.link} target="_blank" style={{ flex: 2, background: '#c9a86a', color: 'black', borderRadius: 14, padding: '14px', fontWeight: 900, textAlign: 'center', textDecoration: 'none' }}>Leer completa →</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
