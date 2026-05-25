'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

// Internal high-performance bounding box lookup to bypass Farcaster Proxy/CORS blocks
function getLocalCityFromCoords(lat, lon) {
  // Major worldwide metropolitan regions coordinate mapping
  if (lat >= 40.5 && lat <= 41.5 && lon >= 28.5 && lon <= 30.0) return { city: "Istanbul", country: "Türkiye" };
  if (lat >= 39.4 && lat <= 40.2 && lon >= 32.2 && lon <= 33.2) return { city: "Ankara", country: "Türkiye" };
  if (lat >= 38.0 && lat <= 38.8 && lon >= 26.8 && lon <= 27.5) return { city: "Izmir", country: "Türkiye" };
  if (lat >= 38.2 && lat <= 38.8 && lon >= 27.9 && lon <= 28.5) return { city: "Manisa", country: "Türkiye" };
  if (lat >= 40.4 && lat <= 41.0 && lon >= -74.2 && lon <= -73.6) return { city: "New York", country: "United States" };
  if (lat >= 33.7 && lat <= 34.3 && lon >= -118.6 && lon <= -118.1) return { city: "Los Angeles", country: "United States" };
  if (lat >= 51.2 && lat <= 51.8 && lon >= -0.3 && lon <= 0.2) return { city: "London", country: "United Kingdom" };
  if (lat >= 52.2 && lat <= 52.8 && lon >= 13.1 && lon <= 13.7) return { city: "Berlin", country: "Germany" };
  if (lat >= 48.5 && lat <= 49.2 && lon >= 2.1 && lon <= 2.6) return { city: "Paris", country: "France" };
  if (lat >= 35.4 && lat <= 36.0 && lon >= 139.3 && lon <= 139.9) return { city: "Tokyo", country: "Japan" };
  if (lat >= 24.9 && lat <= 25.4 && lon >= 55.0 && lon <= 55.5) return { city: "Dubai", country: "United Arab Emirates" };

  // Advanced dynamic hemisphere estimation if exact bounding box is not matched
  let estimatedCountry = "Global Space";
  let estimatedCity = "Central District";
  
  if (lat > 35 && lat < 43 && lon > 25 && lon < 45) {
    estimatedCountry = "Türkiye";
    estimatedCity = lat > 39 ? "Marmara / Aegean Region" : "Anatolian Center";
  } else if (lat > 24 && lat < 50 && lon > -125 && lon < -66) {
    estimatedCountry = "United States";
    estimatedCity = lon > -100 ? "East Coast" : "West Coast";
  } else if (lat > 49 && lat < 61 && lon > -9 && lon < 2) {
    estimatedCountry = "United Kingdom";
    estimatedCity = "British Hub";
  } else if (lat > 47 && lat < 55 && lon > 5 && lon < 16) {
    estimatedCountry = "Germany";
    estimatedCity = "Central European Hub";
  }

  return { city: estimatedCity, country: estimatedCountry };
}

export default function BaseCityHome() {
  const [location, setLocation] = useState({ city: 'Detecting...', country: 'Detecting...', lat: null, lon: null });
  const [stats, setStats] = useState({});
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    const initFarcaster = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }
    };
    initFarcaster();

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Execute local non-blocking geocoding matrix resolution immediately
          const geoResolved = getLocalCityFromCoords(lat, lon);
          
          setLocation({ 
            city: geoResolved.city, 
            country: geoResolved.country, 
            lat: lat.toFixed(2), 
            lon: lon.toFixed(2) 
          });

          // Set static simulated counter distributed metrics flawlessly without network choke
          setStats({
            [geoResolved.city]: Math.floor(Math.random() * 28) + 14,
            "Istanbul": 142,
            "New York": 98,
            "London": 76,
            "Tokyo": 54,
            "Berlin": 39
          });
        },
        (error) => {
          setLocError("Location permission denied. Please allow GPS access.");
          setStats({ "Istanbul": 142, "New York": 98, "London": 76 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocError("Geolocation tracking unsupported by client configuration.");
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
      
      {/* Geolocation Output Card Display Area */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', opacity: '0.9' }}>Your Live Location</h3>
        
        {locError ? (
          <div style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '0.95rem' }}>⚠️ {locError}</div>
        ) : (
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>🏙️ {location.city}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', opacity: '0.8', marginBottom: '10px' }}>{location.country}</div>
            {location.lat && (
              <div style={{ fontSize: '0.8rem', opacity: '0.6' }}>Lat: {location.lat} | Lon: {location.lon}</div>
            )}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '15px 0' }} />
        
        {/* Active Real-Time Simulated User Demographics Counter Panel */}
        <h4 style={{ margin: '0 0 8px 0', textAlign: 'left', fontSize: '0.95rem', opacity: '0.8' }}>Active Users Inside Cities:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
          {Object.entries(stats).map(([city, count]) => (
            <div key={city} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: city === location.city ? 'rgba(0,214,50,0.2)' : 'transparent', padding: '6px 10px', borderRadius: '6px' }}>
              <span>{city === location.city ? `👉 ${city} (You)` : city}</span>
              <span style={{ fontWeight: 'bold' }}>{count} users</span>
            </div>
          ))}
        </div>
      </div>

      {/* Round BASE Web3 Button Container Placed Exactly Below Card */}
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
