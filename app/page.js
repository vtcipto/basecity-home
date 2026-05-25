'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BaseCityHome() {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const initFarcaster = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }
    };
    initFarcaster();

    // Fetch all global countries securely (Zero code size bloat)
    fetch('https://githubusercontent.com')
      .then(res => res.json())
      .then(data => { if (data) setCountries(data.map(c => c.country)); })
      .catch(err => console.error(err));
  }, []);

  // Fetch ALL actual world cities for the selected country dynamically
  useEffect(() => {
    if (!selectedCountry) { setCities([]); return; }
    
    // Non-blocking open source registry proxy
    fetch(`https://countriesnow.space`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: selectedCountry })
    })
      .then(res => res.json())
      .then(result => {
        if (result && !result.error && result.data) {
          setCities(result.data);
        } else {
          // Fallback static high-density major hubs if API rate limits
          setCities(["Capital City", "Major Hub 1", "Major Hub 2", "Metropolitan Area"]);
        }
      })
      .catch(() => setCities(["Main City Hub", "Central District", "Downtown Area"]));
  }, [selectedCountry]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (sdk?.wallet?.ethProvider) {
        const accounts = await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' });
        if (accounts?.length > 0) { setWalletAddress(accounts[0]); return; }
      } 
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.length > 0) { setWalletAddress(accounts[0]); return; }
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
      
      {/* Form Card UI */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' }}>
        
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Countries</label>
          <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setSelectedCity(''); }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'white', color: '#333', fontSize: '1rem', outline: 'none' }}>
            <option value="">Select a Country...</option>
            {countries.sort().map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Cities</label>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedCountry} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: selectedCountry ? 'white' : 'rgba(255, 255, 255, 0.2)', color: selectedCountry ? '#333' : 'rgba(255, 255, 255, 0.5)', fontSize: '1rem', outline: 'none' }}>
            <option value="">{selectedCountry ? 'Select a City...' : 'Select a Country First'}</option>
            {cities.sort().map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
      </div>

      {/* Round BASE Wallet Button Positioned Directly Below Cities Box */}
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

      {/* Flag Display Output */}
      {selectedCountry && (
        <div style={{ marginTop: '10px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignTemplate: 'center', alignItems: 'center', gap: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          {selectedCity && <div style={{ fontSize: '1rem' }}>📍 Selected: <strong>{selectedCity}, {selectedCountry}</strong></div>}
          <img src={`https://openflags.net{selectedCountry.toLowerCase().replace(/ /g, '-')}.png`} onError={(e)=>{e.target.style.display='none';}} alt="" style={{ height: '50px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} />
        </div>
      )}
    </main>
  );
}
