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
  const [ctx, setCtx] = useState(null);
  const [city, setCity] = useState('Istanbul');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        if (typeof window !== 'undefined' && sdk?.actions?.ready) {
          await sdk.actions.ready();
          const fCtx = await sdk.context;
          if (fCtx) setCtx(fCtx);
        }
      } catch (err) {
        console.warn("Stand-alone mode.");
      }
    }
    init();
  }, []);

  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    try {
      let provider = sdk?.wallet?.getEthereumProvider 
        ? sdk.wallet.getEthereumProvider() : null;

      if (!provider && typeof window !== 'undefined') {
        provider = window.ethereum || null;
      }
      if (!provider) {
        alert("No Web3 wallet!");
        setLoading(false);
        return;
      }

      const accts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accts && accts.length > 0) {
        const addr = Array.isArray(accts) ? accts[0] : accts;
        const ok = window.confirm(`Connect?\n\n${addr}`);
        if (!ok) { setLoading(false); return; }

        try {
          const msg = `Login.\nWallet: ${addr}`;
          await provider.request({
            method: 'personal_sign',
            params: [msg, addr]
          });
          setWallet(addr);
          if (ctx?.user) {
            setUsername(ctx.user.username || 'User');
            setPfpUrl(ctx.user.pfpUrl || '');
          } else {
            setUsername('Web3 User');
          }
        } catch (sErr) {
          alert("Rejected");
        }
      }
    } catch (cErr) {
      console.error(cErr);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      padding: '20px', fontFamily: 'sans-serif',
      backgroundColor: '#f4f5f6', minHeight: '100vh',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#ffffff', width: '100%', maxWidth: '420px',
        minHeight: '70vh', borderRadius: '24px', padding: '30px 20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
        border: '1px solid #eef0f2'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        {wallet && username && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: '#F8F9FA', padding: '8px 16px', borderRadius: '50px',
            margin: '15px auto', border: '1px solid #E9ECEF', width: 'fit-content'
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

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '15px 0' }}>
          {!wallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <button onClick={handleConnect} disabled={loading} style={{
                width: '140px', height: '140px', borderRadius: '50%',
                backgroundColor: '#0052FF', color: '#ffffff', border: 'none',
                fontSize: '32px', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 12px 28px rgba(0,82,255,0.3)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '0'
              }}>{loading ? '...' : 'Base'}</button>
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div style={{
                border: '1px solid #EAEAEA', borderRadius: '12px', padding: '10px 14px',
                backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0052FF' }}>● Connected</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
                  {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                </span>
              </div>

              <div style={{ border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>City Check-in</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <select value={city} onChange={(e) => setCity(e.target.value)} disabled={checked} style={{ flexGrow: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '13px' }}>
                    <option value="Istanbul">Istanbul 🇹🇷</option>
                    <option value="Izmir">Izmir 🇹🇷</option>
                    <option value="London">London 🇬🇧</option>
                    <option value="New York">New York 🇺🇸</option>
                  </select>
                  <button onClick={() => setChecked(true)} disabled={checked} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', backgroundColor: checked ? '#00D395' : '#0052FF', color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                    {checked ? 'In ✓' : 'Check'}
                  </button>
                </div>
                {checked && <p style={{ margin: '0', fontSize: '11px', color: '#00D395', fontWeight: '600' }}>Active: Basecity @ {city}</p>}
              </div>

              <div style={{ border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '14px' }}>Climate</h3>
                  <p style={{ margin: '0', fontSize: '11px', color: '#888' }}>Target</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => setTemp(t => t - 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff' }}>-</button>
                  <span style={{ fontSize: '16px', fontWeight: '800' }}>{temp}°C</span>
                  <button onClick={() => setTemp(t => t + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff' }}>+</button>
                </div>
              </div>

              <div style={{ border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '14px' }}>Lights</h3>
                  <p style={{ margin: '0', fontSize: '11px', color: '#888' }}>Living</p>
                </div>
                <button onClick={() => setLight(!light)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', backgroundColor: light ? '#0052FF' : '#E9ECEF', color: light ? '#fff' : '#495057', fontWeight: '700', fontSize: '13px' }}>
                  {light ? 'ON' : 'OFF'}
                </button>
              </div>

              <button onClick={() => { setWallet(''); setUsername(''); setChecked(false); }} style={{ marginTop: '5px', backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>Disconnect</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster</div>
      </div>
    </div>
  );
}
