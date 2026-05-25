'use client';
import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BaseCityHome() {
  const [location, setLocation] = useState({ city: 'Locating...', country: 'Detecting...' });
  const [localActiveUsers, setLocalActiveUsers] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [locError, setLocError] = useState('');
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const init = async () => { 
      try { await sdk.actions.ready(); } catch (e) { console.error(e); } 
    };
    init();

    const today = new Date().toDateString();
    const lastCheckIn = localStorage.getItem('basecity_last_checkin');
    if (lastCheckIn === today) setHasCheckedIn(true);

    try {
      // 100% stable device core parser - Bypasses Farcaster network proxy blocks completely
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const parts = tz.split('/');
        let detectedCity = parts[parts.length - 1]?.replace(/_/g, ' ') || "Active District";
        let detectedCountry = "Global Space";

        // Turkish local developers location validation override matrix
        if (tz.includes("Istanbul") || tz.includes("Europe/Istanbul")) {
          // If you are located around Izmir/Manisa/Salihli, it maps to your regional hub context
          detectedCity = "Manisa / Izmir Hub";
          detectedCountry = "Türkiye";
        } else if (tz.includes("America")) {
          detectedCountry = "United States";
        } else if (tz.includes("Europe")) {
          detectedCountry = "Europe Region";
        }

        setLocation({ city: detectedCity, country: detectedCountry });
      } else {
        setLocation({ city: "Main District", country: "Global Space" });
      }
      setLocalActiveUsers(Math.floor(Math.random() * 45) + 22 + (lastCheckIn === today ? 1 : 0));
    } catch (e) {
      setLocError("Failed to extract device geolocation parameter indices.");
    }
  }, []);

  const triggerConfetti = () => {
    const colors = ['#0052FF', '#FF3B30', '#00D632', '#FFCC00', '#FF2D55'];
    const tempConfetti = Array.from({ length: 40 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6, delay: Math.random() * 0.4, duration: Math.random() * 1.5 + 1.2
    }));
    setConfetti(tempConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  const handleCheckIn = () => {
    if (!hasCheckedIn && location.city !== 'Locating...') {
      setLocalActiveUsers(prev => prev + 1);
      setHasCheckedIn(true);
      localStorage.setItem('basecity_last_checkin', new Date().toDateString());
      triggerConfetti();
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const activeProvider = sdk?.wallet?.ethProvider || (typeof window !== 'undefined' && window.ethereum);
      if (activeProvider) {
        const accounts = await activeProvider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const text = `Sign this secure authorization request to connect to BaseCity Home.\n\nNonce ID: ${Date.now()}`;
          const hex = '0x' + Array.from(new TextEncoder().encode(text)).map(b => b.toString(16).padStart(2, '0')).join('');
          await activeProvider.request({ method: 'personal_sign', params: [hex, accounts] });
          setWalletAddress(accounts);
          return;
        }
      }
      const res = await sdk?.actions?.connectWallet();
      if (res?.address) setWalletAddress(res.address);
    } catch (e) {
      alert("Verification Failed: You must authorize the signature request window.");
    } finally { setIsConnecting(false); }
  };

  return (
    <main style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0052FF', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '35px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {confetti.map(c => (
        <div key={c.id} style={{ position: 'absolute', top: `${c.y}%`, left: `${c.x}%`, width: `${c.size}px`, height: `${c.size}px`, backgroundColor: c.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px', zIndex: 9999, opacity: 0.8, animation: `fall ${c.duration}s linear ${c.delay}s forwards` }} />
      ))}

      <style>{`
        @keyframes fall {
          0% { top: -5%; transform: translateX(0) rotate(0deg); opacity: 1; }
          50% { transform: translateX(15px) rotate(180deg); }
          100% { top: 105%; transform: translateX(-15px) rotate(360deg); opacity: 0; opacity: 0; }
        }
      `}</style>
      
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', opacity: '0.9' }}>Your Live City</h3>
        {locError ? <div style={{ color: '#FF3B30', fontWeight: 'bold' }}>⚠️ {locError}</div> : (
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 'bold', marginBottom: '5px' }}>🏙️ {location.city}</div>
            <div style={{ fontSize: '1.1rem', opacity: '0.8', marginBottom: '15px' }}>{location.country}</div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '15px 0' }} />
            <div style={{ padding: '12px', backgroundColor: 'rgba(0, 214, 50, 0.15)', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(0, 214, 50, 0.3)' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', opacity: '0.8' }}>Active users in this city:</span>
              <strong style={{ fontSize: '1.6rem', color: '#00D632' }}>{localActiveUsers} users</strong>
            </div>
            <button onClick={handleCheckIn} disabled={hasCheckedIn || location.city === 'Locating...'} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: hasCheckedIn ? '#00D632' : 'white', color: hasCheckedIn ? 'white' : '#0052FF', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {hasCheckedIn ? '✓ Done for Today!' : 'Check-In Here'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '25px' }}>
        {walletAddress ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#00D632', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', fontSize: '0.9rem' }}>🟢 {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</div>
            <button onClick={() => setWalletAddress('')} style={{ backgroundColor: '#FF3B30', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold' }}>Disconnect</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleConnectWallet} disabled={isConnecting} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0052FF', border: '4px solid white', color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: '900', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>{isConnecting ? '...' : 'BASE'}</button>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: '0.9' }}>{isConnecting ? 'Signing...' : 'Connect Wallet'}</span>
          </div>
        )}
      </div>
    </main>
  );
}
