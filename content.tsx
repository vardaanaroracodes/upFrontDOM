// src/pages/content.tsx
import type { PlasmoContentScript } from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import './style.css';

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

  return (
    <div className="max-w-[400px] mx-auto my-5 p-6 rounded-[24px] bg-gradient-to-br from-red-500 via-pink-500 to-red-600 text-white ">
      <h2 className="text-center text-[3.5rem] font-bold text-white">UpFront</h2>
      <div className="flex flex-col gap-3">
        {([
          ['name', 'Name'],
          ['location', 'Location'],
          ['currentPosition', 'Position'],
          ['currentCompany', 'Company'],
          ['period', 'Period']
        ] as const).map(label => {
          const key = label[0] as keyof ProfileData
          return (
            <div key={label[0]} className="flex">
              <span className="w-1/3 font-semibold">{label[1]}</span>
              <span className="flex-1 text-white">{profile[key] || '–'}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-1 flex flex-col gap-4">
        <label className="text-xl font-medium">Google Sheet URL</label>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={sheetUrl ? 'Sheet Already Exists' : 'Enter sheet URL'}
          className="w-full h-12 rounded-lg bg-white px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <div className="flex justify-between">
            <button
            onClick={saveUrl}
    className="align-middle h-20 w-40 select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none  py-2 px-2 bg-gradient-to-tr from-white to-pink-100  shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] rounded-full text-black text-xl"
    type="button">
    Save Sheet
  </button>
  <button
            onClick={sendToSheet}
    className="align-middle h-20 w-40 select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none  py-2 px-2 bg-gradient-to-tr from-white to-pink-100  shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] rounded-full text-black text-xl"
    type="button">
    Enrich
  </button>
         
        </div>
        {status && <div className="text-center text-yellow-400 text-sm">{status}</div>}
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