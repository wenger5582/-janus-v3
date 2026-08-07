export const dynamic = 'force-dynamic'
function splitInChunks(text: string, maxLen = 380) {
  const sentences = text.split(/(?<=[.!?])\s+/)
  let chunks: string[] = []
  let current = ""
  for (const s of sentences) {
    if ((current + " " + s).length > maxLen) {
      if (current) chunks.push(current.trim())
      if (s.length > maxLen) {
        for (let i = 0; i < s.length; i += maxLen) chunks.push(s.slice(i, i + maxLen))
        current = ""
      } else current = s
    } else current = current? current + " " + s : s
  }
  if (current) chunks.push(current.trim())
  return chunks.length? chunks : [text.slice(0, 380)]
}
export async function POST(req: Request) {
  try {
    const { text, target } = await req.json()
    let tgt = target
    if (tgt === "Русский") tgt = "ru"
    if (tgt === "English") tgt = "en"
    if (tgt === "Español") tgt = "es"
    if (!text) return Response.json({ translated: "" })
    const chunks = splitInChunks(text, 380)
    let full = ""
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=|${tgt}`
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json()
      let t = data?.responseData?.translatedText || chunk
      if (t.includes("QUERY LENGTH")) t = chunk
      full += (full? " " : "") + t
      await new Promise(r => setTimeout(r, 120))
    }
    return Response.json({ translated: full })
  } catch (e: any) {
    return Response.json({ translated: "", error: e.message }, { status: 500 })
  }
}
