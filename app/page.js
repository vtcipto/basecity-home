'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export default function BasecityHome() {
  const [wallet, setWallet] = useState('');
  const [username, setUsername] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [light, setLight] = useState(false);
  const [temp, setTemp] = useState(22);

  // 1. Multi-Platform SDK Initializer (Phone & Laptop)
  useEffect(() => {
    async function initFarcaster() {
      try {
        if (typeof window !== 'undefined' && sdk?.actions?.ready) {
          // Tell Warpcast client that the mini-app is loaded
          await sdk.actions.ready();
          
          const ctx = await sdk.context;
          if (ctx?.user) {
            setUsername(ctx.user.username || ctx.user.displayName || 'User');
            setPfpUrl(ctx.user.pfpUrl || '');
          }
        }
      } catch (err) {
        console.warn("Standalone browser or local environment active.");
        setUsername('developer_test');
      }
    }
    initFarcaster();
  }, []);

  // 2. Dual-Platform Wallet Connection with Popup Confirmation
  async function handleConnect() {
    if (loading) return;
    setLoading(true);

    try {
      // Fetch the official Farcaster EIP-1193 provider (Works on Web & Mobile)
      const provider = sdk?.wallet?.getEthereumProvider 
        ? sdk.wallet.getEthereumProvider() 
        : null;

      // Fallback: If opened via standalone browser outside of Warpcast
      if (!provider) {
        const mockAddr = '0x71C241657550654321432143214321432103aed';
        const ok = window.confirm(
          `Connect test wallet to Basecity Home?\n\nAddr: ${mockAddr}`
        );
        if (!ok) {
          setLoading(false);
          return;
        }
        setTimeout(() => {
          setWallet(mockAddr);
          setLoading(false);
        }, 500);
        return;
      }

      // Trigger standard account request popup inside Warpcast client
      const accts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accts && accts.length > 0) {
        const addr = Array.isArray(accts) ? accts[0] : accts;
        
        // Native popup confirmation for both phone & laptop screen
        const ok = window.confirm(
          `Do you authorize Basecity Home to connect?\n\nWallet: ${addr}`
        );
        if (!ok) {
          setLoading(false);
          return;
        }

        try {
          // Trigger the official cryptographic signature popup (personal_sign)
          const msg = `Secure connection to Basecity Home.\nWallet: ${addr}\nTimestamp: ${Date.now()}`;
          await provider.request({
            method: 'personal_sign',
            params: [msg, addr]
          });
          
          setWallet(addr);
        } catch (sErr) {
          console.error("Signature request denied:", sErr);
          alert("Signature rejected by user.");
        }
      }
    } catch (cErr) {
      console.error("Farcaster provider error:", cErr);
      alert("Wallet connection failed. Open inside Warpcast (Web/Mobile).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6',
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#ffffff', width: '100%', maxWidth: '420px',
        minHeight: '75vh', borderRadius: '24px', padding: '40px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        {username && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: '#F8F9FA', padding: '10px 18px', borderRadius: '50px',
            margin: '20px auto', border: '1px solid #E9ECEF', width: 'fit-content'
          }}>
            {pfpUrl ? (
              <img src={pfpUrl} alt="PFP" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            ) : (
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: '#0052FF', color: '#fff', fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>{username.charAt(0).toUpperCase()}</div>
            )}
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>@{username}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '20px 0' }}>
          {!wallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={handleConnect}
                disabled={loading}
                style={{
                  width: '150px', height: '150px', borderRadius: '50%',
                  backgroundColor: '#0052FF', color: '#ffffff', border: 'none',
                  fontSize: '32px', fontWeight: '900', cursor: 'pointer',
                  boxShadow: '0 12px 28px rgba(0,82,255,0.3)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', padding: '0'
                }}
              >
                {loading ? '...' : 'Base'}
              </button>
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>
                {loading ? 'Awaiting Approval...' : 'Connect Wallet'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div style={{
                border: '1px solid #EAEAEA', borderRadius: '16px', padding: '12px 16px',
                backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0052FF' }}>● Base Connected</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
                  {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                </span>
              </div>

              <div style={{
                border: '1px solid #EAEAEA', borderRadius: '16px', padding: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '15px' }}>Climate</h3>
                  <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>Target Temp</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setTemp(t => t - 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff' }}>-</button>
                  <span style={{ fontSize: '18px', fontWeight: '800' }}>{temp}°C</span>
                  <button onClick={() => setTemp(t => t + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff' }}>+</button>
                </div>
              </div>

              <div style={{
                border: '1px solid #EAEAEA', borderRadius: '16px', padding: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '15px' }}>Lights</h3>
                  <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>Living Area</p>
                </div>
                <button onClick={() => setLight(!light)} style={{
                  padding: '8px 16px', borderRadius: '20px', border: 'none',
                  backgroundColor: light ? '#0052FF' : '#E9ECEF', color: light ? '#fff' : '#495057', fontWeight: '700'
                }}>{light ? 'ON' : 'OFF'}</button>
              </div>

              <button onClick={() => setWallet('')} style={{
                marginTop: '10px', backgroundColor: 'transparent', color: '#FF3B30',
                border: '1px solid #FF3B30', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold'
              }}>Disconnect Wallet</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster Frame v2</div>
      </div>
    </div>
  );
}
