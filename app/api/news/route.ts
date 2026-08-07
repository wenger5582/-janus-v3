import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(120)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
