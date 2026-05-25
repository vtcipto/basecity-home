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

  // Farcaster SDK Initializer
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
        console.log("Farcaster Mini App Ready!");
      } catch (error) {
        console.error("Farcaster failed to load:", error);
      }
    };
    initFarcaster();

    // Fetch all global countries dynamically (Zero code bloat)
    fetch('https://countriesnow.space')
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.data) {
          setCountries(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch countries:", err));
  }, []);

  // Fetch cities whenever a country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }
    const countryObj = countries.find(c => c.country === selectedCountry);
    if (countryObj && countryObj.cities) {
      setCities(countryObj.cities);
    } else {
      setCities([]);
    }
  }, [selectedCountry, countries]);

  // Approved Wallet Connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const provider = await sdk.actions.connectWallet();
      if (provider && provider.address) {
        setWalletAddress(provider.address);
      } else if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Wallet connection rejected:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
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
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {/* Approved Wallet Button */}
      <div style={{ marginBottom: '30px' }}>
        {walletAddress ? (
          <div style={{
            backgroundColor: '#00D632',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '24px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            🟢 Connected: {formatAddress(walletAddress)}
          </div>
        ) : (
          <button 
            onClick={handleConnectWallet}
            disabled={isConnecting}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#fff', 
              color: '#0052FF', 
              border: 'none', 
              borderRadius: '24px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {isConnecting ? 'Awaiting Approval...' : 'Connect Wallet'}
          </button>
        )}
      </div>

      {/* Form Container */}
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
        
        {/* Country Select */}
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
              outline: 'none'
            }}
          >
            <option value="">Select a Country...</option>
            {countries.map((c) => (
              <option key={c.country} value={c.country}>{c.country}</option>
            ))}
          </select>
        </div>

        {/* City Select */}
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Cities</label>
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedCountry}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedCountry ? 'white' : 'rgba(255, 255, 255, 0.2)',
              color: selectedCountry ? '#333' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '1rem',
              outline: 'none',
              cursor: selectedCountry ? 'pointer' : 'not-allowed'
            }}
          >
            <option value="">{selectedCountry ? 'Select a City...' : 'Select a Country First'}</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
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

      {/* Action Button */}
      <button 
        onClick={() => sdk.actions.openUrl('https://basescan.org')}
        style={{ 
          marginTop: '30px',
          padding: '12px 24px', 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          color: 'white', 
          border: '1px solid rgba(255,255,255,0.4)', 
          borderRadius: '24px', 
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.9rem'
        }}
      >
        View Transaction on Basescan
      </button>
    </main>
  );
}
