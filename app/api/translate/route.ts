export const dynamic = 'force-dynamic'

function splitInChunks(text: string, maxLen = 400) {
  const sentences = text.split(/(?<=[.!?])\s+/)
  let chunks: string[] = []
  let current = ""
  for (const s of sentences) {
    if ((current + " " + s).length > maxLen) {
      if (current) chunks.push(current.trim())
      if (s.length > maxLen) {
        // si una sola frase es gigante, cortala a la fuerza
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.slice(i, i + maxLen))
        }
        current = ""
      } else {
        current = s
      }
    } else {
      current = current? current + " " + s : s
    }
  }
  if (current) chunks.push(current.trim())
  return chunks.length? chunks : [text.slice(0, 400)]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { text, target } = body

    if (!text) return Response.json({ translated: "" })

    // normaliza lo que te llega de los botones
    if (target === "Русский") target = "ru"
    if (target === "English") target = "en"
    if (target === "Español") target = "es"

    const tgt = target as string
    // si es español y el texto ya está en español, no traducir
    if (!text.trim()) return Response.json({ translated: "" })

    const chunks = splitInChunks(text, 380)
    let fullTranslated = ""

    for (const chunk of chunks) {
      // truco: langpair=|ru auto-detecta el origen
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=|${tgt}`
      const res = await fetch(url, { cache: "no-store" })
      const data = await res.json()

      let translated = data?.responseData?.translatedText || chunk

      // si MyMemory devuelve el error de limite, usamos el chunk original
      if (translated.includes("QUERY LENGTH LIMIT") || translated.includes("INVALID")) {
        translated = chunk
      }

      fullTranslated += (fullTranslated? " " : "") + translated

      // espera 200ms para no saturar MyMemory
      await new Promise(r => setTimeout(r, 200))
    }

    return Response.json({ translated: fullTranslated })
  } catch (e: any) {
    return Response.json({ error: e.message, translated: "" }, { status: 500 })
  }
}
