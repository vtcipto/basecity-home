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

  const [balloon, setBalloon] = useState('idle'); // 'idle', 'popping', 'popped'
  const [confetti, setConfetti] = useState([]);

  // Liderlik tablosunun başlangıç verilerini tarayıcı hafızasından güvenli bir şekilde yüklüyoruz
  const [leaderboard, setLeaderboard] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLeaderboard = localStorage.getItem('basecity_leaderboard');
      if (savedLeaderboard) {
        try {
          return JSON.parse(savedLeaderboard);
        } catch (e) {
          console.error("Hafızadan liderlik tablosu okunamadı:", e);
        }
      }
    }
    return [
      { name: 'United States', count: 12, flag: '🇺🇸', code: 'US' },
      { name: 'Türkiye', count: 8, flag: '🇹🇷', code: 'TR' },
      { name: 'United Kingdom', count: 5, flag: '🇬🇧', code: 'GB' }
    ];
  });

  const handleCountryChange = (countryName) => {
    setCountry(countryName);
    setCity('');
  };

  const fetchRealContractData = async () => {
    try {
      let updatedLeaderboard = [];
      
      if (typeof getTotalCheckIns === 'function') {
        updatedLeaderboard = await Promise.all(
          ALL_COUNTRIES.map(async (c) => {
            try {
              const count = await getTotalCheckIns(c.name);
              return { 
                name: c.name, 
                count: Number(count) || 0, 
                flag: c.code === 'TR' ? '🇹🇷' : c.code === 'US' ? '🇺🇸' : c.code === 'GB' ? '🇬🇧' : c.code === 'DE' ? '🇩🇪' : c.code === 'FR' ? '🇫🇷' : c.code === 'JP' ? '🇯🇵' : c.code === 'BR' ? '🇧🇷' : c.code === 'CA' ? '🇨🇦' : '🏳️'
              };
            } catch (e) {
              return null;
            }
          })
        );
        updatedLeaderboard = updatedLeaderboard.filter(Boolean);
      }

      if (updatedLeaderboard.length === 0) {
        const saved = localStorage.getItem('basecity_leaderboard');
        if (saved) {
          updatedLeaderboard = JSON.parse(saved);
        } else {
          return;
        }
      }

      const sortedTop3 = updatedLeaderboard
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setLeaderboard(sortedTop3);
      localStorage.setItem('basecity_leaderboard', JSON.stringify(sortedTop3));
    } catch (err) {
      console.error("Liderlik tablosu güncellenirken hata oluştu:", err);
    }
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
    fetchRealContractData();
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
        const realUserAddress = accounts || accounts;
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
    const colors = ['#0052FF', '#3B82F6', '#1D4ED8', '#60A5FA', '#00D395', '#FFCC00', '#FF2D55', '#A855F7'];
    const tempConfetti = [];
    for (let i = 0; i < 120; i++) {
      const size = 6 + Math.random() * 12;
      tempConfetti.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 2.5,
        size: size,
        shape: Math.random() > 0.4 ? '50%' : '0%'
      });
    }
    setConfetti(tempConfetti);
    setTimeout(() => setConfetti([]), 4500);
  }

  async function handlePopBalloon() {
    if (balloon === 'popping' || txLoading) return;

    try {
      setBalloon('popping');
      const txHash = await executeCheckIn(country); 

      // TEST MODU: Sayıyı anlık artırıp yerel hafızaya sınırsızca yazıyoruz
      setLeaderboard(prevList => {
        const exists = prevList.some(item => item.name === country);
        let newList = [];
        
        if (exists) {
          newList = prevList.map(item => 
            item.name === country ? { ...item, count: item.count + 1 } : item
          );
        } else {
          const countryObj = ALL_COUNTRIES.find(c => c.name === country);
          const flag = countryObj?.code === 'TR' ? '🇹🇷' : countryObj?.code === 'US' ? '🇺🇸' : countryObj?.code === 'GB' ? '🇬🇧' : '🏳️';
          newList = [...prevList, { name: country, count: 1, flag: flag }];
        }
        
        const sorted = newList.sort((a, b) => b.count - a.count).slice(0, 3);
        localStorage.setItem('basecity_leaderboard', JSON.stringify(sorted));
        return sorted;
      });

      setBalloon('popped');
      triggerConfetti();

      // TEST MODU: 4 saniye sonra balonu tekrar şişiriyoruz ki arka arkaya test edebilesiniz!
      setTimeout(() => {
        setBalloon('idle');
      }, 4000);

      setTimeout(() => {
        alert(`Success! Checked-in to ${country} 🚀\nTx: ${txHash}`);
      }, 200);
    } catch (err) {
      console.error(err);
      setBalloon('idle');
      alert("Transaction rejected or failed.");
    }
  }
  return (
    <div style={{ padding: '20px 10px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      
      {confetti.map((c) => (
        <div key={c.id} style={{
          position: 'absolute', top: '-20px', left: `${c.left}%`,
          width: `${c.size}px`, height: `${c.size}px`, backgroundColor: c.color,
          borderRadius: c.shape,
          opacity: 0.95, pointerEvents: 'none', zIndex: 999,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          animation: `superFall ${c.duration}s linear ${c.delay}s forwards`
        }} />
      ))}

      <style>{`
        @keyframes superFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
          35% { transform: translateY(35vh) rotate(120deg) translateX(25px); }
          70% { transform: translateY(70vh) rotate(240deg) translateX(-25px); opacity: 0.9; }
          100% { transform: translateY(105vh) rotate(360deg) translateX(0); opacity: 0; }
        }
        @keyframes balloonFloat {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes balloonPulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 82, 255, 0.6), 0 10px 20px rgba(0, 82, 255, 0.2); }
          70% { box-shadow: 0 0 0 20px rgba(0, 82, 255, 0), 0 15px 30px rgba(0, 82, 255, 0.4); }
          100% { box-shadow: 0 0 0 0 rgba(0, 82, 255, 0), 0 10px 20px rgba(0, 82, 255, 0.2); }
        }
        @keyframes balloonShake {
          0%, 100% { transform: translateX(0) scale(1.1); }
          20%, 60% { transform: translateX(-4px) scale(1.15); }
          40%, 80% { transform: translateX(4px) scale(1.15); }
        }
        @keyframes megaExplosion {
          0% { transform: scale(0.5); opacity: 1; filter: brightness(1.5); }
          50% { transform: scale(1.6); opacity: 0.8; filter: brightness(2); }
          100% { transform: scale(2.5); opacity: 0; filter: brightness(1); }
        }
      `}</style>

      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '75vh', borderRadius: '24px', padding: '25px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        {wallet && username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8F9FA', padding: '8px 16px', borderRadius: '50px', margin: '10px auto', border: '1px solid #E9ECEF', width: 'fit-content' }}>
            {pfpUrl ? (
              <img src={pfpUrl} alt="PFP" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{username.charAt(0).toUpperCase()}</div>
            )}
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#495057' }}>@{username}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '10px 0', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Select Your Country:</label>
              <select 
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff', fontWeight: '500', color: '#333' }}
              >
                <option value="">-- Ülke Seçiniz --</option>
                {ALL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {ALL_COUNTRIES.find(c => c.name === country)?.cities && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#0052FF', textTransform: 'uppercase' }}>Select Your City:</label>
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #0052FF', fontSize: '14px', outline: 'none', backgroundColor: '#fff', fontWeight: '500', color: '#333' }}
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
          {!wallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
              <button 
                onClick={handleConnect} 
                disabled={loading} 
                style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 82, 255, 0.3)' }}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{ height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
                
                {balloon === 'idle' || balloon === 'popping' ? (
                  /* SINIRSIZ PATLAYABİLEN DEVASA BALON */
                  <button 
                    onClick={handlePopBalloon} 
                    disabled={txLoading}
                    style={{ 
                      width: '145px', 
                      height: '145px', 
                      borderRadius: '50%', 
                      backgroundColor: '#0052FF', 
                      color: '#ffffff', 
                      border: '5px solid #ffffff', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: '0 12px 30px rgba(0, 82, 255, 0.4)',
                      animation: balloon === 'popping' ? 'balloonShake 0.4s infinite' : 'balloonFloat 3s infinite ease-in-out, balloonPulse 2s infinite ease-in-out',
                      transition: 'transform 0.2s, background-color 0.2s'
                    }}
                  >
                    <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #0052FF' }} />
                    <span style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>BASE</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', marginTop: '3px', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '1px' }}>POP IT!</span>
                  </button>
                ) : (
                  /* DEVASA PATLAMA EFEKTİ */
                  <div style={{ fontSize: '80px', animation: 'megaExplosion 0.5s ease-out forwards', position: 'absolute' }}>
                    💥
                  </div>
                )}
              </div>

              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0052FF' }}>● Connected: </span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <button 
                  onClick={() => { setWallet(''); setUsername(''); setBalloon('idle'); }}
                  style={{ display: 'block', margin: '6px auto 0 auto', padding: '4px 10px', border: '1px solid #FF3B30', borderRadius: '6px', backgroundColor: 'transparent', color: '#FF3B30', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

        </div>

        {/* LİDERLİK TABLOSU (SINIRSIZ YARIŞ MODU) */}
        <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #EFEFEF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>🏆</span>
            <span style={{ fontSize: '11px', color: '#111827', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top 3 Leaderboard</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {leaderboard.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #F1F3F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px' }}>{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>{item.flag} {item.name}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0052FF', backgroundColor: '#E6EFFF', padding: '2px 8px', borderRadius: '10px' }}>
                  {item.count} POPs
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '10px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center', marginTop: '10px' }}>
          Secured by Farcaster Identity
        </div>

      </div>
    </div>
  );
}
