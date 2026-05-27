'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';

export default function BasecityHome() {
  const [walletAddress, setWalletAddress] = useState('');
  const [location, setLocation] = useState(null);
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

  // 2. Güvenli Konum Alma Fonksiyonu (Yazım Hatası Düzeltildi)
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

  // 3. Cüzdan Bağlama ve Resmi Onay (Sign) İsteme Fonksiyonu
  async function handleConnect() {
    setLoading(true);
    try {
      const provider = sdk.wallet?.ethProvider;
      
      if (!provider) {
        alert("Farcaster cüzdan sağlayıcısı bulunamadı. Lütfen Warpcast içinden açın.");
        return;
      }

      // EKRANA RESMİ CÜZDAN BAĞLANTI ONAYINI GETİRİR
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        
        // Önce konum verisini güvenle alalım
        let konumVerisi = null;
        try {
          konumVerisi = await konumAlPromise();
          setLocation(konumVerisi);
        } catch (konumHata) {
          alert("Cüzdan bağlandı ancak konum izni alınamadı.");
        }
        
        // GÜVENLİK İÇİN KULLANICIYA EKRANDA BİR DE "İMZA/ONAY" PENCERESİ SUNAR
        try {
          await provider.request({
            method: 'personal_sign',
            params: [
              `Basecity Home uygulamasina guvenli baglanti onayi.\nCuzdan: ${address}`,
              address
            ]
          });
          
          setWalletAddress(address);
          
        } catch (signError) {
          alert("Cüzdan imza onayı reddedildi.");
        }
      }
    } catch (connectError) {
      console.error("Bağlantı hatası:", connectError);
      alert("Cüzdan bağlantısı reddedildi.");
    } finally {
      setLoading(false);
    }
  }

  // 4. Cüzdanı Koparma Fonksiyonu
  function handleDisconnect() {
    setWalletAddress('');
    setLocation(null);
  }

  return (
    <div style={{ padding: '30px 20px', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#ffffff', color: '#111111', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', color: '#0052FF', fontWeight: 'bold', marginBottom: '5px' }}>Basecity Home</h1>
      <p style={{ color: '#666', fontSize: '14px', marginTop: '0' }}>Farcaster Mini App</p>
      
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        {!walletAddress ? (
          /* İstediğiniz Mavi, Yuvarlak Base Temalı Buton */
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
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              boxShadow: '0 8px 24px rgba(0, 82, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '15px'
            }}
          >
            {loading ? 'Confirming...' : 'Connect Wallet & Get Location'}
          </button>
        ) : (
          /* Bağlantı Sonrası Bilgi Kartı */
          <div style={{ border: '1px solid #EAEAEA', borderRadius: '16px', padding: '24px', maxWidth: '350px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#00D395', borderRadius: '50%' }}></span>
              <span style={{ fontWeight: 'bold', color: '#0052FF' }}>Base Connected</span>
            </div>
            
            <p style={{ fontSize: '13px', backgroundColor: '#F5F5F5', padding: '10px', borderRadius: '8px', wordBreak: 'break-all', margin: '10px 0' }}>
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </p>
            
            {location ? (
              <div style={{ marginTop: '15px', backgroundColor: '#F0F5FF', padding: '12px', borderRadius: '8px', textAlign: 'left' }}>
                <p style={{ margin: '4px 0', fontSize: '14px' }}><b>📍 Enlem:</b> {location.enlem.toFixed(4)}</p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}><b>📍 Boylam:</b> {location.boylam.toFixed(4)}</p>
              </div>
            ) : (
              <p style={{ color: '#888', fontSize: '13px' }}>Konum izni bekleniyor...</p>
            )}

            {/* Cüzdan Koparma Butonu */}
            <button 
              onClick={handleDisconnect}
              style={{ marginTop: '20px', backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
