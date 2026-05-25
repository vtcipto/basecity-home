'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BaseCityHome() {
  const [location, setLocation] = useState({ country: 'Detecting...', lat: null, lon: null });
  const [stats, setStats] = useState({});
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    const initFarcaster = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }
    };
    initFarcaster();

    // Trigger Native Browser Geolocation API immediately
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            // Reverse geocode via open source rapid API to find the exact Country
            const res = await fetch(`https://bigdatacloud.net{lat}&longitude=${lon}&localityLanguage=en`);
            const data = await res.json();
            const detectedCountry = data.countryName || "Global Space";
            
            setLocation({ country: detectedCountry, lat: lat.toFixed(2), lon: lon.toFixed(2) });

            // Simulates real-time active users distributed across countries
            setStats({
              [detectedCountry]: Math.floor(Math.random() * 45) + 12, // Your active neighborhood
              "United States": 142,
              "United Kingdom": 89,
              "Türkiye": 114,
              "Germany": 65,
              "France": 43
            });

          } catch (err) {
            setLocation({ country: "Unknown Country", lat: lat.toFixed(2), lon: lon.toFixed(2) });
          }
        },
        (error) => {
          setLocError("Location permission denied. Please allow GPS access.");
          // Default fallback data matrix
          setStats({ "United States": 142, "Türkiye": 114, "Germany": 65 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocError("Geolocation is not supported by this Farcaster client.");
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (sdk?.wallet?.ethProvider) {
        const accounts = await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' });
        if (accounts?.length > 0) { setWalletAddress(accounts); return; }
      } 
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.length > 0) { setWalletAddress(accounts); return; }
      }
      const provider = await sdk.actions.connectWallet();
      if (provider?.address) setWalletAddress(provider.address);
    } catch (error) {
      console.error(error);
    } finally { setIsConnecting(false); }
  };

  return (
    <main style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0052FF', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {/* Geolocation Output Card */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', opacity: '0.9' }}>Your Live Coordinates</h3>
        
        {locError ? (
          <div style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '0.95rem' }}>⚠️ {locError}</div>
        ) : (
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>📍 {location.country}</div>
            {location.lat && (
              <div style={{ fontSize: '0.85rem', opacity: '0.7' }}>Lat: {location.lat} | Lon: {location.lon}</div>
            )}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '10px 0' }} />
        
        {/* Global Active Users Metrics Dashboard */}
        <h4 style={{ margin: '0 0 5px 0', textAlign: 'left', fontSize: '0.95rem', opacity: '0.8' }}>Active Users Around the Globe:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
          {Object.entries(stats).map(([country, count]) => (
            <div key={country} style={{ display: 'flex', justifyContent: 'between', justifyContent: 'space-between', backgroundColor: country === location.country ? 'rgba(0,214,50,0.2)' : 'transparent', padding: '4px 8px', borderRadius: '6px' }}>
              <span>{country === location.country ? `👉 ${country} (You)` : country}</span>
              <span style={{ fontWeight: 'bold' }}>{count} users</span>
            </div>
          ))}
        </div>
      </div>

      {/* Round BASE Wallet Button Positioned Directly Below Location Info */}
      <div style={{ marginBottom: '25px' }}>
        {walletAddress ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#00D632', color: 'white', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              🟢 {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </div>
            <button onClick={() => setWalletAddress('')} style={{ backgroundColor: '#FF3B30', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>Disconnect</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleConnectWallet} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0052FF', border: '4px solid white', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', fontSize: '1rem', fontWeight: '900', letterSpacing: '1px' }}>
              {isConnecting ? '...' : 'BASE'}
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: '0.9' }}>{isConnecting ? 'Awaiting...' : 'Connect Wallet'}</span>
          </div>
        )}
      </div>
    </main>
  );
}
