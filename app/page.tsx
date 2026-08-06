'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATS = [
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
    supabase.from('news').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      if (data) setNews(data)
    })
    const upd = () => setTime(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
    upd()
    const t = setInterval(upd, 60000)
    return () => clearInterval(t)
  }, [])

  const countBy = (s: string) => s === 'ALL' ? news.length : news.filter(n => n.source?.toUpperCase() === s).length
  const filtered = news.filter(n => {
    const okCat = filter === 'ALL' || n.source?.toUpperCase() === filter
    const okSearch = n.title?.toLowerCase().includes(search.toLowerCase())
    return okCat && okSearch
  })

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', padding: '0 12px 12px 12px', paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
      {/* HEADER ARREGLADO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <h1 style={{ color: '#c9a86a', fontWeight: 900, fontSize: 26, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            JANUS V3 ✓ <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>{filtered.length}/{news.length} de {news.length}</span>
          </h1>
          <p style={{ color: '#666', fontSize: 11, margin: '2px 0 0 0' }}>Actualizado: {time} • 🟢 {filtered.length} filtradas</p>
        </div>
        <div style={{ background: '#22c55e', color: 'black', borderRadius: 20, padding: '6px 12px', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>● {time || '12:11'}</div>
      </div>

      <input
        placeholder="Buscar en 26 cadenas..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '10px 14px', color: 'white', marginBottom: 14 }}
      />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4, scrollbarWidth: 'none' }}>
        {CATS.map(cat => {
          const cnt = countBy(cat.id)
          const active = filter === cat.id
          return (
            <button key={cat.id} onClick={() => setFilter(cat.id)}
              style={{
                background: active ? '#c9a86a' : '#1a1a1a', color: active ? 'black' : 'white',
                border: '1px solid #333', borderRadius: 16, padding: '10px 14px', minWidth: 68, flexShrink: 0, fontWeight: 800, fontSize: 11
              }}>
              <div style={{ fontSize: 20 }}>{cat.flag}</div>{cat.label}
              <div style={{ background: active ? 'black' : '#c9a86a', color: active ? '#c9a86a' : 'black', borderRadius: 10, marginTop: 4, padding: '1px 6px', fontSize: 11 }}>{cnt}</div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filtered.map(item => (
          <a key={item.id} href={item.link} target="_blank" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#141414', border: '1px solid #333', borderTop: '3px solid #c9a86a', borderRadius: 16, padding: 12, height: 135, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: '15px', color: 'white', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as any }}>{item.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ color: '#c9a86a', fontSize: 10 }}>{item.source}</span>
                <span style={{ color: '#666', fontSize: 10 }}>{new Date(item.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
