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

function getChain(link: string) {
  if (!link) return 'OTROS'
  const h = link.toLowerCase()
  if (h.includes('cnn')) return 'CNN'
  if (h.includes('fox')) return 'FOX'
  if (h.includes('nytimes') || h.includes('nyt')) return 'NYT'
  if (h.includes('bbc')) return 'BBC'
  if (h.includes('theguardian')) return 'GUARDIAN'
  if (h.includes('elpais')) return 'EL PAIS'
  if (h.includes('elmundo')) return 'EL MUNDO'
  if (h.includes('abc.es')) return 'ABC'
  if (h.includes('20minutos')) return '20M'
  if (h.includes('lemonde')) return 'LE MONDE'
  if (h.includes('lefigaro')) return 'LE FIGARO'
  if (h.includes('biobio')) return 'BIOBIO'
  if (h.includes('emol')) return 'EMOL'
  if (h.includes('latercera')) return 'LA TERCERA'
  if (h.includes('cooperativa')) return 'COOP'
  try { return new URL(link).hostname.replace('www.','').split('.')[0].toUpperCase() } catch { return 'OTROS' }
}

export default function Page() {
  const [news, setNews] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [chainFilter, setChainFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [time, setTime] = useState('')
  const [countdown, setCountdown] = useState(300)

  const load = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(150)
    if (data) setNews(data.map(n => ({...n, chain: getChain(n.link) })))
    setTime(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    setCountdown(300)
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 300000)
    const c = setInterval(() => setCountdown(p => {
      if (p <= 1) { load(); return 300 }
      if (p === 61 && 'vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 500])
      return p - 1
    }), 1000)
    return () => { clearInterval(t); clearInterval(c) }
  }, [])

  const countBy = (s: string) => s === 'ALL'? news.length : news.filter(n => n.source?.toUpperCase() === s).length
  const filteredByCountry = news.filter(n => filter === 'ALL' || n.source?.toUpperCase() === filter)
  const chainsInCountry = Array.from(new Set(filteredByCountry.map(n => n.chain))).sort()
  const chainCounts: any = {}
  filteredByCountry.forEach(n => { chainCounts[n.chain] = (chainCounts[n.chain] || 0) + 1 })
  const finalFiltered = filteredByCountry.filter(n => (chainFilter === 'ALL' || n.chain === chainFilter) && n.title?.toLowerCase().includes(search.toLowerCase()))
  const isRed = countdown <= 60

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', paddingBottom: 20 }}>
      <style>{`@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7) } 50% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(239,68,68,0) } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0) } }.pulse { animation: pulse 0.8s infinite; }`}</style>

      <div style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingLeft: 12, paddingRight: 12, paddingBottom: 8, position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#c9a86a', fontWeight: 900, fontSize: 24, margin: 0 }}>JANUS V3 ✓ <span style={{ fontSize: 11, color: '#888' }}>{finalFiltered.length}/{news.length}</span></h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={load} className={isRed? 'pulse' : ''} style={{ width: 38, height: 38, borderRadius: 99, background: isRed? '#ef4444' : '#22c55e', border: 'none', fontSize: 20, fontWeight: 900, cursor: 'pointer', color: isRed? 'white' : 'black' }}>
              {isRed? '↻' : '✓'}
            </button>
            <div className={isRed? 'pulse' : ''} style={{ background: isRed? '#ef4444' : '#22c55e', color: isRed? 'white' : 'black', borderRadius: 20, padding: '6px 14px', fontWeight: 900, fontSize: 14 }}>
              ● {Math.floor(countdown/60)}:{(countdown%60).toString().padStart(2,'0')}
            </div>
          </div>
        </div>
        <p style={{ color: '#666', fontSize: 11, margin: '4px 0 10px 0' }}>Actualizado: {time} • 🟢 {finalFiltered.length} filtradas</p>
        <input placeholder="Buscar en 26 cadenas..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '10px 14px', color: 'white' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '10px 12px' }}>
        {CATS.map(cat => {
          const cnt = countBy(cat.id)
          const active = filter === cat.id
          return <button key={cat.id} onClick={() => { setFilter(cat.id); setChainFilter('ALL') }} style={{ background: active? '#c9a86a' : '#1a1a1a', color: active? 'black' : 'white', border: '1px solid #333', borderRadius: 16, padding: '12px 6px', fontWeight: 800, fontSize: 11 }}><div style={{ fontSize: 22 }}>{cat.flag}</div>{cat.label}<div style={{ background: active? 'black' : '#c9a86a', color: active? '#c9a86a' : 'black', borderRadius: 10, marginTop: 4, display: 'inline-block', padding: '2px 10px' }}>{cnt}</div></button>
        })}
      </div>

      {filter!== 'ALL' && chainsInCountry.length > 0 && (
        <div style={{ background: '#141414', margin: '0 12px 12px 12px', borderRadius: 12, padding: 10, border: '1px solid #333' }}>
          <div style={{ color: '#c9a86a', fontSize: 11, fontWeight: 800, marginBottom: 8 }}>CADENAS EN {filter}: {filteredByCountry.length} noticias</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button onClick={() => setChainFilter('ALL')} style={{ background: chainFilter==='ALL'? '#c9a86a' : '#222', color: chainFilter==='ALL'?'black':'white', border: '1px solid #333', borderRadius: 20, padding: '6px 10px', fontSize: 11, fontWeight: 700 }}>TODAS ({filteredByCountry.length})</button>
            {chainsInCountry.map(ch => (
              <button key={ch} onClick={() => setChainFilter(ch)} style={{ background: chainFilter===ch? '#c9a86a' : '#222', color: chainFilter===ch?'black':'white', border: '1px solid #333', borderRadius: 20, padding: '6px 10px', fontSize: 11, fontWeight: 700 }}>{ch} ({chainCounts[ch]})</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
        {finalFiltered.map(item => (
          <a key={item.id} href={item.link} target="_blank" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#141414', border: '1px solid #333', borderTop: '3px solid #c9a86a', borderRadius: 16, padding: 12, height: 135, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: '15px', color: 'white', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as any }}>{item.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#c9a86a', fontSize: 10 }}>{item.chain}</span><span style={{ color: '#666', fontSize: 10 }}>{new Date(item.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
