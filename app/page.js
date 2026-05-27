'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';

export default function BasecityHome() {
  const [walletAddress, setWalletAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Farcaster Başlatıcı (Uygulamayı beyaz ekrandan kurtarır ve hazır hale getirir)
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

  // 2. Güvenli Konum Alma Fonksiyonu
  const konumAlPromise = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Tarayıcı konum desteklemiyor."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            enlem: position.coords.latitude,
            boylam: position.coords.longitude
          });
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  // 3. Kullanıcı Kontrollü Güvenli Cüzdan Bağlama ve İmza Akışı
  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    
    try {
      const provider = sdk.wallet?.ethProvider;
      
      if (!provider) {
        alert("Farcaster cüzdan sağlayıcısı bulunamadı. Lütfen uygulamayı Warpcast içerisinden açın.");
        setLoading(false);
        return;
      }

      // Adım 1: Kullanıcı butona basınca ekrana resmi Hesap Bağlantı Onayını getirir
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        const cleanAddress = accounts[0]; // İlk adresi dizi içinden güvenle çeker
        
        // Cüzdan onayından hemen sonra arka planda konumu al (Çökmeyi önlemek için)
        try {
          const konumVerisi = await konumAlPromise();
          setLocation(konumVerisi);
        } catch (konumHata) {
          console.log("Konum izni kullanıcı tarafından reddedildi veya alınamadı.");
        }
        
        // Adım 2: GÜVENLİK İÇİN EKRANA "MESAJ İMZALAMA" ONAYINI GETİRİR
        try {
          const mesajMetni = `Basecity Home uygulamasina guvenli baglanti onayi.\nCuzdan: ${cleanAddress}`;
          
          await provider.request({
            method: 'personal_sign',
            params: [mesajMetni, cleanAddress] // Farcaster standartlarına uygun parametre dizilimi
          });
          
          // Tüm kullanıcı onayları başarıyla tamamlandıysa adresi sisteme kaydet
          setWalletAddress(cleanAddress);
          
        } catch (signError) {
          console.error("İmza reddedildi:", signError);
          alert("Cüzdan imza onayı reddedildi.");
        }
      } else {
        alert("Cüzdan adresi alınamadı.");
      }
    } catch (connectError) {
      console.error("Bağlantı ana hatası:", connectError);
      alert("Cüzdan bağlantısı başarısız oldu veya reddedildi.");
    } finally {
      setLoading(false);
    }
  }

  // 4. Cüzdan Bağlantısını Kesme Fonksiyonu
  function handleDisconnect() {
    setWalletAddress('');
    setLocation(null);
  }

  return (
    <div style={{ padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', textAlign: 'center', backgroundColor: '#ffffff', color: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Üst Başlık */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#0052FF', fontWeight: '800', marginBottom: '5px', letterSpacing: '-0.5px' }}>Basecity Home</h1>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '0', fontWeight: '500' }}>Farcaster Mini App</p>
      </div>
      
      {/* Orta Buton ve Bilgi Alanı */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', flexGrow: 1 }}>
        {!walletAddress ? (
          /* Mavi, Yuvarlak Şık Base Temalı Buton */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
                fontSize: '15px', 
                fontWeight: 'bold', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                boxShadow: '0 8px 24px rgba(0, 82, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                lineHeight: '1.3',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Confirming...' : 'Connect Wallet & Get Location'}
            </button>
            <p style={{ color: '#0052FF', fontSize: '13px', fontWeight: '600' }}>
              {loading ? 'Lütfen cüzdanınızdan onay verin...' : 'Başlamak için butona dokunun'}
            </p>
          </div>
        ) : (
          /* Bağlantı Sonrası Kullanıcı Bilgi Kartı */
          <div style={{ border: '1px solid #EAEAEA', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', backgroundColor: '#fcfcfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#00D395', borderRadius: '50%' }}></span>
              <span style={{ fontWeight: 'bold', color: '#0052FF' }}>Base Connected</span>
            </div>
            
            <p style={{ fontSize: '13px', backgroundColor: '#F5F5F5', padding: '12px', borderRadius: '10px', wordBreak: 'break-all', margin: '10px 0', fontFamily: 'monospace', fontWeight: '600', color: '#333' }}>
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </p>
            
            {location ? (
              <div style={{ marginTop: '15px', backgroundColor: '#F0F5FF', padding: '14px', borderRadius: '10px', textAlign: 'left', border: '1px solid #DBEAFE' }}>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#1E40AF' }}><b>📍 Enlem:</b> {location.enlem.toFixed(4)}</p>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#1E40AF' }}><b>📍 Boylam:</b> {location.boylam.toFixed(4)}</p>
              </div>
            ) : (
              <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>Konum izni verilmedi veya alınamadı.</p>
            )}

            {/* Bağlantıyı Kesme Butonu */}
            <button 
              onClick={handleDisconnect}
              style={{ marginTop: '20px', backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Alt Bilgi Metni */}
      <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500' }}>
        Secured by Farcaster Frame v2
      </div>
    </div>
  );
}
