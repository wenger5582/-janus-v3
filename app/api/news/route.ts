import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    return Response.json(data || [])
  } catch (e: any) {
    return Response.json({ error: e.message, data: [] }, { status: 500 })
  }
}
