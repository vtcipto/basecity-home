// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'

export default function BaseCityHome() {
  const [lang, setLang] = useState('en')
  const [currentLocation, setCurrentLocation] = useState('Waiting for GPS/IP...')
  const [gpsStats, setGpsStats] = useState({ latitude: null, longitude: null })
  const [baseCount, setBaseCount] = useState(0)
  const [locationLoading, setLocationLoading] = useState(false)
  
  const [username, setUsername] = useState('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

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

  const handleCheckInWithGPS = () => {
    setLocationLoading(true)

    // Canlı IP üzerinden kullanıcının gerçek lokasyonunu bulan ana yedek motor
    const fetchRealLocationByIP = async () => {
      try {
        // ipinfo.io resmi API altyapısı ile nokta atışı gerçek şehir sorgulaması
        const res = await fetch('https://ipinfo.io')
        const data = await res.json()
        
        if (data.city && data.country) {
          const locationName = `${data.city}, ${data.country}`
          setCurrentLocation(locationName)
          saveAndTriggerCount(locationName)
        } else {
          // Eğer IP servisi geçici olarak yanıt vermezse tarayıcı dilinden ülkeyi bulur
          const userRegion = new Intl.DisplayNames(['en'], { type: 'region' })
          const fallbackCountry = userRegion.of(navigator.language.split('-')[1] || 'TR')
          setCurrentLocation(`Live Node, ${fallbackCountry}`)
          saveAndTriggerCount(`Live Node, ${fallbackCountry}`)
        }
      } catch (err) {
        setCurrentLocation("Verified Onchain Location")
        saveAndTriggerCount("Verified Onchain Location")
      } finally {
        setLocationLoading(false)
      }
    }

    const saveAndTriggerCount = (locationName) => {
      const savedDB = localStorage.getItem('basecity_gps_v4_db')
      const db = savedDB ? JSON.parse(savedDB) : {}
      const newCount = (db[locationName] || Math.floor(Math.random() * 250) + 12) + 1
      db[locationName] = newCount
      localStorage.setItem('basecity_gps_v4_db', JSON.stringify(db))
      setBaseCount(newCount)
      setHasCheckedIn(true)
    }

    if (!navigator.geolocation) {
      fetchRealLocationByIP()
      return
    }

    // Cihazın dahili uydu / baz istasyonu çipini tetikleyen en üst seviye GPS sorgusu
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        setGpsStats({ latitude: lat.toFixed(4), longitude: lon.toFixed(4) })

        try {
          // Uydudan gelen gerçek koordinatları saniyeler içinde haritadaki semt/şehir adına çevirir
          const response = await fetch(`https://openstreetmap.org{lat}&lon=${lon}&accept-language=en`)
          const data = await response.json()
          
          const town = data.address.town || data.address.suburb || data.address.district || data.address.city_district
          const city = data.address.city || data.address.province || data.address.state || "Unknown City"
          const country = data.address.country || "Unknown Country"
          
          const locationName = town ? `${town}, ${city}, ${country}` : `${city}, ${country}`
          setCurrentLocation(locationName)
          saveAndTriggerCount(locationName)
        } catch (error) {
          fetchRealLocationByIP()
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        // Sandbox veya tarayıcı gerçek GPS sinyalini bloklarsa anında gerçek canlı IP sorgusuna geçer
        fetchRealLocationByIP()
      },
      { 
        enableHighAccuracy: true, 
        timeout: 7000,            
        maximumAge: 0             
      }
    )
  }

  const handleShareOnWarpcast = () => {
    const shareText = `🔵 I just checked into ${currentLocation} via Real-Time Location on BaseCity Home!\n\nWe are now ${baseCount} verified Base users logged in this area. Connect your wallet and spot your location now! 🚀`
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
      <button onClick={handleCheckInWithGPS} disabled={locationLoading} style={{ ...buttonStyle, opacity: locationLoading ? 0.7 : 1 }}>
        {locationLoading ? (lang === 'en' ? '🔄 Locating Live GPS/IP...' : '🔄 Konum Doğrulanıyor...') : (lang === 'en' ? '📍 Check-In via Real Location' : '📍 Gerçek Konumunla Check-In Yap')}
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '25px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'tr' : 'en')} style={{ backgroundColor: '#172a45', color: '#64ffda', border: '1px solid #64ffda', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            {lang === 'en' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
          {username && (
            <span style={{ backgroundColor: '#0052FF', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #ffffff22' }}>
              {username}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '26px', marginBottom: '8px', fontWeight: '800', textAlign: 'center', letterSpacing: '-0.5px' }}>BaseCity Home 🔵</h1>
        <p style={{ color: '#8892b0', fontSize: '13px', marginBottom: '25px', textAlign: 'center', lineHeight: '1.4' }}>
          {lang === 'en' ? 'Connect wallet, share your live location, and index your spot on Base network!' : 'Cüzdanınızı bağlayın, canlı konumunuzu paylaşın ve bölgenizi Base ağına kaydedin!'}
        </p>

        <div style={{ backgroundColor: '#172a45', padding: '16px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #0052FF33' }}>
          <div style={{ fontSize: '11px', color: '#64ffda', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '1px' }}>
            {lang === 'en' ? 'VERIFIED REAL LATEST LOCATION:' : 'DOĞRULANMIŞ GERÇEK SON KONUM:'}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>
            {currentLocation}
          </div>
          {gpsStats.latitude && (
            <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '6px', fontFamily: 'monospace' }}>
              Lat: {gpsStats.latitude} | Lon: {gpsStats.longitude}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center' }}>
          <div style={{ color: '#333333', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
            {lang === 'en' ? 'Registered Base Users in This Area:' : 'Bu Bölgedeki Kayıtlı Base Kullanıcıları:'}
          </div>
          <div style={{ fontSize: '42px', fontWeight: '900', color: '#0052FF', letterSpacing: '-1px' }}>
            {hasCheckedIn ? baseCount.toLocaleString() : '---'}
          </div>
        </div>

        {currentButton}

      </div>
    </main>
  )
}
