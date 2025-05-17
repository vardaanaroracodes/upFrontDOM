// src/pages/content.tsx
import type { PlasmoContentScript } from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

// Define data structure
type ProfileData = {
  name: string
  currentCompany: string
  currentPosition: string
  location: string
  linkedinUrl: string
  period: string
}

export const config: PlasmoContentScript = {
  matches: ["https://www.linkedin.com/in/*"],
  all_frames: true
}

// Extraction logic
function extractProfileData(): ProfileData {
  const url = window.location.href
  const getText = (sel: string) => document.querySelector(sel)?.textContent?.trim() || ""
  const name = getText('h1')
  const location = getText(
    '.pv-top-card-section__location, .text-body-small.inline.t-black--light.break-words'
  )
  const expEls = document.querySelectorAll(
    '.pvs-header__top-container--no-stack h2.pvs-header__title > span[aria-hidden="true"]'
  )
  const hasExp = Array.from(expEls).some(el => el.textContent?.trim() === 'Experience')
  let currentPosition = "", currentCompany = "", period = ""
  if (hasExp) {
    currentPosition = getText('.hoverable-link-text.t-bold > span[aria-hidden="true"]')
    const raw = getText(
      '[data-view-name="profile-component-entity"] a[data-field="experience_company_logo"] .t-14.t-normal:not(.t-black--light) > span[aria-hidden="true"]'
    )
    currentCompany = raw.split('·')[0].trim()
    period = getText(
      '[data-view-name="profile-component-entity"] a[data-field="experience_company_logo"] .t-14.t-normal.t-black--light > span.pvs-entity__caption-wrapper[aria-hidden="true"]'
    )
  }
  return { name, currentCompany, currentPosition, location, linkedinUrl: url, period }
}

function ProfileApp() {
  const [profile, setProfile] = useState<ProfileData>(extractProfileData())
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('sheetUrl') || "")
  const [inputValue, setInputValue] = useState("")
  const [status, setStatus] = useState("")

  // Watch for profile changes in the DOM
  useEffect(() => {
    const update = () => setProfile(extractProfileData())
    const mo = new MutationObserver(update)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  const saveUrl = () => {
    if (!inputValue.trim()) return setStatus("Enter a valid URL")
    localStorage.setItem('sheetUrl', inputValue)
    setSheetUrl(inputValue)
    setInputValue("")
    setStatus("URL saved!")
  }

  const sendToSheet = () => {
    const url = sheetUrl || inputValue
    const match = url.match(/\/d\/([\w-]+)/)
    if (!match) return setStatus("Invalid Sheet URL")
    const id = match[1]
    setStatus("Sending...")
    fetch(
      'https://script.google.com/macros/s/AKfycbwYFM6IjiTnjeTvBOl-GxtvuuvZTBkMMSUAva2r2CS9hO1PjiwHbf1L6UbZpjvkrD-CxQ/exec',
      { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sheetId: id, ...profile }) }
    )
      .then(() => setStatus("Data sent!"))
      .catch(() => setStatus("Send failed"))
  }

  const refreshProfile = () => {
    setProfile(extractProfileData())
    setStatus("Profile refreshed.")
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem', borderRadius: 24, background: 'linear-gradient(135deg, #1f2937, #4f46e5, #000)', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
      <h2 style={{ textAlign: 'center', fontSize: '3.5rem', fontWeight: 700, color: 'white' }}>UpFront</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {([['name','Name'],['location','Location'],['currentPosition','Postion'],['currentCompany','Company'],['period','Period']] as const).map(label => {
          const key = label[0] as keyof ProfileData
          return (
            <div key={label[0]} style={{ display: 'flex' }}>
              <span style={{ width: '30%', fontWeight: 600 }}>{label[1]}:</span>
              <span style={{ flex: 1, color: '#d1d5db' }}>{profile[key] || '–'}</span>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Google Sheet URL</label>
        <input
          value={inputValue}
          
          onChange={e => setInputValue(e.target.value)}
          placeholder={sheetUrl?'Sheet Already Exists':'Enter sheet URL'}
          style={{ padding: '0.5rem', borderRadius: 8, background: '#374151', border: 'none', color: 'white' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={saveUrl} style={{ padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', background: '#2563eb', color: 'white' }}>Save URL</button>
          <button onClick={sendToSheet} style={{ flex: 1, padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', background: '#4f46e5', color: 'white' }}>Send to Sheet</button>
        </div>
        <button onClick={refreshProfile} style={{ padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', background: '#4b5563', color: 'white' }}>Refresh</button>
        {status && <div style={{ textAlign: 'center', color: '#fbbf24', fontSize: '0.875rem' }}>{status}</div>}
      </div>
    </div>
  )
}

export default function ContentScript() {
  useEffect(() => {
    const target = document.querySelector('div.ph5.pb5')
    if (!target) return
    const container = document.createElement('div')
    target.insertAdjacentElement('afterend', container)
    const root = createRoot(container)
    root.render(<ProfileApp />)
  }, [])

  return null
}
