'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

// Ülke ve Şehir Veritabanı
const countryData = {
  "Türkiye": ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya"],
  "Amerika Birleşik Devletleri": ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco"],
  "Almanya": ["Berlin", "Münih", "Frankfurt", "Hamburg", "Köln", "Stuttgart"],
  "İngiltere": ["Londra", "Manchester", "Birmingham", "Liverpool", "Leeds"],
  "Fransa": ["Paris", "Marsilya", "Lyon", "Nice", "Toulouse"],
  "İtalya": ["Roma", "Milano", "Napoli", "Floransa", "Venedik"],
  "Japonya": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"]
};

export default function BaseCityHome() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Farcaster SDK Başlatma
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

  // Manuel Cüzdan Bağlama Fonksiyonu (Onaylı)
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      // Farcaster kullanıcının önüne cüzdan onay penceresini çıkarır
      const provider = await sdk.actions.connectWallet();
      if (provider && provider.address) {
        setWalletAddress(provider.address);
      } else if (window.ethereum) {
        // Alternatif tarayıcı desteği provizyonu
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Cüzdan bağlama reddedildi veya hata oluştu:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Cüzdan Adresini Kısaltma Formatı (Örn: 0x1234...abcd)
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <main style={{ 
      padding: '40px 20px', 
      textAlign: 'center', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#0052FF',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {/* Cüzdan Durum ve Onay Butonu */}
      <div style={{ marginBottom: '30px' }}>
        {walletAddress ? (
          <div style={{
            backgroundColor: '#00D632',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '24px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            🟢 Bağlı Cüzdan: {formatAddress(walletAddress)}
          </div>
        ) : (
          <button 
            onClick={handleConnectWallet}
            disabled={isConnecting}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#fff', 
              color: '#0052FF', 
              border: 'none', 
              borderRadius: '24px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            {isConnecting ? 'Onay Bekleniyor...' : '⚡ Cüzdanı Bağla (Onaylı)'}
          </button>
        )}
      </div>

      {/* Form Alanı Kartı */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '30px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Ülke Seçim Kutusu */}
        <div style={{ textDirection: 'ltr', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Dünya Ülkeleri</label>
          <select 
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedCity('');
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'white',
              color: '#333',
              fontSize: '1rem',
              outline: 'none'
            }}
          >
            <option value="">Bir Ülke Seçin...</option>
            {Object.keys(countryData).map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Şehir Seçim Kutusu */}
        <div style={{ textDirection: 'ltr', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Şehirler</label>
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedCountry}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedCountry ? 'white' : 'rgba(255, 255, 255, 0.2)',
              color: selectedCountry ? '#333' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '1rem',
              outline: 'none',
              cursor: selectedCountry ? 'pointer' : 'not-allowed'
            }}
          >
            <option value="">{selectedCountry ? 'Bir Şehir Seçin...' : 'Önce Ülke Seçmelisiniz'}</option>
            {selectedCountry && countryData[selectedCountry].map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Seçim Özeti Ekranı */}
        {selectedCountry && selectedCity && (
          <div style={{ 
            marginTop: '10px', 
            padding: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            fontSize: '0.95rem' 
          }}>
            📍 Seçilen Yer: <strong>{selectedCity}, {selectedCountry}</strong>
          </div>
        )}
      </div>

      {/* Dış Link Butonu */}
      <button 
        onClick={() => sdk.actions.openUrl('https://basescan.org')}
        style={{ 
          marginTop: '30px',
          padding: '12px 24px', 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          color: 'white', 
          border: '1px solid rgba(255,255,255,0.4)', 
          borderRadius: '24px', 
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.9rem'
        }}
      >
        View Transaction on Basescan
      </button>
    </main>
  );
}
