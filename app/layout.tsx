import './globals.css'

export const metadata = {
  title: 'JANUS V3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: 'black', color: 'white', margin: 0 }}>{children}</body>
    </html>
  )
}
