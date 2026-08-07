export const dynamic = 'force-dynamic'
function splitInChunks(text: string, maxLen = 380) {
  const sentences = text.split(/(?<=[.!?])\s+/)
  let chunks: string[] = [], current = ""
  for (const s of sentences) {
    if ((current + " " + s).length > maxLen) {
      if (current) chunks.push(current.trim())
      if (s.length > maxLen) { for (let i = 0; i < s.length; i += maxLen) chunks.push(s.slice(i, i + maxLen)); current = "" }
      else current = s
    } else current = current? current + " " + s : s
  }
  if (current) chunks.push(current.trim())
  return chunks.length? chunks : [text.slice(0, 380)]
}
export async function POST(req: Request) {
  const { text, target, source } = await req.json()
  if (!text) return Response.json({ translated: "" })
  let tgt = target === "Русский"? "ru" : target === "English"? "en" : "es"
  let src = source === "CHILE" || source === "ESPAÑA"? "es" : source === "FRANCIA"? "fr" : "en"
  if (src === tgt) return Response.json({ translated: text })
  const chunks = splitInChunks(text, 380)
  let full = ""
  for (const chunk of chunks) {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${src}|${tgt}`, { cache: 'no-store' })
    const data = await res.json()
    let t = data?.responseData?.translatedText || chunk
    if (t.includes("INVALID") || t.includes("QUERY")) t = chunk
    full += (full? " " : "") + t
    await new Promise(r => setTimeout(r, 80))
  }
  return Response.json({ translated: full })
}
