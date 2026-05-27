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

  // 1. Fetch Farcaster Identity and Cüzdan Details Instantly on App Load
  useEffect(() => {
    async function initFarcaster() {
      try {
        await sdk.actions.ready();
        const context = await sdk.context;
        
        if (context?.user) {
          setFarcasterUser(context.user);
        }
      } catch (err) {
        console.warn("Standalone browser or developer mode active.");
      }
    }
    initFarcaster();
  }, []);

  // 2. Read the Real Logged-in Farcaster User's Wallet Directly with Approval
  async function handleConnect() {
    if (loading) return;
    setLoading(true);

    try {
      // If we are inside Warpcast and have a real logged-in user
      if (farcasterUser) {
        // Farcaster users have a Custody Address and optionally Verified Ethereum Addresses
        const realUserWallet = 
          farcasterUser.verifiedAddresses?.[0] || 
          farcasterUser.custodyAddress;

        if (!realUserWallet) {
          alert("Could not detect any wallet linked to this Farcaster account.");
          setLoading(false);
          return;
        }

        // Show a native confirmation dialog with their real address
        const isAuthorized = window.confirm(
          `Do you authorize Basecity Home to connect with your Farcaster wallet?\n\nAddress:\n${realUserWallet}`
        );

        if (!isAuthorized) {
          setLoading(false);
          return;
        }

        // Successfully lock states after user verification
        setWallet(realUserWallet);
        setUsername(farcasterUser.username || farcasterUser.displayName || 'Warpcast User');
        setPfpUrl(farcasterUser.pfpUrl || '');
        setLoading(false);
        return;
      }

      // FALLBACK: Standalone browser developer simulation (when testing outside Warpcast)
      const mockAddr = '0x71C241657550654321432143214321432103aed';
      const isMockAuthorized = window.confirm(
        `[Dev Mode] Connect developer wallet to Basecity Home?\n\nAddress:\n${mockAddr}`
      );

      if (!isMockAuthorized) {
        setLoading(false);
        return;
      }

      setTimeout(() => {
        setWallet(mockAddr);
        setUsername('developer_test');
        setLoading(false);
      }, 400);

    } catch (error) {
      console.error("Wallet discovery error:", error);
      alert("An error occurred while accessing your Farcaster profile.");
    } finally {
      setLoading(false);
    }
  }

  // 3. Popping Mechanical Trigger
  function handlePopBalloon() {
    if (balloon === 'popped') return;
    setBalloon('popped');
    
    setTimeout(() => {
      alert(`Balloon Popped! Successfully checked-in to ${city} 🚀`);
    }, 150);
  }

  // 4. Session Termination Trigger
  function handleDisconnect() {
    setWallet('');
    setUsername('');
    setPfpUrl('');
    setBalloon('idle');
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '70vh', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2' }}>
        
        {/* Title branding */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        {/* Identity Token - Protected Layout (Shown strictly after connection) */}
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

        {/* Main Operational Container */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '15px 0' }}>
          {!wallet ? (
            /* BEFORE CONNECTION: Large Core Engagement Node */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <button 
                onClick={handleConnect} 
                disabled={loading}
                style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '32px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 12px 28px rgba(0, 82, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}
              >
                {loading ? '...' : 'Base'}
              </button>
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>Connect Farcaster Wallet</p>
            </div>
          ) : (
            /* AFTER CONNECTION: Dashboard Panel Content */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
              
              {/* City Selection Node */}
              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px' }}>SELECT YOUR CITY:</label>
                <select value={city} onChange={(e) => { setCity(e.target.value); setBalloon('idle'); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600' }}>
                  <option value="Istanbul">Istanbul 🇹🇷</option>
                  <option value="Izmir">Izmir 🇹🇷</option>
                  <option value="London">London 🇬🇧</option>
                  <option value="New York">New York 🇺🇸</option>
                </select>
              </div>

              {/* Balloon Playground Module */}
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {balloon === 'idle' ? (
                  <button 
                    onClick={handlePopBalloon} 
                    style={{ width: '130px', height: '130px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,82,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0' }}
                  >
                    <span>🎈</span>
                    <span style={{ fontSize: '13px', marginTop: '4px' }}>POP {city.toUpperCase()}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: '54px' }}>💥</div>
                )}
              </div>

              {/* Connected Credentials Indicator */}
              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0052FF' }}>● Connected</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
                  {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                </span>
              </div>

              {/* Reset Session Action */}
              <button onClick={handleDisconnect} style={{ backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Disconnect Session</button>
            </div>
          )}
        </div>

        {/* Brand Signoff footer */}
        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster Identity System</div>
      </div>
    </div>
  );
}
