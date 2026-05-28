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

  const [balloon, setBalloon] = useState('idle'); // 'idle' veya 'popped'
  const [confetti, setConfetti] = useState([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const [leaderboard, setLeaderboard] = useState([
    { name: 'United States', count: 0, flag: '🇺🇸', code: 'US' },
    { name: 'Türkiye', count: 0, flag: '🇹🇷', code: 'TR' },
    { name: 'United Kingdom', count: 0, flag: '🇬🇧', code: 'GB' }
  ]);

  const handleCountryChange = (countryName) => {
    setCountry(countryName);
    setCity('');
  };

  const checkDailyLimit = (userWallet) => {
    if (!userWallet) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastCheckIn = localStorage.getItem(`checkin_${userWallet.toLowerCase()}`);
      
      if (lastCheckIn === today) {
        setHasCheckedInToday(true);
        setBalloon('popped');
      } else {
        setHasCheckedInToday(false);
        setBalloon('idle');
      }
    } catch (e) {
      console.error("Localstorage okuma hatası:", e);
    }
  };

  const fetchRealContractData = async () => {
    try {
      if (typeof getTotalCheckIns === 'function') {
        const updatedLeaderboard = await Promise.all(
          ALL_COUNTRIES.map(async (c) => {
            try {
              const count = await getTotalCheckIns(c.name);
              return { 
                name: c.name, 
                count: Number(count) || 0, 
                flag: c.code === 'TR' ? '🇹🇷' : c.code === 'US' ? '🇺🇸' : c.code === 'GB' ? '🇬🇧' : c.code === 'DE' ? '🇩🇪' : c.code === 'FR' ? '🇫🇷' : c.code === 'JP' ? '🇯🇵' : c.code === 'BR' ? '🇧🇷' : c.code === 'CA' ? '🇨🇦' : '🏳️'
              };
            } catch (e) {
              return { name: c.name, count: 0, flag: '🏳️' };
            }
          })
        );

        const sortedTop3 = updatedLeaderboard
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setLeaderboard(sortedTop3);
      }
    } catch (err) {
      console.error("Sözleşmeden veri alınamadı:", err);
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

  useEffect(() => {
    if (wallet) {
      checkDailyLimit(wallet);
    }
  }, [wallet]);

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

  // ETKİLEYİCİ GÖRSEL ŞÖLEN KONFETİ FONKSİYONU (Yoğunluğu artırıldı ve farklı boyutlar eklendi)
  function triggerConfetti() {
    const colors = [
      '#0052FF', '#3B82F6', '#60A5FA', // Base Mavisi tonları (Ağırlıklı)
      '#00D395', '#FFCC00', '#FF2D55', '#A855F7' // Diğer canlı şölen renkleri
    ];
    const tempConfetti = [];
    
    // Konfeti sayısı daha etkileyici bir şölen için 35'ten 85'e çıkarıldı!
    for (let i = 0; i < 85; i++) {
      const size = 6 + Math.random() * 8; // Farklı boyutlarda konfetiler (6px - 14px)
      tempConfetti.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.6, // Dağınık yağma efekti
        duration: 1.5 + Math.random() * 1.5, // Farklı hızlarda düşüş
        size: size,
        shape: Math.random() > 0.4 ? '50%' : '0%' // Yuvarlak ve kare karışık
      });
    }
    setConfetti(tempConfetti);
    setTimeout(() => setConfetti([]), 4000); // Şölen süresi uzatıldı
  }

  async function handlePopBalloon() {
    if (balloon === 'popped' || txLoading || hasCheckedInToday) return;

    try {
      const txHash = await executeCheckIn(country); 

      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`checkin_${wallet.toLowerCase()}`, today);
      setHasCheckedInToday(true);

      setLeaderboard(prevList => 
        prevList.map(item => 
          item.name === country ? { ...item, count: item.count + 1 } : item
        ).sort((a, b) => b.count - a.count)
      );

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
    <div style={{ padding: '20px 10px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      
      {/* ŞÖLEN KONFETİ YAPILARI */}
      {confetti.map((c) => (
        <div key={c.id} style={{
          position: 'absolute', top: '-20px', left: `${c.left}%`,
          width: `${c.size}px`, height: `${c.size}px`, backgroundColor: c.color,
          borderRadius: c.shape,
          opacity: 0.9, pointerEvents: 'none', zIndex: 999,
          animation: `fallAndSpin ${c.duration}s linear ${c.delay}s forwards`
        }} />
      ))}

      {/* Gelişmiş Dönen, Sağa Sola Sallanan Konfeti ve Parlama Efektleri */}
      <style>{`
        @keyframes fallAndSpin {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
          50% { transform: translateY(50vh) rotate(180deg) translateX(15px); opacity: 0.9; }
          100% { transform: translateY(105vh) rotate(360deg) translateX(-15px); opacity: 0; }
        }
        @keyframes basePulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 82, 255, 0.5); }
          70% { transform: scale(1.04); box-shadow: 0 0 20px 15px rgba(0, 82, 255, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 82, 255, 0); }
        }
        @keyframes particleExplosion {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
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
                disabled={hasCheckedInToday}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: hasCheckedInToday ? '#f3f4f6' : '#fff', fontWeight: '500', color: '#333' }}
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
                  disabled={hasCheckedInToday}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #0052FF', fontSize: '14px', outline: 'none', backgroundColor: hasCheckedInToday ? '#f3f4f6' : '#fff', fontWeight: '500', color: '#333' }}
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
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
                {hasCheckedInToday ? (
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '50px', animation: 'particleExplosion 1s ease-out forwards' }}>💥</div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', backgroundColor: '#E6F4EA', padding: '5px 14px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                      Today's Check-in Complete!
                    </span>
                  </div>
                ) : balloon === 'idle' ? (
                  /* MAVİ PARLAYAN DAİRESEL BASE BUTONU */
                  <button 
                    onClick={handlePopBalloon} 
                    disabled={txLoading}
                    style={{ 
                      width: '125px', 
                      height: '125px', 
                      borderRadius: '50%', 
                      backgroundColor: '#0052FF', 
                      color: '#ffffff', 
                      border: '4px solid #ffffff', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      boxShadow: '0 10px 25px rgba(0, 82, 255, 0.35)',
                      animation: 'basePulse 2s infinite ease-in-out',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '1px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>BASE</span>
                    <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px', color: '#DBEAFE', opacity: 0.9 }}>POP IT!</span>
                  </button>
                ) : (
                  /* PATLAMA ANI GÖRSEL ŞÖLENİ */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'particleExplosion 0.6s ease-out forwards' }}>
                    <div style={{ fontSize: '64px' }}>💥</div>
                  </div>
                )}
              </div>

              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0052FF' }}>● Connected: </span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <button 
                  onClick={() => { setWallet(''); setUsername(''); setBalloon('idle'); setHasCheckedInToday(false); }}
                  style={{ display: 'block', margin: '6px auto 0 auto', padding: '4px 10px', border: '1px solid #FF3B30', borderRadius: '6px', backgroundColor: 'transparent', color: '#FF3B30', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

        </div>

        <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #EFEFEF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>🏆</span>
            <span style={{ fontSize: '11px', color: '#111827', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top 3 Onchain Countries</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {leaderboard.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '6px 10px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #F1F3F5' }}>
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
