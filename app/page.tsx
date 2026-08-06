function getChain(item: any) {
  const raw = `${item.link || item.url || ''} ${item.source || ''} ${item.title || ''}`.toLowerCase()

  if (raw.includes('bbc')) return 'BBC'
  if (raw.includes('guardian') || raw.includes('theguardian')) return 'GUARDIAN'
  if (raw.includes('telegraph')) return 'TELEGRAPH'
  if (raw.includes('dailymail') || raw.includes('daily mail')) return 'DAILY MAIL'
  if (raw.includes('skynews') || raw.includes('sky news')) return 'SKY NEWS'
  if (raw.includes('nyt') || raw.includes('nytimes') || raw.includes('new york times')) return 'NYT'
  if (raw.includes('cnn')) return 'CNN'
  if (raw.includes('fox')) return 'FOX'
  if (raw.includes('biobio')) return 'BIOBIO'
  if (raw.includes('emol')) return 'EMOL'
  if (raw.includes('tercera')) return 'LA TERCERA'

  // Si no detecta nada, intenta sacar el dominio real
  try {
    const url = item.link || item.url || ''
    const host = new URL(url).hostname.replace('www.','').split('.')[0]
    return host.toUpperCase()
  } catch {
    return 'OTROS'
  }
}
