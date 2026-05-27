'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';

export default function BasecityHome() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Farcaster Başlatıcı
  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready(); 
      } catch (error) {
        console.error("SDK başlatılamadı:", error);
      }
    };
    init();
  }, []);

  // 2. Farcaster v2 Uyumlu Cüzdan Bağlantısı
  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    
    try {
      // Farcaster v2 SDK'nın resmi cüzdan sağlayıcısı çağrısı
      const provider = sdk.wallet?.ethProvider;
      
      if (!provider) {
        alert("Farcaster cüzdan sağlayıcısı bulunamadı. Lütfen Warpcast içinden açtığınızdan emin olun.");
        setLoading(false);
        return;
      }

      // Kullanıcı butona bastığında resmi hesap izin isteğini tetikler
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        const address = accounts[0]; // İlk adresi dizi içinden temizce alıyoruz
        
        // Güvenli personal_sign imza isteği (Farcaster parametre sırasına göre)
        try {
          const mesajMetni = `Basecity Home uygulamasina guvenli baglanti onayi.\nCuzdan: ${address}`;
          
          await provider.request({
            method: 'personal_sign',
            params: [mesajMetni, address] 
          });
          
          setWalletAddress(address);
        } catch (signError) {
          console.error("İmza reddedildi:", signError);
          alert("Cüzdan imza onayı reddedildi.");
        }
      }
    } catch (connectError) {
      console.error("Bağlantı hatası:", connectError);
      alert("Cüzdan bağlantısı başarısız oldu veya reddedildi.");
    } finally {
      setLoading(false);
    }
  }

  // 3. Bağlantıyı Kesme
  function handleDisconnect() {
    setWalletAddress('');
  }

  return (
    <div style={{ padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', textAlign: 'center', backgroundColor: '#ffffff', color: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Üst Başlık */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#0052FF', fontWeight: '800', marginBottom: '5px', letterSpacing: '-0.5px' }}>Basecity Home</h1>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '0', fontWeight: '500' }}>Farcaster Mini App</p>
      </div>
      
      {/* Tam İstediğiniz Tasarıma Sahip Orta Buton Alanı */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', flexGrow: 1 }}>
        {!walletAddress ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Yuvarlak, Mavi, Büyük Base Butonu */}
            <button 
              onClick={handleConnect} 
              disabled={loading}
              style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                backgroundColor: '#0052FF', 
                color: '#ffffff', 
                border: 'none', 
                fontSize: '32px', 
                fontWeight: '900', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                boxShadow: '0 12px 32px rgba(0, 82, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '...' : 'Base'}
            </button>
            {/* Altındaki Cüzdanı Bağla Yazısı */}
            <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0', letterSpacing: '-0.2px' }}>
              {loading ? 'Onay Bekleniyor...' : 'Cüzdanı Bağla'}
            </p>
          </div>
        ) : (
          /* Bağlantı Başarılı Kartı */
          <div style={{ border: '1px solid #EAEAEA', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', backgroundColor: '#fcfcfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#00D395', borderRadius: '50%' }}></span>
              <span style={{ fontWeight: 'bold', color: '#0052FF' }}>Base Connected</span>
            </div>
            
            <p style={{ fontSize: '13px', backgroundColor: '#F5F5F5', padding: '12px', borderRadius: '10px', wordBreak: 'break-all', margin: '10px 0', fontFamily: 'monospace', fontWeight: '600', color: '#333' }}>
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </p>

            <button 
              onClick={handleDisconnect}
              style={{ marginTop: '20px', backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Alt Bilgi */}
      <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500' }}>
        Secured by Farcaster Frame v2
      </div>
    </div>
  );
}
