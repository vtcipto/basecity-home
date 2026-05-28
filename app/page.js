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
  const [miniBalloons, setMiniBalloons] = useState([]); // Patlamada saçılacak küçük baloncuklar

  // Liderlik tablosu hafıza sorgusu
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
                flag: c.code === 'TR' ? '🇹🇷' : c.code === 'US' ? '🇺🇸' : c.code === 'GB' ? '🇬🇧' : '🏳️'
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

  // BAĞLANTI ONAY PENCERESİ (window.confirm) TAMAMEN KALDIRILDI
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
        const realUserAddress = accounts[0] || accounts;
        
        // Onay penceresi sormadan doğrudan bağlıyoruz:
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // HEM KONFETİ HEM DE KÜÇÜK MAVİ BASE BALONCUKLARINI FİŞEKLİYEN ŞÖLEN FONKSİYONU
  function triggerVisualFeast() {
    const colors = ['#0052FF', '#3B82F6', '#1D4ED8', '#60A5FA', '#00D395', '#FFCC00', '#FF2D55'];
    const tempConfetti = [];
    const tempBalloons = [];
    
    // 1. Klasik şölen konfetileri (90 adet)
    for (let i = 0; i < 90; i++) {
      tempConfetti.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.6,
        duration: 1.5 + Math.random() * 2,
        size: 5 + Math.random() * 8,
        shape: Math.random() > 0.4 ? '50%' : '0%'
      });
    }

    // 2. Patlamayla etrafa saçılan KÜÇÜK MAVİ BASE BALONCUKLARI (25 adet)
    for (let i = 0; i < 25; i++) {
      // Rastgele fırlama yönleri (X ekseninde sağa sola saçılma)
      const drift = (Math.random() * 60) - 30; 
      tempBalloons.push({
        id: `mini_${i}`,
        left: 35 + Math.random() * 30, // Kartın ortasından fırlayacaklar
        drift: drift,
        size: 15 + Math.random() * 15, // Küçük sevimli boyutlar (15px - 30px)
        delay: Math.random() * 0.2,
        duration: 1.2 + Math.random() * 1.5
      });
    }

    setConfetti(tempConfetti);
    setMiniBalloons(tempBalloons);

    // Temizleme süreleri
    setTimeout(() => { setConfetti([]); setMiniBalloons([]); }, 4000);
  }

  // SUCCESS ALERT POP-UP PENCERESİ TAMAMEN KALDIRILDI
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
      triggerVisualFeast(); // Yeni şölen tetikleniyor

      // Başarı yazısı (alert) kaldırıldı, doğrudan 3.5 saniye sonra balon yenileniyor
      setTimeout(() => { setBalloon('idle'); }, 3500);
    } catch (err) {
      console.error(err);
      setBalloon('idle');
    }
  }
  return (
    <div style={{ padding: '20px 10px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      
      {/* ŞÖLEN KONFETİLERİ */}
      {confetti.map((c) => (
        <div key={c.id} style={{
          position: 'absolute', top: '-20px', left: `${c.left}%`,
          width: `${c.size}px`, height: `${c.size}px`, backgroundColor: c.color,
          borderRadius: c.shape, opacity: 0.9, pointerEvents: 'none', zIndex: 999,
          animation: `superFall ${c.duration}s linear ${c.delay}s forwards`
        }} />
      ))}

      {/* PATLAYAN KÜÇÜK MAVİ BASE BALONCUKLARI */}
      {miniBalloons.map((b) => (
        <div key={b.id} style={{
          position: 'absolute', top: '40%', left: `${b.left}%`,
          width: `${b.size}px`, height: `${b.size}px`, backgroundColor: '#0052FF',
          borderRadius: '50%', border: '2px solid #ffffff', opacity: 0.9,
          pointerEvents: 'none', zIndex: 998, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontSize: `${b.size / 3}px`,
          fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,82,255,0.25)',
          animation: `miniBalloonBurst ${b.duration}s cubic-bezier(0.1, 0.8, 0.3, 1) ${b.delay}s forwards`
        }}>
          B
        </div>
      ))}

      {/* GELİŞMİŞ ŞÖLEN VE SAÇILMA ANİMASYONLARI */}
      <style>{`
        @keyframes superFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
          50% { transform: translateY(50vh) rotate(180deg) translateX(20px); opacity: 0.9; }
          100% { transform: translateY(105vh) rotate(360deg) translateX(0); opacity: 0; }
        }
        @keyframes miniBalloonBurst {
          0% { transform: translate(0, 0) scale(0.5) rotate(0deg); opacity: 1; }
          15% { transform: translate(var(--drift-x, 30px), -60px) scale(1.2); }
          100% { transform: translate(var(--drift-x, 50px), 100vh) scale(0.8) rotate(720deg); opacity: 0; }
        }
        @keyframes balloonFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
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
          0% { transform: scale(0.4); opacity: 1; filter: brightness(1.6); }
          100% { transform: scale(2.2); opacity: 0; filter: brightness(1); }
        }
      `}</style>

      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '70vh', borderRadius: '24px', padding: '25px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2', zIndex: 10 }}>
        
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
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
                
                {balloon === 'idle' || balloon === 'popping' ? (
                  /* DEV MAVİ BASE BALONU */
                  <button 
                    onClick={handlePopBalloon} 
                    disabled={txLoading}
                    style={{ 
                      width: '140px', 
                      height: '140px', 
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
                      transition: 'transform 0.2s'
                    }}
                  >
                    <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #0052FF' }} />
                    <span style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>BASE</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', marginTop: '3px', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '1px' }}>POP IT!</span>
                  </button>
                ) : (
                  /* ANA COŞKULU PATLAMA */
                  <div style={{ fontSize: '80px', animation: 'megaExplosion 0.5s ease-out forwards', position: 'absolute' }}>
                    💥
                  </div>
                )}
              </div>
              
              {/* Çıkış Yapma Butonu (Cüzdan adresi alanı tamamen silindi, sadece küçük gizli bir çıkış linki bırakıldı) */}
              <button 
                onClick={() => { setWallet(''); setUsername(''); setBalloon('idle'); }}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Disconnect Account
              </button>
            </div>
          )}

        </div>

        {/* REKABET LİDERLİK TABLOSU */}
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
