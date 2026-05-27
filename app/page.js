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

  useEffect(() => {
    async function initFarcaster() {
      try {
        if (typeof window !== 'undefined') {
          // Resmi Farcaster Frame v2 başlatıcısı
          await sdk.actions.ready();
        }
      } catch (err) {
        console.warn("Farcaster context initialization skipped in browser.");
      }
    }
    initFarcaster();
  }, []);

  // GERÇEK FARCASTER CÜZDAN BAĞLANTI AKIŞI
  async function handleConnect() {
    if (loading) return;
    setLoading(true);

    try {
      // Warpcast'in kendi entegre Ethereum sağlayıcısını (EIP-1193) çağırıyoruz
      const provider = sdk.wallet?.ethProvider;

      if (!provider) {
        alert("Please open this app inside Warpcast mobile or desktop client to connect your real wallet.");
        setLoading(false);
        return;
      }

      // Kullanıcının kendi gerçek Farcaster cüzdanından adres isteme (Native Popup Açar)
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts && accounts.length > 0) {
        const realUserAddress = accounts[0];

        // Kullanıcıya kendi gerçek adresiyle onay penceresi sunuyoruz
        const isAuthorized = window.confirm(
          `Connect Basecity Home with your wallet?\n\nAddress:\n${realUserAddress}`
        );

        if (!isAuthorized) {
          setLoading(false);
          return;
        }

        // Cüzdan bağlandıktan sonra kullanıcının Farcaster profil verilerini çekiyoruz
        const context = await sdk.context;
        if (context?.user) {
          setUsername(context.user.username || context.user.displayName || 'User');
          setPfpUrl(context.user.pfpUrl || '');
        } else {
          setUsername('Warpcast User');
        }

        setWallet(realUserAddress);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Wallet connection rejected by user.");
    } finally {
      setLoading(false);
    }
  }

  function handlePopBalloon() {
    if (balloon === 'popped') return;
    setBalloon('popped');
    setTimeout(() => {
      alert(`Balloon Popped! Checked-in to ${city} 🚀`);
    }, 150);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f5f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', minHeight: '70vh', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eef0f2' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#0052FF', fontWeight: '800', margin: '0' }}>Basecity Home</h1>
        </div>

        {wallet && username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8F9FA', padding: '10px 18px', borderRadius: '50px', margin: '15px auto', border: '1px solid #E9ECEF', width: 'fit-content' }}>
            {pfpUrl ? (
              <img src={pfpUrl} alt="PFP" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0052FF', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{username.charAt(0).toUpperCase()}</div>
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
              <p style={{ color: '#0052FF', fontSize: '16px', fontWeight: '700', margin: '0' }}>Connect Farcaster Wallet</p>
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
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}</span>
              </div>

              <button onClick={() => { setWallet(''); setBalloon('idle'); }} style={{ backgroundColor: 'transparent', color: '#FF3B30', border: '1px solid #FF3B30', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Disconnect</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: '500', textAlign: 'center' }}>Secured by Farcaster Identity</div>
      </div>
    </div>
  );
}
