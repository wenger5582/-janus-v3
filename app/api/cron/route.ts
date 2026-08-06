import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Noticias de prueba para que JANUS deje de estar en 0/0
  const testNews = [
    { title: 'TEST JANUS FUNCIONANDO 1 - ' + Date.now(), link: 'https://test.com/' + Date.now() + '1', source: 'TEST' },
    { title: 'TEST JANUS FUNCIONANDO 2 - ' + Date.now(), link: 'https://test.com/' + Date.now() + '2', source: 'TEST' },
    { title: 'Boric anuncia nueva medida economica', link: 'https://test.com/' + Date.now() + '3', source: 'CHILE' },
    { title: 'Ultima hora USA: mercados suben', link: 'https://test.com/' + Date.now() + '4', source: 'USA' },
    { title: 'España: elecciones en camino', link: 'https://test.com/' + Date.now() + '5', source: 'ESPAÑA' },
  ]

  const { data, error } = await supabase.from('news').upsert(testNews, { onConflict: 'link' }).select()

  if (error) return Response.json({ ok: false, supabase_error: error, has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL })

  return Response.json({ ok: true, inserted: data?.length || 0, test: 'funcionando' })
}
