'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { id: 'ALL', label: 'ALL', flag: '🌐' },
  { id: 'USA', label: 'USA', flag: '🇺🇸' },
  { id: 'UK', label: 'UK', flag: '🇬🇧' },
  { id: 'ESPAÑA', label: 'ESPAÑA', flag: '🇪🇸' },
  { id: 'FRANCIA', label: 'FRANCIA', flag: '🇫🇷' },
  { id: 'CHILE', label: 'CHILE', flag: '🇨🇱' },
]

export default function Page() {
  const [news, setNews] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(100)
      if (data) setNews(data)
      setTime(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    }
    load()
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })), 60000)
    return () => clearInterval(t)
  }, [])

  const countBy = (src: string) => {
    if (src === 'ALL') return news.length
    return news.filter(n => n.source?.toUpperCase() === src).length
  }

  const filtered = news.filter(n => {
    const matchesCat = filter === 'ALL' || n.source?.toUpperCase() === filter
    const matchesSearch = n.title?.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ color: '#c9a86a', fontWeight: 900, fontSize: 28, margin: 0 }}>JANUS V3 ✓ <span style={{ fontSize: 14, color: '#888' }}>{filtered.length}/{news.length} de {news.length}</span></h1>
          <p style={{ color: '#666', fontSize: 12, margin: 0 }}>Actualizado: {time} • 🟢 {filtered.length} filtradas</p>
        </div>
        <div style={{ background: '#22c55e', color: 'black', borderRadius: 20, padding: '6px 14px', fontWeight: 800 }}>● {time || '4:56'}</div>
      </div>

      <input
        placeholder="Buscar en 26 cadenas..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '10px 14px', color: 'white', marginBottom: 12 }}
      />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 8 }}>
        {CATEGORIES.map(cat => {
          const cnt = countBy(cat.id)
          const active = filter === cat.id
          return (
            <button key={cat.id} onClick={() => setFilter(cat.id)}
              style={{
                background: active ? '#c9a86a' : '#1a1a1a',
                color: active ? 'black' : 'white',
                border: '1px solid #333',
                borderRadius: 16,
                padding: '10px 16px',
                minWidth: 70,
                fontWeight: 800,
                fontSize: 12
              }}>
              <div style={{ fontSize: 22 }}>{cat.flag}</div>
              {cat.label}
              <div style={{ background: active ? 'black' : '#c9a86a', color: active ? '#c9a86a' : 'black', borderRadius: 10, marginTop: 4, padding: '2px 6px' }}>{cnt}</div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filtered.map(item => (
          <a key={item.id} href={item.link} target="_blank" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#141414', border: '1px solid #333', borderTop: '3px solid #c9a86a', borderRadius: 16, padding: 12, height: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: '16px', color: 'white', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ color: '#c9a86a', fontSize: 11 }}>{item.source}</span>
                <span style={{ color: '#666', fontSize: 11 }}>{new Date(item.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
