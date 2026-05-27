'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export default function BasecityHome() {
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('Istanbul');
  const [balloonState, setBalloonState] = useState('idle');

  useEffect(() => {
    async function init() {
      try {
        if (typeof window !== 'undefined' && sdk?.actions?.ready) {
          await sdk.actions.ready();
        }
      } catch (err) { console.warn("Standalone mode."); }
    }
    init();
  }, []);

  async function handleConnect() {
    if (loading) return;
    setLoading(true);
    
    try {
      // 1. ADIM: Farcaster v2 resmi yerleşik cüzdan yapısını çağır
      let p = sdk?.wallet?.getEthereumProvider 
        ? sdk.wallet.getEthereumProvider() 
        : null;

      // 2. ADIM: Eğer Warpcast dışındaysa standart tarayıcı cüzdanını dene
      if (!p && typeof window !== 'undefined') {
        p = window.ethereum || null;
      }

      if (!p) {
        alert("No Web3 wallet found! Open inside Warpcast.");
        setLoading(false);
        return;
      }

      // 3. ADIM: Güvenli hesap isteği
      const accts = await p.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // HATA DÜZELTMESİ: Gelen adresin tipini doğrula ve string'e çevir
      let targetAddr = '';
      if (Array.isArray(accts) && accts.length > 0) {
        targetAddr = accts[0];
      } else if (typeof accts === 'string') {
        targetAddr = accts;
      } else if (accts && accts.address) {
        targetAddr = accts.address;
      }

      if (!targetAddr) {
        alert("Failed to fetch wallet address.");
        setLoading(false);
        return;
      }

      // Kullanıcıya onay penceresini göster
      const ok = window.confirm(
        `Authorize connection for:\n${targetAddr}`
      );
      
      if (ok) {
        setWallet(targetAddr);
      }
    } catch (cErr) {
      console.error("Connection error:", cErr);
      // Hata detayını tam görebilmek için alert'ı genişlettim
      alert(`Wallet interaction failed. Details: ${cErr.message || cErr}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePopAndTx() {
    if (balloonState === 'popped') return;
    setBalloonState('popped');
    try {
      let p = sdk?.wallet?.getEthereumProvider 
        ? sdk.wallet.getEthereumProvider() 
        : (typeof window !== 'undefined' ? window.ethereum : null);

      if (!p) return;
      await p.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }],
      });

      const txHash = await p.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet, to: wallet, value: '0x0',
          data: '0x' + Array.from(`Basecity:${city}`)
            .map(c => c.charCodeAt(0).toString(16)).join('')
        }],
      });
      alert(`Popped & Checked-in!\nTx: ${txHash.substring(0, 15)}...`);
    } catch (txErr) {
      alert("Transaction aborted.");
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
              <button onClick={handleConnect} style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#ffffff', border: 'none', fontSize: '32px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 12px 28px rgba(0,82,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                {loading ? '...' : 'Base'}
              </button>
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>Connect Wallet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
              
              <div style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '12px' }}>
                <select value={city} onChange={(e) => { setCity(e.target.value); setBalloonState('idle'); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600' }}>
                  <option value="Istanbul">Istanbul 🇹🇷</option>
                  <option value="Izmir">Izmir 🇹🇷</option>
                  <option value="London">London 🇬🇧</option>
                  <option value="New York">New York 🇺🇸</option>
                </select>
              </div>

              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {balloonState === 'idle' ? (
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

              <button onClick={() => { setWallet(''); setBalloonState('idle'); }} style={{ backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Disconnect</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster</div>
      </div>
    </div>
  );
}
