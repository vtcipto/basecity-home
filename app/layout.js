export const metadata = {
  title: 'Basecity Home',
  description: 'Farcaster Mini App for Basecity Home',
  openGraph: {
    title: 'Basecity Home',
    description: 'Farcaster Mini App for Basecity Home',
    images: ['https://basecity-home.vercel.app/kapak.png'],
  },
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: 'https://basecity-home.vercel.app/kapak.png',
      button: {
        title: 'Launch',
        action: {
          type: 'launch_frame',
          name: 'Basecity Home',
          url: 'https://basecity-home.vercel.app/',
        },
      },
    }),
  },
};




export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
