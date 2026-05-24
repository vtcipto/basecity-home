// @ts-nocheck
export const metadata = {
  title: 'BaseCity Home',
  description: 'Connect wallet and check-in via live GPS location.',
  other: {
    'fc:frame': 'v2',
    'fc:frame:image': 'https://vercel.app',
    'fc:frame:button:1': 'Check-In via GPS',
    'fc:frame:button:1:action': 'post',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0052FF' }}>
        {children}
      </body>
    </html>
  )
}
