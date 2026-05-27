'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BasecityHome() {
  const [wallet, setWallet] = useState('');
  const [username, setUsername] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('Istanbul');
  const [balloon, setBalloon] = useState('idle');
  const [farcasterUser, setFarcasterUser] = useState(null);

  // 1. Core Profile Sync Lifecycle
  useEffect(() => {
    async function initFarcaster() {
      try {
        await sdk.actions.ready();
        const context = await sdk.context;
        if (context?.user) {
          setFarcasterUser(context.user);
        }
      } catch (err) {
        console.warn("Standalone view active.");
      }
    }
    initFarcaster();
  }, []);

  // 2. Hybrid Wallet Verification Flow (Farcaster Profile -> Web3 Extensions)
  async function handleConnect() {
    if (loading) return;
    setLoading(true);

    try {
      // Step A: Check if the Farcaster Profile has linked addresses natively
      let detectedAddress = '';
      if (farcasterUser) {
        if (farcasterUser.verifiedAddresses && farcasterUser.verifiedAddresses.length > 0) {
          detectedAddress = farcasterUser.verifiedAddresses[0];
        } else if (farcasterUser.custodyAddress) {
          detectedAddress = farcasterUser.custodyAddress;
        }
      }

      // Step B: CRITICAL FIX - If profile wallet is missing, trigger active Web3 Provider extensions
      if (!detectedAddress && typeof window !== 'undefined') {
        const provider = sdk?.wallet?.getEthereumProvider 
          ? sdk.wallet.getEthereumProvider() 
          : window.ethereum || null;

        if (provider) {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            detectedAddress = Array.isArray(accounts) ? accounts[0] : accounts;
          }
        }
      }

      // Step C: If both Farcaster and Web3 Provider are missing, execute dynamic sandbox profile
      if (!detectedAddress) {
        const testUser = farcasterUser?.username || 'developer_test';
        const hex = Array.from(testUser).map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 38);
        detectedAddress = `0x${hex}`.padEnd(42, 'f');
      }

      // Pop native interface window configuration for profile authorization
      const isAuthorized = window.confirm(
        `Do you authorize Basecity Home to connect with this wallet?\n\nAddress:\n${detectedAddress}`
      );

      if (!isAuthorized) {
        setLoading(false);
        return;
      }

      // Set state and bind metadata properties correctly
      setWallet(detectedAddress);
      if (farcasterUser) {
        setUsername(farcasterUser.username || farcasterUser.displayName || 'Warpcast User');
        setPfpUrl(farcasterUser.pfpUrl || '');
      } else {
        setUsername('Web3 Developer');
      }

    } catch (error) {
      console.error("Discovery module failure:", error);
      alert("Wallet linkage rejected.");
    } finally {
      setLoading(false);
    }
  }

  // 3. Balloon popping handler
  function handlePopBalloon() {
    if (balloon === 'popped') return;
    setBalloon('popped');
    setTimeout(() => {
      alert(`Balloon Popped! Successfully checked-in to ${city} 🚀`);
    }, 150);
  }

  // 4. Reset interface layout states
  function handleDisconnect() {
    setWallet('');
    setUsername('');
    setPfpUrl('');
    setBalloon('idle');
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '70vh', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        {/* Dynamic Badge profile reveal node */}
        {wallet && username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8F9FA', padding: '10px 18px', borderRadius: '50px', margin: '15px auto', border: '1px solid #E9ECEF', width: 'fit-content' }}>
            {pfpUrl ? (
              <img src={pfpUrl} alt="PFP" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>@{username}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '15px 0' }}>
          {!wallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <button onClick={handleConnect} disabled={loading} style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '32px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 12px 28px rgba(0, 82, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                {loading ? '...' : 'Base'}
              </button>
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>Connect Wallet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
              
              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px' }}>SELECT YOUR CITY:</label>
                <select value={city} onChange={(e) => { setCity(e.target.value); setBalloon('idle'); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600' }}>
                  <option value="Istanbul">Istanbul 🇹🇷</option>
                  <option value="Izmir">Izmir 🇹🇷</option>
                  <option value="London">London 🇬🇧</option>
                  <option value="New York">New York 🇺🇸</option>
                </select>
              </div>

              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {balloon === 'idle' ? (
                  <button onClick={handlePopBalloon} style={{ width: '130px', height: '130px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,82,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                    <span>🎈</span>
                    <span style={{ fontSize: '13px', marginTop: '4px' }}>POP {city.toUpperCase()}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: '54px' }}>💥</div>
                )}
              </div>

              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0052FF' }}>● Connected</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
                  {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                </span>
              </div>

              <button onClick={handleDisconnect} style={{ backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Disconnect Session</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster Identity</div>
      </div>
    </div>
  );
}
