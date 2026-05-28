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
          url: 'https://vercel.app',
        },
      },
    }),
    // Base Geliştirici Doğrulama Kodu:
    'base:app_id': '6a16a4c963a3a0a41fd577e9',
  },
};
