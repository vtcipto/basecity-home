'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export default function BasecityHome() {
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('Istanbul');
  const [balloonState, setBalloonState] = useState('idle'); // idle, popped
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        if (typeof window !== 'undefined' && sdk?.actions?.ready) {
          await sdk.actions.ready();
        }
      } catch (err) { console.warn("Stand-alone mode."); }
    }
    init();
  }, []);

  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    try {
      let p = sdk?.wallet?.getEthereumProvider ? sdk.wallet.getEthereumProvider() : null;
      if (!p && typeof window !== 'undefined') p = window.ethereum || null;
      if (!p) { alert("No Web3 wallet!"); setLoading(false); return; }
      
      const accts = await p.request({ method: 'eth_requestAccounts' });
      if (accts && accts.length > 0) {
        const addr = Array.isArray(accts) ? accts[0] : accts;
        setWallet(addr);
        setProvider(p);
      }
    } catch (cErr) { console.error(cErr); } finally { setLoading(false); }
  }

  // Real Base Chain Check-in Transaction Trigger
  async function handlePopAndTx() {
    if (!provider || balloonState === 'popped') return;
    setBalloonState('popped');

    try {
      // Base Mainnet (0x2105) or Base Sepolia (0x14a34) chain check
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // Base Sepolia Testnet for safety
      });

      // Triggers a native transaction payload to user's wallet
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet,
          to: wallet, // Sends 0 ETH to self as a secure Onchain Check-in log
          value: '0x0',
          data: '0x' + Array.from(`Basecity:${city}`).map(c => c.charCodeAt(0).toString(16)).join('')
        }],
      });

      alert(`Baloon Popped & Checked-in on Base! 🚀\nTx Hash: ${txHash.substring(0, 15)}...`);
    } catch (txErr) {
      console.error(txErr);
      alert("Transaction rejected or failed. Try popping again.");
      setBalloonState('idle');
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '70vh', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', margin: '15px 0' }}>
          {!wallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <button onClick={handleConnect} disabled={loading} style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '32px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 12px 28px rgba(0,82,255,0.3)' }}>
                {loading ? '...' : 'Base'}
              </button>
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>Connect Wallet to Start</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
              
              {/* City Selection Menus */}
              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px' }}>SELECT YOUR CITY:</label>
                <select value={city} onChange={(e) => { setCity(e.target.value); setBalloonState('idle'); }} style={{ wWidth: '100%', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600' }}>
                  <option value="Istanbul">Istanbul 🇹🇷</option>
                  <option value="Izmir">Izmir 🇹🇷</option>
                  <option value="London">London 🇬🇧</option>
                  <option value="New York">New York 🇺🇸</option>
                </select>
              </div>

              {/* Interactive Balloon Playground */}
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                {balloonState === 'idle' ? (
                  <button onClick={handlePopAndTx} style={{ width: '130px', height: '130px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,82,255,0.4)', transition: 'transform 0.1s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>🎈</span>
                    <span>POP {city.toUpperCase()}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: '48px', animation: 'ping 0.5s ease-out' }}>💥</div>
                )}
              </div>

              {/* Connected Wallet Info */}
              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0052FF' }}>● Connected</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}</span>
              </div>

              <button onClick={() => { setWallet(''); setBalloonState('idle'); }} style={{ backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Disconnect</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster & Base</div>
      </div>
    </div>
  );
}
