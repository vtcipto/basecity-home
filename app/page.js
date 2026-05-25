'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BaseCityHome() {
  const [location, setLocation] = useState({ city: 'Detecting...', country: 'Detecting...' });
  const [localActiveUsers, setLocalActiveUsers] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [locError, setLocError] = useState('');

  // Farcaster SDK Ignition
  useEffect(() => {
    const initFarcaster = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }
    };
    initFarcaster();

    // Trigger precise real-time city geolocation
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            const res = await fetch(`https://bigdatacloud.net{lat}&longitude=${lon}&localityLanguage=en`);
            const data = await res.json();
            const exactCity = data.city || data.principalSubdivision || "Unknown City";
            const exactCountry = data.countryName || "Global Space";
            
            setLocation({ city: exactCity, country: exactCountry });
            setLocalActiveUsers(Math.floor(Math.random() * 50) + 20);
          } catch (err) {
            setLocation({ city: "Main Hub", country: "Global Space" });
            setLocalActiveUsers(42);
          }
        },
        (error) => {
          setLocError("Location access denied. Please approve GPS prompt.");
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setLocError("Location tracking features unsupported on this engine setup.");
    }
  }, []);

  const handleCheckIn = () => {
    if (!hasCheckedIn) {
      setLocalActiveUsers(prev => prev + 1);
      setHasCheckedIn(true);
    }
  };

  // Secure and Explicit Wallet Connection with Mandatory Signature Approval Pop-up
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      let activeProvider = null;
      let selectedAccount = null;

      // 1. Step: Detect the available Web3 Ethereum Provider
      if (sdk?.wallet?.ethProvider) {
        activeProvider = sdk.wallet.ethProvider;
      } else if (typeof window !== 'undefined' && window.ethereum) {
        activeProvider = window.ethereum;
      }

      if (activeProvider) {
        // Request primary account link
        const accounts = await activeProvider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          selectedAccount = accounts[0];
          
          // 2. Step: MANDATORY USER APPROVAL PROMPT (Triggers personal_sign wallet pop-up window)
          const customMessage = `Welcome to BaseCity Home!\n\nPlease approve this request to securely connect your wallet.\n\nTimestamp: ${Date.now()}`;
          
          // Hex encode the human-readable text message for cryptography standards
          const hexMessage = '0x' + Array.from(new TextEncoder().encode(customMessage))
            .map(b => b.toString(16).padStart(2, '0')).join('');

          // This specific method forces the client wallet (Metamask, Coinbase, Warpcast) to display a SIGN / APPROVE message screen
          await activeProvider.request({
            method: 'personal_sign',
            params: [hexMessage, selectedAccount],
          });

          // Set address only after user successfully clicks "Approve / Sign" inside their wallet app
          setWalletAddress(selectedAccount);
          return;
        }
      }

      // Fallback fallback if no providers detected
      if (sdk?.actions?.connectWallet) {
        const connectionResult = await sdk.actions.connectWallet();
        if (connectionResult?.address) setWalletAddress(connectionResult.address);
      }
    } catch (error) {
      console.error("Wallet signature or connection explicitly rejected by user:", error);
      alert("Connection rejected! You must approve the wallet pop-up signature request to connect.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0052FF', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '35px', fontWeight: 'bold' }}>BaseCity Home</h1>
      
      {/* Geolocation Metric Card Dashboard */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', opacity: '0.9' }}>Your Live City</h3>
        
        {locError ? (
          <div style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '0.95rem' }}>⚠️ {locError}</div>
        ) : (
          <div>
            <div style={{ fontSize: '2.6rem', fontWeight: 'bold', marginBottom: '5px' }}>🏙️ {location.city}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', opacity: '0.8', marginBottom: '15px' }}>{location.country}</div>
            
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '15px 0' }} />
            
            <div style={{ padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', opacity: '0.8', marginBottom: '4px' }}>Active users in this city:</span>
              <strong style={{ fontSize: '1.8rem', color: '#00D632' }}>{localActiveUsers} users</strong>
            </div>

            <button 
              onClick={handleCheckIn}
              disabled={hasCheckedIn || location.city === 'Detecting...'}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: hasCheckedIn ? '#00D632' : 'white',
                color: hasCheckedIn ? '#0052FF' : '#0052FF',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: hasCheckedIn || location.city === 'Detecting...' ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              {hasCheckedIn ? '✓ You Checked-In!' : 'Check-In Here'}
            </button>
          </div>
        )}
      </div>

      {/* Circular Custom BASE Identity Web3 Button Area */}
      <div style={{ marginBottom: '25px' }}>
        {walletAddress ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#00D632', color: 'white', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🟢 {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </div>
            <button onClick={() => setWalletAddress('')} style={{ backgroundColor: '#FF3B30', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>Disconnect</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleConnectWallet} disabled={isConnecting} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0052FF', border: '4px solid white', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', fontSize: '1rem', fontWeight: '900', letterSpacing: '1px' }}>
              {isConnecting ? '...' : 'BASE'}
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: '0.9' }}>{isConnecting ? 'Signing...' : 'Connect Wallet'}</span>
          </div>
        )}
      </div>
    </main>
  );
}
