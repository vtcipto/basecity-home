'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BaseCityHome() {
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
        console.log("Farcaster Mini App Hazır!");
      } catch (error) {
        console.error("Farcaster başlatılamadı:", error);
      }
    };
    initFarcaster();
  }, []);

  return (
    <main style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>BaseCity Home</h1>
      <p>Farcaster Mini Uygulaması Başarıyla Çalıştı!</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => sdk.actions.openUrl('https://basescan.org')}
          style={{ padding: '10px 20px', backgroundColor: '#0052FF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          View Transaction on Basescan
        </button>
      </div>
    </main>
  );
}
