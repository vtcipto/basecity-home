'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useCheckInTx } from '../hooks/useCheckInTx';
import { ALL_COUNTRIES } from '../constants/countriesData';

export default function BasecityHome() {
  const { executeCheckIn, getTotalCheckIns, txLoading } = useCheckInTx();
  const [wallet, setWallet] = useState('');
  const [username, setUsername] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('');

  const [balloon, setBalloon] = useState('idle');
  const [confetti, setConfetti] = useState([]);

  const handleCountryChange = (countryName) => {
    setCountry(countryName);
    setCity('');
  };

  useEffect(() => {
    async function initFarcaster() {
      try {
        if (typeof window !== 'undefined') {
          await sdk.actions.ready();
        }
      } catch (err) {
        console.warn("Farcaster context initialization skipped.");
      }
    }
    initFarcaster();
  }, []);

  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    try {
      const provider = sdk.wallet?.ethProvider;
      if (!provider) {
        alert("Please open this app inside Warpcast to connect your real wallet.");
        setLoading(false);
        return;
      }

      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts && accounts.length > 0) {
        const realUserAddress = accounts[0] || accounts;
        const isAuthorized = window.confirm(
          `Connect Basecity Home with your wallet?\n\nAddress:\n${realUserAddress}`
        );
        if (!isAuthorized) { setLoading(false); return; }

        const context = await sdk.context;
        if (context?.user) {
          setUsername(context.user.username || context.user.displayName || 'User');
          setPfpUrl(context.user.pfpUrl || '');
        } else {
          setUsername('Warpcast User');
        }
        setWallet(realUserAddress);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Wallet connection rejected by user.");
    } finally {
      setLoading(false);
    }
  }

  function triggerConfetti() {
    const colors = ['#0052FF', '#FF3B30', '#00D395', '#FFCC00', '#FF2D55'];
    const tempConfetti = [];
    for (let i = 0; i < 35; i++) {
      tempConfetti.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.4,
        duration: 1.2 + Math.random() * 1
      });
    }
    setConfetti(tempConfetti);
    setTimeout(() => setConfetti([]), 2500);
  }

  async function handlePopBalloon() {
    if (balloon === 'popped' || txLoading) return;

    try {
      const txHash = await executeCheckIn(country); 
      setBalloon('popped');
      triggerConfetti();
      setTimeout(() => {
        alert(`Success! Checked-in to ${country} 🚀\nTx: ${txHash}`);
      }, 200);
    } catch (err) {
      console.error(err);
      alert("Transaction rejected or failed.");
    }
  }
  return (
      
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      
      {/* Konfeti Efekti */}
      {confetti.map((c) => (
        <div key={c.id} style={{
          position: 'absolute', top: '-10px', left: `${c.left}%`,
          width: '8px', height: '8px', backgroundColor: c.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          opacity: 0.8, pointerEvents: 'none', zIndex: 999,
          animation: `fall ${c.duration}s linear ${c.delay}s forwards`
        }} />
      ))}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* TEK ANA KART - Ekranın bölünmesini engelleyen ana taşıyıcı */}
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '70vh', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        {wallet && username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8F9FA', padding: '10px 18px', borderRadius: '50px', margin: '15px auto', border: '1px solid #E9ECEF', width: 'fit-content' }}>
            {pfpUrl ? (
              <img src={pfpUrl} alt="PFP" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{username.charAt(0).toUpperCase()}</div>
            )}
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>@{username}</span>
          </div>
        )}

        {/* ORTA İÇERİK ALANI */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '15px 0', gap: '20px' }}>
          
          {/* ÜLKE VE ŞEHİR SEÇİM ALANI - KARTIN İÇİNE ENTEGRE EDİLDİ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            
            {/* Ülke Seçimi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Select Your Country:</label>
              <select 
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff', fontWeight: '500', color: '#333' }}
              >
                <option value="">-- Ülke Seçiniz --</option>
                {ALL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Şehir Seçimi (Sadece seçilen ülkenin şehirleri varsa şıkça altında açılır) */}
            {ALL_COUNTRIES.find(c => c.name === country)?.cities && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#0052FF', textTransform: 'uppercase' }}>Select Your City:</label>
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #0052FF', fontSize: '14px', outline: 'none', backgroundColor: '#fff', fontWeight: '500', color: '#333' }}
                >
                  <option value="">-- Şehir Seçiniz --</option>
                  {ALL_COUNTRIES.find(c => c.name === country).cities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* AKŞIYON BUTONLARI */}
          {!wallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
              <button 
                onClick={handleConnect} 
                disabled={loading} 
                style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 82, 255, 0.3)' }}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {balloon === 'idle' ? (
                  <button 
                    onClick={handlePopBalloon} 
                    disabled={txLoading}
                    style={{ width: '130px', height: '130px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,82,255,0.2)' }}
                  >
                    <span>🎈</span>
                    <span style={{ fontSize: '11px', marginTop: '4px' }}>POP {country.toUpperCase()} {city && `- ${city.toUpperCase()}`}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: '54px' }}>💥</div>
                )}
              </div>

              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0052FF' }}>● Connected: </span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <button 
                  onClick={() => { setWallet(''); setUsername(''); setBalloon('idle'); }}
                  style={{ display: 'block', margin: '10px auto 0 auto', padding: '6px 12px', border: '1px solid #FF3B30', borderRadius: '6px', backgroundColor: 'transparent', color: '#FF3B30', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center', marginTop: '15px' }}>
          Secured by Farcaster Identity
        </div>

      </div>
    </div>
  );
}
