// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'

export default function BaseCityHome() {
  const [lang, setLang] = useState('en')
  const [continents, setContinents] = useState([])
  const [selectedContinent, setSelectedContinent] = useState('Europe')
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('Türkiye')
  const [baseCount, setBaseCount] = useState(412)
  
  const [username, setUsername] = useState('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  // Kıtalara göre sadece en çok tanınan ülkelerin hatasız tam veri bankası
  const continentData = {
    "Europe": ["Türkiye", "United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands", "Switzerland"],
    "North America": ["United States", "Canada", "Mexico"],
    "Asia": ["Japan", "South Korea", "China", "India", "Singapore", "United Arab Emirates"],
    "South America": ["Brazil", "Argentina", "Colombia"],
    "Africa": ["South Africa", "Egypt", "Nigeria", "Kenya"],
    "Oceania": ["Australia", "New Zealand"]
  }

  useEffect(() => {
    setContinents(Object.keys(continentData))
    setCountries(continentData["Europe"])
  }, [])

  const handleContinentChange = (e) => {
    const continent = e.target.value
    setSelectedContinent(continent)
    const availableCountries = continentData[continent] || []
    setCountries(availableCountries)
    
    const firstCountry = availableCountries.length > 0 ? availableCountries[0] : ''
    setSelectedCountry(firstCountry)
    
    triggerLocalStorageCount(continent, firstCountry)
  }

  const handleCountryChange = (e) => {
    const countryName = e.target.value
    setSelectedCountry(countryName)
    triggerLocalStorageCount(selectedContinent, countryName)
  }

  const triggerLocalStorageCount = (continent, country) => {
    const savedDB = localStorage.getItem('basecity_final_continents_db')
    const db = savedDB ? JSON.parse(savedDB) : {}
    const key = continent + '_' + country
    setBaseCount(db[key] || Math.floor(Math.random() * 500) + 25)
    setHasCheckedIn(false)
  }

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
    if (!selectedCountry) return
    const savedDB = localStorage.getItem('basecity_final_continents_db')
    const db = savedDB ? JSON.parse(savedDB) : {}
    const key = selectedContinent + '_' + selectedCountry
    
    const newCount = baseCount + 1
    db[key] = newCount
    localStorage.setItem('basecity_final_continents_db', JSON.stringify(db))
    
    setBaseCount(newCount)
    setHasCheckedIn(true)
  }

  const handleShareOnWarpcast = () => {
    const shareText = `🔵 Just checked into ${selectedCountry} (${selectedContinent}) on BaseCity Home!\n\nWe are now ${baseCount} registered Base users here. Represent your continent, connect your wallet, and check-in now! 🚀`
    window.open('https://warpcast.com' + encodeURIComponent(shareText), '_blank')
  }

  let currentButton = null
  const buttonStyle = { backgroundColor: '#0052FF', color: '#FFFFFF', border: 'none', padding: '16px 30px', fontSize: '16px', fontWeight: 'bold', borderRadius: '14px', width: '100%', cursor: 'pointer', display: 'block', textAlign: 'center', WebkitTapHighlightColor: 'transparent' };

  if (!isWalletConnected) {
    currentButton = (
      <button onClick={handleConnectWallet} style={buttonStyle}>
        {lang === 'en' ? '⚡ Connect Wallet' : '⚡ Cüzdan Bağla'}
      </button>
    )
  } else if (!hasCheckedIn) {
    currentButton = (
      <button onClick={handleCheckIn} style={buttonStyle}>
        {lang === 'en' ? '📍 Confirm & Check-In' : '📍 Ülkemi Onayla & Check-In'}
      </button>
    )
  } else {
    currentButton = (
      <button onClick={handleShareOnWarpcast} style={{ ...buttonStyle, backgroundColor: '#64ffda', color: '#0a192f' }}>
        {lang === 'en' ? '📢 Share on Warpcast' : '📢 Warpcast\'te Paylaş'}
      </button>
    )
  }

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
          {lang === 'en' ? 'Connect wallet, select your continent & country, and share it!' : 'Cüzdanınızı bağlayın, kıta ve ülkenizi seçip toplulukla paylaşın!'}
        </p>

        {/* 1. Kıta Seçim Kutusu */}
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#64ffda' }}>{lang === 'en' ? '1. Choose a Continent:' : '1. Bir Kıta Seçin:'}</label>
          <select value={selectedContinent} onChange={handleContinentChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#172a45', color: '#FFFFFF', border: '2px solid #0052FF', outline: 'none', cursor: 'pointer' }}>
            {continents.map((cont) => (
              <option key={cont} value={cont} style={{ backgroundColor: '#0a192f' }}>{cont}</option>
            ))}
          </select>
        </div>

        {/* 2. Ülke Seçim Kutusu */}
        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#64ffda' }}>{lang === 'en' ? '2. Choose a Country:' : '2. Bir Ülke Seçin:'}</label>
          <select value={selectedCountry} onChange={handleCountryChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#172a45', color: '#FFFFFF', border: '2px solid #0052FF', outline: 'none', cursor: 'pointer' }}>
            {countries.map((country, i) => (
              <option key={i} value={country} style={{ backgroundColor: '#0a192f' }}>{country}</option>
            ))}
          </select>
        </div>

        {/* Büyük Gösterge Paneli */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center' }}>
          <div style={{ color: '#333333', fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span>{selectedContinent}</span>
            <span>➔</span>
            <span style={{ color: '#0052FF', fontWeight: 'bold' }}>{selectedCountry}</span>
            <span style={{ fontWeight: 'normal' }}>{lang === 'en' ? 'Registered Base Users:' : 'Kayıtlı Base Kullanıcısı:'}</span>
          </div>
          <div style={{ fontSize: '38px', fontWeight: '900', color: '#0052FF' }}>
            {baseCount.toLocaleString()}
          </div>
        </div>

        {currentButton}

      </div>
    </main>
  )
}
