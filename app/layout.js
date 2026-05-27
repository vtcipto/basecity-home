export const metadata = {
  title: 'Basecity Home',
  description: 'Farcaster Mini App for Basecity Home',
  other: {
    'fc:frame': 'vnext',
    'fc:frame:image': 'https://vercel.app', 
    'fc:frame:button:1': 'Open Basecity Home',
    'fc:frame:button:1:action': 'launch_ctx',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
