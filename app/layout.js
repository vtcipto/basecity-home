export const metadata = {
  title: 'Basecity Home',
  description: 'Farcaster Mini App',
  other: {
    'base:app_id': '6a16a4c963a3a0a41fd577e9',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
