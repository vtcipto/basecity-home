'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk'; 

export default function BasecityHome() {
  const [walletAddress, setWalletAddress] = useState('');
  const [username, setUsername] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Smart Home States
  const [isLightOn, setIsLightOn] = useState(false);
  const [temperature, setTemperature] = useState(22);

  // 1. Automatically Initialize Farcaster SDK on Load
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready(); 
        
        // Context contains logged-in Farcaster user details
        const context = await sdk.context;
        if (context?.user) {
          setUsername(context.user.username || context.user.displayName || 'Farcaster User');
          setPfpUrl(context.user.pfpUrl || '');
        }
      } catch (error) {
        console.warn("Running outside Warpcast context. Simulating developer environment.");
        setUsername('farcaster_dev');
      }
    };
    initFarcaster();
  }, []);

  // 2. Safe and Confirmed Wallet Connection
  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    
    try {
      const provider = sdk.wallet?.ethProvider;
      
      // Local/Browser testing fallback so it never crashes
      if (!provider) {
        const userConfirmation = window.confirm(
          `Do you want to connect your wallet to Basecity Home?\n\nAddress:\n0x71C241657550654321432143214321432103aed`
        );
        
        if (!userConfirmation) {
          setLoading(false);
          return;
        }
        
        setTimeout(() => {
          setWalletAddress('0x71C241657550654321432143214321432103aed');
          setLoading(false);
        }, 600);
        return;
      }

      // Live Warpcast environment execution
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        const address = accounts[0];
        
        const userConfirmation = window.confirm(
          `Do you want to connect your wallet to Basecity Home?\n\nAddress:\n${address}`
        );
        
        if (!userConfirmation) {
          setLoading(false);
          return;
        }

        try {
          const messageText = `Secure login confirmation for Basecity Home.\nWallet: ${address}\nDate: ${new Date().toLocaleDateString()}`;
          await provider.request({
            method: 'personal_sign',
            params: [messageText, address] 
          });
          setWalletAddress(address);
        } catch (signError) {
          alert("Signature rejected. Connection incomplete.");
        }
      }
    } catch (connectError) {
      alert("Wallet connection failed.");
    } finally {
      if (sdk.wallet?.ethProvider) setLoading(false);
    }
  }

  function handleDisconnect() {
    setWalletAddress('');
  }

  return (
    <div style={{ padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '80vh', borderRadius: '24px', padding: '32px 24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2' }}>
        
        {/* App Branding */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '30px', color: '#0052FF', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>Basecity Home</h1>
        </div>

        {/* User Identity Banner */}
        {username && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#F8F9FA', padding: '8px 16px', borderRadius: '50px', margin: '16px auto', border: '1px solid #E9ECEF' }}>
            {pfpUrl ? (
              <img src={pfpUrl} alt="PFP" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#495057' }}>@{username}</span>
          </div>
        )}
        
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '20px 0' }}>
          {!walletAddress ? (
            /* BEFORE CONNECTION: Big Base Authentication Button */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <button onClick={handleConnect} disabled={loading} style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '28px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 12px 28px rgba(0, 82, 255, 0.3)', display: 'flex', alignItems: 'center', justify_content: 'center', opacity: loading ? 0.7 : 1 }}>
                {loading ? '...' : 'Base'}
              </button>
              <p style={{ color: '#0052FF', fontSize: '15px', fontWeight: '700', margin: '0' }}>
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </p>
            </div>
          ) : (
            /* AFTER CONNECTION: Dashboard Controls */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              
              {/* Connection Status & Compressed Address */}
              <div style={{ border: '1px solid #EAEAEA', borderRadius: '16px', padding: '12px 16px', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0052FF' }}>● Connected</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </span>
              </div>

              {/* Control 1: Climate / Temperature */}
              <div style={{ border: '1px solid #EAEAEA', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Climate Control</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>Target Room Temp</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setTemperature(t => t - 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '18px', fontWeight: '800', minWidth: '45px', textAlign: 'center' }}>{temperature}°C</span>
                  <button onClick={() => setTemperature(t => t + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Control 2: Lighting Toggle */}
              <div style={{ border: '1px solid #EAEAEA', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Smart Lights</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>Main Living Area</p>
                </div>
                <button onClick={() => setIsLightOn(!isLightOn)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: isLightOn ? '#0052FF' : '#E9ECEF', color: isLightOn ? '#fff' : '#495057', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {isLightOn ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Disconnect Trigger */}
              <button onClick={handleDisconnect} style={{ marginTop: '10px', backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Disconnect Session
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>
          Secured by Farcaster Frame v2
        </div>
      </div>
    </div>
  );
}
