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
  const [baseFragments, setBaseFragments] = useState([]);

  const [leaderboard, setLeaderboard] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLeaderboard = localStorage.getItem('basecity_leaderboard');
      if (savedLeaderboard) {
        try { return JSON.parse(savedLeaderboard); } catch (e) { console.error(e); }
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

  // UYGULAMAYI WARPCAST ÜZERİNDE PAYLAŞTIRAN YENİ FONKSİYON (Cast Intent)
      const handleShareApp = async () => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vercel.app';
    const shareText = `I just checked-in to ${country}${city ? ` (${city})` : ''} on Basecity Home! 🎈✨ Come pop the giant BASE balloon and support your country on-chain! 🏆🔵`;
    const warpcastIntentUrl = `https://warpcast.com{encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(appUrl)}`;
    
    try {
      // Farcaster Mini App resmi SDK yönlendirmesi
      if (typeof window !== 'undefined' && sdk?.actions) {
        await sdk.actions.openUrl(warpcastIntentUrl);
      } else if (typeof window !== 'undefined') {
        window.open(warpcastIntentUrl, '_blank');
      }
    } catch (error) {
      console.error("Farcaster share failed, trying fallback:", error);
      // Eğer SDK hata verirse zorunlu tarayıcı tetiklemesi (Fallback)
      if (typeof window !== 'undefined') {
        window.location.href = warpcastIntentUrl;
      }
    }
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
                flag: c.code === 'TR' ? '🇹🇷' : c.code === 'US' ? '🇺🇸' : '🏳️'
              };
            } catch (e) { return null; }
          })
        );
        updatedLeaderboard = updatedLeaderboard.filter(Boolean);
      }
      if (updatedLeaderboard.length === 0) {
        const saved = localStorage.getItem('basecity_leaderboard');
        if (saved) updatedLeaderboard = JSON.parse(saved);
        else return;
      }
      const sortedTop3 = updatedLeaderboard.sort((a, b) => b.count - a.count).slice(0, 3);
      setLeaderboard(sortedTop3);
      localStorage.setItem('basecity_leaderboard', JSON.stringify(sortedTop3));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    async function initFarcaster() {
      try { if (typeof window !== 'undefined') await sdk.actions.ready(); } catch (err) { console.warn(err); }
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
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const realUserAddress = accounts || accounts;
        const context = await sdk.context;
        if (context?.user) {
          setUsername(context.user.username || context.user.displayName || 'User');
          setPfpUrl(context.user.pfpUrl || '');
        } else {
          setUsername('Warpcast User');
        }
        setWallet(realUserAddress);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  function triggerSlowMotionBurst() {
    const fragments = [];
    for (let i = 0; i < 45; i++) {
      const angle = (i * 8) + Math.random() * 10;
      const radius = 80 + Math.random() * 260;
      const moveX = Math.cos(angle * Math.PI / 180) * radius;
      const moveY = Math.sin(angle * Math.PI / 180) * radius;
      
      fragments.push({
        id: `base_frag_${i}`,
        moveX: moveX,
        moveY: moveY,
        fontSize: 11 + Math.random() * 6,
        delay: Math.random() * 0.3,
        duration: 3.5 + Math.random() * 2.0,
        rotation: (Math.random() * 360) - 180
      });
    }
    setBaseFragments(fragments);
    setTimeout(() => { setBaseFragments([]); }, 6000);
  }

  async function handlePopBalloon() {
    if (balloon === 'popping' || txLoading) return;
    try {
      setBalloon('popping');
      await executeCheckIn(country); 

      setLeaderboard(prevList => {
        const exists = prevList.some(item => item.name === country);
        let newList = [];
        if (exists) {
          newList = prevList.map(item => item.name === country ? { ...item, count: item.count + 1 } : item);
        } else {
          const countryObj = ALL_COUNTRIES.find(c => c.name === country);
          const flag = countryObj?.code === 'TR' ? '🇹🇷' : countryObj?.code === 'US' ? '🇺🇸' : '🏳️';
          newList = [...prevList, { name: country, count: 1, flag: flag }];
        }
        const sorted = newList.sort((a, b) => b.count - a.count).slice(0, 3);
        localStorage.setItem('basecity_leaderboard', JSON.stringify(sorted));
        return sorted;
      });

      setBalloon('popped');
      triggerSlowMotionBurst();
      setTimeout(() => { setBalloon('idle'); }, 5000);
    } catch (err) {
      console.error(err);
      setBalloon('idle');
    }
  }
  return (
    <div style={{ padding: '20px 10px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      
      {/* SLOW-MOTION "BASE" PARÇACIKLARI */}
      {baseFragments.map((f) => (
        <div key={f.id} style={{
          position: 'absolute', top: '45%', left: '50%',
          backgroundColor: '#0052FF', color: '#ffffff',
          padding: '4px 9px', borderRadius: '20px',
          fontSize: `${f.fontSize}px`, fontWeight: '900',
          letterSpacing: '0.5px', fontFamily: 'sans-serif',
          boxShadow: '0 4px 12px rgba(0, 82, 255, 0.25)',
          border: '1.5px solid #ffffff', pointerEvents: 'none', zIndex: 999,
          '--x': `${f.moveX}px`, '--y': `${f.moveY}px`, '--rot': `${f.rotation}deg`,
          animation: `slowMotionScatter ${f.duration}s cubic-bezier(0.1, 0.8, 0.2, 1) ${f.delay}s forwards`
        }}>
          BASE
        </div>
      ))}

      <style>{`
        @keyframes slowMotionScatter {
          0% { transform: translate(-50%, -50%) scale(0.3) rotate(0deg); opacity: 1; filter: blur(2px); }
          15% { filter: blur(0px); transform: translate(-50%, -50%) scale(1.1) rotate(20deg); }
          80% { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0.9) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes balloonFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes balloonPulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 82, 255, 0.5), 0 10px 20px rgba(0, 82, 255, 0.15); }
          70% { box-shadow: 0 0 0 18px rgba(0, 82, 255, 0), 0 15px 25px rgba(0, 82, 255, 0.3); }
          100% { box-shadow: 0 0 0 0 rgba(0, 82, 255, 0), 0 10px 20px rgba(0, 82, 255, 0.15); }
        }
        @keyframes balloonShake {
          0%, 100% { transform: translateX(0) scale(1.08); }
          25% { transform: translateX(-3px) scale(1.1); }
          75% { transform: translateX(3px) scale(1.1); }
        }
        @keyframes smoothFadeOut {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0) rotate(45deg); opacity: 0; }
        }
      `}</style>

      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '72vh', borderRadius: '24px', padding: '25px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2', zIndex: 10 }}>
        
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
                
                {balloon === 'idle' || balloon === 'popping' ? (
                  <button 
                    onClick={handlePopBalloon} 
                    disabled={txLoading}
                    style={{ 
                      width: '135px', height: '135px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: '5px solid #ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
                      boxShadow: '0 12px 30px rgba(0, 82, 255, 0.4)',
                      animation: balloon === 'popping' ? 'balloonShake 0.4s infinite' : 'balloonFloat 3s infinite ease-in-out, balloonPulse 2s infinite ease-in-out',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #0052FF' }} />
                    <span style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>BASE</span>
                    <span style={{ fontSize: '9px', fontWeight: '800', marginTop: '3px', color: '#93C5FD', textTransform: 'uppercase' }}>POP IT!</span>
                  </button>
                ) : (
                  <div style={{ 
                    width: '135px', height: '135px', borderRadius: '50%', backgroundColor: '#0052FF', border: '5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'smoothFadeOut 0.7s ease-in forwards'
                  }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>BASE</span>
                  </div>
                )}
              </div>
              
              {/* ŞIK PAYLAŞIM VE DAVET ETME BUTONU (SHARE FEATURE) */}
              <button 
                onClick={handleShareApp}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '12px',
                  backgroundColor: 'transparent', border: '2px solid #0052FF',
                  color: '#0052FF', fontSize: '13px', fontWeight: '750',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0, 82, 255, 0.05)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0052FF'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0052FF'; }}
              >
                <span>📢</span> Share App & Invite Friends
              </button>

              <button 
                onClick={() => { setWallet(''); setUsername(''); setBalloon('idle'); }}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}
              >
                Disconnect Account
              </button>
            </div>
          )}

        </div>

        {/* LİDERLİK TABLOSU */}
        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #EFEFEF' }}>
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
