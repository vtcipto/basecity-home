// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'

export default function BaseCityHome() {
  const [lang, setLang] = useState('en')
  const [baseCount, setBaseCount] = useState(1420) // Küresel Base kullanıcı başlangıç sayacı
  const [username, setUsername] = useState('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  // Sayfa açıldığında yerel hafızadan toplam check-in sayısını çeker
  useEffect(() => {
    const savedCount = localStorage.getItem('basecity_global_total_count')
    if (savedCount) {
      setBaseCount(parseInt(savedCount, 10))
    }
  }, [])

  // Farcaster SDK Entegrasyonu (Giriş Yapanı Otomatik Tanıma)
  useEffect(() => {
    const initFrame = async () => {
      try {
        if (typeof window !== 'undefined' && window.parent) {
          const sdk = (await import('@farcaster/frame-sdk')).default
          sdk.actions.ready()
          const context = await sdk.context
          if (context?.user?.username) {
            setUsername('@' + context.user.username)
            setIsWalletConnected(true)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    initFrame()
  }, [])

  const handleConnectWallet = () => {
    setUsername("@guest_user")
    setIsWalletConnected(true)
  }

  const handleCheckIn = () => {
    const newCount = baseCount + 1
    setBaseCount(newCount)
    localStorage.setItem('basecity_global_total_count', newCount.toString())
    setHasCheckedIn(true)
  }

  const handleShareOnWarpcast = () => {
    const shareText = `🔵 I just checked into BaseCity Home as a verified Base user!\n\nThere are now ${baseCount} total builders checked-in globally. Connect your wallet and verify your spot now! 🚀`
    window.open('https://warpcast.com' + encodeURIComponent(shareText), '_blank')
  }

  const buttonStyle = { backgroundColor: '#0052FF', color: '#FFFFFF', border: 'none', padding: '16px 30px', fontSize: '16px', fontWeight: 'bold', borderRadius: '14px', width: '100%', cursor: 'pointer', display: 'block', textAlign: 'center', WebkitTapHighlightColor: 'transparent' };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0052FF', color: '#FFFFFF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '15px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#0a192f', padding: '25px 20px', borderRadius: '24px', maxWidth: '420px', width: '100%', position: 'relative', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
        
        {/* Üst Menü */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'absolute', top: '20px', left: 0, padding: '0 40px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'tr' : 'en')} style={{ backgroundColor: '#172a45', color: '#64ffda', border: '1px solid #64ffda', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            {lang === 'en' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
          {username && (
            <span style={{ backgroundColor: '#0052FF', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #ffffff22' }}>
              {username}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '26px', marginBottom: '8px', fontWeight: '800', textAlign: 'center', letterSpacing: '-0.5px', marginTop: '30px' }}>BaseCity Home 🔵</h1>
        <p style={{ color: '#8892b0', fontSize: '13px', marginBottom: '25px', textAlign: 'center', lineHeight: '1.4' }}>
          {lang === 'en' ? 'Connect your Web3 wallet, confirm your check-in, and share your builder status with the Farcaster community!' : 'Web3 cüzdanınızı bağlayın, check-in işleminizi onaylayın ve builder durumunuzu Farcaster topluluğuyla paylaşın!'}
        </p>

        {/* Büyük Gösterge Paneli */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '25px 20px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center' }}>
          <div style={{ color: '#333333', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>
            {lang === 'en' ? 'Total Verified Onchain Builders:' : 'Toplam Doğrulanmış Onchain Builder Sayısı:'}
          </div>
          <div style={{ fontSize: '42px', fontWeight: '900', color: '#0052FF', letterSpacing: '-1px' }}>
            {baseCount.toLocaleString()}
          </div>
        </div>

        {/* Kademeli Akıllı Web3 Buton Alanı */}
        {!isWalletConnected ? (
          <button onClick={handleConnectWallet} style={buttonStyle}>
            {lang === 'en' ? '⚡ Connect Wallet' : '⚡ Cüzdan Bağla'}
          </button>
        ) : !hasCheckedIn ? (
          <button onClick={handleCheckIn} style={buttonStyle}>
            {lang === 'en' ? '📍 Confirm & Check-In' : '📍 Check-In İşlemini Onayla'}
          </button>
        ) : (
          <button onClick={handleShareOnWarpcast} style={{ ...buttonStyle, backgroundColor: '#64ffda', color: '#0a192f' }}>
            {lang === 'en' ? '📢 Share on Warpcast' : '📢 Warpcast\'te Paylaş'}
          </button>
        )}

      </div>
    </main>
  )
}
