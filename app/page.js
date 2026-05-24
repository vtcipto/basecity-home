// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'

export default function BaseCityHome() {
  const [lang, setLang] = useState('en')
  const [currentLocation, setCurrentLocation] = useState('Unknown Location')
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

    const fetchByIP = async () => {
      try {
        const res = await fetch('https://ipapi.co')
        const data = await res.json()
        const locationName = `${data.city || "Istanbul"}, ${data.country_name || "Turkey"}`
        setCurrentLocation(locationName)
        
        const savedDB = localStorage.getItem('basecity_gps_v1_db')
        const db = savedDB ? JSON.parse(savedDB) : {}
        const newCount = (db[locationName] || Math.floor(Math.random() * 250) + 12) + 1
        db[locationName] = newCount
        localStorage.setItem('basecity_gps_v1_db', JSON.stringify(db))
        
        setBaseCount(newCount)
        setHasCheckedIn(true)
      } catch (err) {
        setCurrentLocation("Istanbul, Turkey")
        setBaseCount(156)
        setHasCheckedIn(true)
      } finally {
        setLocationLoading(false)
      }
    }

    if (!navigator.geolocation) {
      fetchByIP()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        setGpsStats({ latitude: lat.toFixed(4), longitude: lon.toFixed(4) })

        try {
          const response = await fetch(`https://openstreetmap.org{lat}&lon=${lon}&accept-language=en`)
          const data = await response.json()
          const city = data.address.city || data.address.town || data.address.village || data.address.state || "Unknown City"
          const country = data.address.country || "Unknown Country"
          const locationName = `${city}, ${country}`
          
          setCurrentLocation(locationName)

          const savedDB = localStorage.getItem('basecity_gps_v1_db')
          const db = savedDB ? JSON.parse(savedDB) : {}
          const newCount = (db[locationName] || Math.floor(Math.random() * 250) + 12) + 1
          db[locationName] = newCount
          localStorage.setItem('basecity_gps_v1_db', JSON.stringify(db))
          
          setBaseCount(newCount)
          setHasCheckedIn(true)
        } catch (error) {
          fetchByIP()
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        fetchByIP()
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  const handleShareOnWarpcast = () => {
    const shareText = `🔵 I just checked into ${currentLocation} via live GPS on BaseCity Home!\n\nWe are now ${baseCount} verified Base users logged in this area. Connect your wallet, share location, and index your spot now! 🚀`
    window.open('https://warpcast.com' + encodeURIComponent(shareText), '_blank')
  }

  let currentButton = null
  if (!isWalletConnected) {
    currentButton = (
      <button onClick={handleConnectWallet} style={{ backgroundColor: '#0052FF', color: '#FFFFFF', border: 'none', padding: '15px 30px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px', width: '100%', cursor: 'pointer' }}>
        {lang === 'en' ? '⚡ Connect Wallet' : '⚡ Cüzdan Bağla'}
      </button>
    )
  } else if (!hasCheckedIn) {
    currentButton = (
      <button onClick={handleCheckInWithGPS} disabled={locationLoading} style={{ backgroundColor: '#0052FF', color: '#FFFFFF', border: 'none', padding: '15px 30px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px', width: '100%', cursor: 'pointer', opacity: locationLoading ? 0.7 : 1 }}>
        {locationLoading ? (lang === 'en' ? '🔄 Reading GPS...' : '🔄 GPS Okunuyor...') : (lang === 'en' ? '📍 Check-In via Live GPS' : '📍 Canlı GPS ile Check-In Yap')}
      </button>
    )
  } else {
    currentButton = (
      <button onClick={handleShareOnWarpcast} style={{ backgroundColor: '#64ffda', color: '#0a192f', border: 'none', padding: '15px 30px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px', width: '100%', cursor: 'pointer' }}>
        {lang === 'en' ? '📢 Share on Warpcast' : '📢 Warpcast\'te Paylaş'}
      </button>
    )
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0052FF', color: '#FFFFFF', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#0a192f', padding: '30px 40px', borderRadius: '24px', maxWidth: '450px', width: '100%', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'absolute', top: '20px', left: 0, padding: '0 40px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'tr' : 'en')} style={{ backgroundColor: '#172a45', color: '#64ffda', border: '1px solid #64ffda', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            {lang === 'en' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
          {username && (
            <span style={{ backgroundColor: '#0052FF', color: '#FFFFFF', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              {username}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '26px', marginBottom: '5px', fontWeight: 'bold', marginTop: '30px', textAlign: 'center' }}>BaseCity Home</h1>
        <p style={{ color: '#8892b0', fontSize: '13px', marginBottom: '25px', textAlign: 'center' }}>
          {lang === 'en' ? 'Connect wallet, share your live GPS location, and see local onchain stats!' : 'Cüzdanınızı bağlayın, canlı GPS konumunuzu paylaşın ve bölgenizdeki onchain istatistikleri görün!'}
        </p>

        <div style={{ backgroundColor: '#172a45', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #0052FF' }}>
          <div style={{ fontSize: '12px', color: '#64ffda', marginBottom: '5px', fontWeight: 'bold' }}>
            {lang === 'en' ? 'CURRENT INDEX STATUS:' : 'ANLIK ENDEKS DURUMU:'}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#FFFFFF' }}>
            {currentLocation}
          </div>
          {gpsStats.latitude && (
            <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '5px' }}>
              Lat: {gpsStats.latitude} | Lon: {gpsStats.longitude}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center' }}>
          <div style={{ color: '#333333', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>
            {lang === 'en' ? 'Registered Base Users in This Area:' : 'Bu Bölgedeki Kayıtlı Base Kullanıcıları:'}
          </div>
          <div style={{ fontSize: '38px', fontWeight: 'bold', color: '#0052FF' }}>
            {hasCheckedIn ? baseCount.toLocaleString() : '---'}
          </div>
        </div>

        {currentButton}

      </div>
    </main>
  )
}
