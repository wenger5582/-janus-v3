export const metadata = {
  title: 'JANUS V3',
  description: 'JANUS News',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ backgroundColor: 'black', color: 'white', margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
