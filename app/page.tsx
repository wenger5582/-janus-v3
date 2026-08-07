'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [news, setNews] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [lang, setLang] = useState<'es' | 'en' | 'ru'>('es')
  const [tTitle, setTTitle] = useState("")
  const [tDesc, setTDesc] = useState("")
  const [loadingTrans, setLoadingTrans] = useState(false)

  useEffect(() => {
    supabase.from('news').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      if (data) setNews(data)
    })
  }, [])

  async function translateText(text: string, target: string) {
    if (!text) return ""
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target }),
      })
      const data = await res.json()
      return data.translated || text
    } catch {
      return text
    }
  }

  useEffect(() => {
    if (!selected) return
    const run = async () => {
      setLoadingTrans(true)
      // Si es español y la noticia ya es de CHILE/ESPAÑA, no traducir para que sea rápido
      if (lang === 'es' && (selected.source === 'CHILE' || selected.source === 'ESPAÑA')) {
        setTTitle(selected.title)
        setTDesc(selected.description)
        setLoadingTrans(false)
        return
      }
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center py-6 tracking-widest">JANUS V3</h1>
        <div className="grid gap-4">
          {news.map((n) => (
            <div key={n.link} onClick={() => { setSelected(n); setLang('es'); setTTitle(n.title); setTDesc(n.description) }} className="bg-neutral-900 rounded-xl p-4 cursor-pointer border border-neutral-800">
              <div className="text-xs text-yellow-600 mb-1">{n.source} • {new Date(n.created_at).toLocaleDateString()}</div>
              <div className="font-semibold line-clamp-2">{n.title}</div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto">
          <div className="max-w-2xl mx-auto min-h-screen bg-neutral-900">
            <img src={`https://picsum.photos/seed/${selected.link.slice(-20)}/800/400`} alt="" className="w-full h-64 object-cover" />
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <button onClick={() => setLang('es')} className={`px-4 py-2 rounded-full text-sm font-bold ${lang === 'es' ? 'bg-[#C7A46B] text-black' : 'bg-neutral-800'}`}>🇪🇸 Español</button>
                <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-full text-sm font-bold ${lang === 'en' ? 'bg-[#C7A46B] text-black' : 'bg-neutral-800'}`}>🇬🇧 English</button>
                <button onClick={() => setLang('ru')} className={`px-4 py-2 rounded-full text-sm font-bold ${lang === 'ru' ? 'bg-[#C7A46B] text-black' : 'bg-neutral-800'}`}>🇷🇺 Русский</button>
              </div>

              <h2 className="text-2xl font-serif font-bold mb-4">{loadingTrans ? 'Traduciendo...' : tTitle}</h2>

              <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
                <div className="text-xs text-[#C7A46B] font-bold mb-2 tracking-widest">NOTICIA COMPLETA</div>
                <p className="text-neutral-300 leading-relaxed font-serif">{loadingTrans ? 'Cargando traducción...' : tDesc}</p>
              </div>

              <a href={selected.link} target="_blank" className="block w-full bg-[#C7A46B] text-black text-center font-bold py-4 rounded-xl mt-4">Leer fuente original</a>
              <button onClick={() => setSelected(null)} className="block w-full bg-neutral-800 text-center py-3 rounded-xl mt-2">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
