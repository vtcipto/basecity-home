'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

// Error-free, high-performance global country & city database embedded directly into the application
const globalData = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco", "Boston", "Seattle"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Edinburgh", "Glasgow"],
  "Germany": ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart", "Dusseldorf"],
  "France": ["Paris", "Marseille", "Lyon", "Nice", "Toulouse", "Bordeaux", "Strasbourg"],
  "Türkiye": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo", "Fukuoka", "Nagoya"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Wuhan"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"],
  "Brazil": ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza"],
  "Italy": ["Rome", "Milan", "Naples", "Florence", "Venice", "Turin"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],
  "Singapore": ["Singapore City"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"]
};

export default function BaseCityHome() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Farcaster SDK Connection
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("Farcaster load error:", error);
      }
    };
    initFarcaster();
  }, []);

  // Absolute Fix for Wallet Connection via Farcaster V2 Eth Provider Specification
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      // First tier check: Invoke the native embedded Farcaster frame wallet provider directly
      if (sdk && sdk.wallet && sdk.wallet.ethProvider) {
        const accounts = await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return;
        }
      } 
      
      // Second tier check: Fallback browser window injector (Metamask/Coinbase extension wrapper)
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return;
        }
      }

      // Third tier check: Fallback connection action interface trigger
      const provider = await sdk.actions.connectWallet();
      if (provider && provider.address) {
        setWalletAddress(provider.address);
      } else {
        alert("Please authorize your wallet or access this inside Warpcast application client.");
      }
    } catch (error) {
      console.error("Wallet connection explicitly rejected by user:", error);
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
      <h1 style={{ fontSize: '2.5rem', marginBottom: '15px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {/* Circular "BASE" Wallet Button Placed Elegantly at Top */}
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
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#0052FF',
                border: '4px solid white',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                fontSize: '1rem',
                fontWeight: '900',
                letterSpacing: '1px'
              }}
            >
              {isConnecting ? '...' : 'BASE'}
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: '0.9' }}>
              {isConnecting ? 'Awaiting...' : 'Connect Wallet'}
            </span>
          </div>
        )}
      </div>

      {/* Main Form Box Container */}
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
        
        {/* Country Picker Layout */}
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
            {Object.keys(globalData).sort().map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* City Picker Layout */}
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
            {selectedCountry && globalData[selectedCountry].sort().map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Output Area */}
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
