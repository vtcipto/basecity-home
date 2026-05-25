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

  // Farcaster SDK & Global Dynamic Directory Initializer
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
        console.log("Farcaster Mini App Ready!");
      } catch (error) {
        console.error("Farcaster load error:", error);
      }
    };
    initFarcaster();

    // Fetch ALL global countries dynamically from cloud without bloat
    fetch('https://githubusercontent.com')
      .then(res => res.json())
      .then(data => {
        if (data) setCountries(data);
      })
      .catch(err => console.error("Failed to load world directory:", err));
  }, []);

  // Fetch ALL cities dynamic matching for the selected country ISO
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }

    const countryObj = countries.find(c => c.name === selectedCountry);
    if (!countryObj) return;

    fetch(`https://githubusercontent.com`)
      .then(res => res.json())
      .then(allCities => {
        // High performance filter for accurate city association
        const filteredCities = allCities.filter(city => city.country_code === countryObj.iso2);
        setCities(filteredCities);
      })
      .catch(err => console.error("Failed to parse global cities:", err));
  }, [selectedCountry, countries]);

  // Approved Wallet Connection Method
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) setWalletAddress(accounts[0]);
      } else {
        const provider = await sdk.actions.connectWallet();
        if (provider && provider.address) setWalletAddress(provider.address);
      }
    } catch (error) {
      console.error("Wallet approval rejected:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}`;
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
      <h1 style={{ fontSize: '2.5rem', marginBottom: '25px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {/* Round Base Style Wallet Interface (Moved Upwards) */}
      <div style={{ marginBottom: '25px' }}>
        {walletAddress ? (
          <div style={{
            backgroundColor: '#00D632',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '24px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            🟢 {formatAddress(walletAddress)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              style={{ 
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#0052FF',
                border: '4px solid white',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* Symbolic Base Logo representation */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '6px solid white',
                borderRightColor: 'transparent',
                transform: 'rotate(-45deg)',
                display: isConnecting ? 'none' : 'block'
              }} />
              {isConnecting && <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>...</span>}
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: '0.9' }}>
              {isConnecting ? 'Awaiting...' : 'Connect Wallet'}
            </span>
          </div>
        )}
      </div>

      {/* Main Layout Card */}
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
        
        {/* Country Selector */}
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Countries</label>
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
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Select a Country...</option>
            {countries.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Cities</label>
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedCountry || cities.length === 0}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedCountry && cities.length > 0 ? 'white' : 'rgba(255, 255, 255, 0.2)',
              color: selectedCountry && cities.length > 0 ? '#333' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '1rem',
              outline: 'none',
              cursor: selectedCountry && cities.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <option value="">
              {!selectedCountry 
                ? 'Select a Country First' 
                : cities.length === 0 
                ? 'Loading Cities...' 
                : 'Select a City...'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>

        {/* Selection Summary */}
        {selectedCountry && selectedCity && (
          <div style={{ 
            marginTop: '10px', 
            padding: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            fontSize: '0.95rem' 
          }}>
            📍 Selected: <strong>{selectedCity}, {selectedCountry}</strong>
          </div>
        )}
      </div>
    </main>
  );
}
