'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BaseCityHome() {
  const [countryData, setCountryData] = useState({});
  const [countryCodes, setCountryCodes] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Farcaster SDK and Global Data Loader
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("Farcaster load error:", error);
      }
    };
    initFarcaster();

    // Fetch completely comprehensive global directory seamlessly
    fetch('https://jsdelivr.net')
      .then(res => res.json())
      .then(data => {
        const formattedCountries = {};
        const formattedCodes = {};
        data.forEach(item => {
          if (item.countryName) {
            // Extracts all micro-regions and major cities accurately
            formattedCountries[item.countryName] = item.regions ? item.regions.map(r => r.name) : [];
            // Extracts country short code for the dynamic flag system
            formattedCodes[item.countryName] = item.countryShortCode ? item.countryShortCode.toLowerCase() : '';
          }
        });
        setCountryData(formattedCountries);
        setCountryCodes(formattedCodes);
      })
      .catch(err => console.error("Failed to inject global dataset:", err));
  }, []);

  // Approved Wallet Connection Method
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (sdk && sdk.wallet && sdk.wallet.ethProvider) {
        const accounts = await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return;
        }
      } 
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return;
        }
      }
      const provider = await sdk.actions.connectWallet();
      if (provider && provider.address) {
        setWalletAddress(provider.address);
      }
    } catch (error) {
      console.error("Wallet connectivity rejected:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Wallet Feature
  const handleDisconnectWallet = () => {
    setWalletAddress('');
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
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {/* Wallet Management Area */}
      <div style={{ marginBottom: '30px' }}>
        {walletAddress ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: '#00D632',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '24px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              🟢 {formatAddress(walletAddress)}
            </div>
            <button
              onClick={handleDisconnectWallet}
              style={{
                backgroundColor: '#FF3B30',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              Disconnect
            </button>
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
        
        {/* Country Selector Component */}
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
            {Object.keys(countryData).sort().map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* City Selector Component */}
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
            {selectedCountry && countryData[selectedCountry].sort().map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Output Summary and Dynamic Flag (At the bottom of the card) */}
        {selectedCountry && (
          <div style={{ 
            marginTop: '10px', 
            padding: '15px', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {selectedCity && (
              <div style={{ fontSize: '0.95rem' }}>
                📍 Selected: <strong>{selectedCity}, {selectedCountry}</strong>
              </div>
            )}
            
            {/* Dynamic Flag Loader */}
            {countryCodes[selectedCountry] && (
              <img 
                src={`https://flagcdn.com{countryCodes[selectedCountry]}.png`}
                alt={`${selectedCountry} Flag`}
                style={{ 
                  height: '45px', 
                  borderRadius: '4px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                  marginTop: '5px'
                }}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
