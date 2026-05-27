'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export default function BasecityHome() {
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('Istanbul');
  const [balloon, setBalloon] = useState('idle');

  useEffect(() => {
    async function init() {
      try {
        if (typeof window !== 'undefined' && sdk?.actions?.ready) {
          await sdk.actions.ready();
        }
      } catch (err) { console.warn("Standalone."); }
    }
    init();
  }, []);

  // KESİN ÇÖZÜM: RESMİ NATIVE CONNECT METODU
  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    
    try {
      // 1. Warpcast Mobil/Masaüstü İçi Doğrudan Native Bağlantı
      if (sdk?.wallet?.actions?.connectWallet) {
        const res = await sdk.wallet.actions.connectWallet();
        if (res && res.address) {
          const ok = window.confirm(
            `Authorize connection?\n\nWallet: ${res.address}`
          );
          if (ok) setWallet(res.address);
          setLoading(false);
          return;
        }
      }

      // 2. Warpcast Dışı Standart Tarayıcı/MetaMask Fallback
      if (typeof window !== 'undefined' && window.ethereum) {
        const accts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accts && accts.length > 0) {
          const addr = Array.isArray(accts) ? accts[0] : accts;
          const ok = window.confirm(`Authorize?\n\n${addr}`);
          if (ok) setWallet(addr);
        }
        setLoading(false);
        return;
      }

      alert("Please open inside Warpcast Client.");
    } catch (cErr) {
      console.error(cErr);
      alert(`Error: ${cErr.message || cErr}`);
    } finally {
      setLoading(false);
    }
  }

  // Güvenli TX Gönderim Yapısı
  async function handlePopAndTx() {
    if (balloon === 'popped') return;
    setBalloon('popped');
    try {
      if (sdk?.wallet?.actions?.sendTransaction) {
        // Farcaster v2 yerleşik Tx metodu
        const txHash = await sdk.wallet.actions.sendTransaction({
          chainId: 84532, // Base Sepolia Testnet
          to: wallet,
          value: "0",
          data: "0x"
        });
        alert(`Popped & Checked-in!\nTx: ${txHash}`);
        return;
      }
      alert("Tx simulated out of Warpcast.");
    } catch (txErr) {
      alert("Transaction aborted.");
      setBalloon('idle');
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
              <button onClick={handleConnect} style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '32px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 12px 28px rgba(0,82,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                {loading ? '...' : 'Base'}
              </button>
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>Connect Wallet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
              
              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px' }}>
                <select value={city} onChange={(e) => { setCity(e.target.value); setBalloon('idle'); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600' }}>
                  <option value="Istanbul">Istanbul 🇹🇷</option>
                  <option value="Izmir">Izmir 🇹🇷</option>
                  <option value="London">London 🇬🇧</option>
                  <option value="New York">New York 🇺🇸</option>
                </select>
              </div>

              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {balloon === 'idle' ? (
                  <button onClick={handlePopAndTx} style={{ width: '130px', height: '130px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,82,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                    <span>🎈</span>
                    <span>POP {city.toUpperCase()}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: '48px' }}>💥</div>
                )}
              </div>

              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0052FF' }}>● Connected</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}</span>
              </div>

              <button onClick={() => { setWallet(''); setBalloon('idle'); }} style={{ backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Disconnect</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster</div>
      </div>
    </div>
  );
}
