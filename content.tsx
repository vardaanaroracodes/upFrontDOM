// // src/pages/content.tsx
// import type { PlasmoContentScript } from "plasmo"
// import React, { useEffect, useState } from "react"
// import { createRoot } from "react-dom/client"
// import './style.css';

// // Define data structure
// type ProfileData = {
//   name: string
//   currentCompany: string
//   currentPosition: string
//   location: string
//   linkedinUrl: string
//   period: string
// }

// export const config: PlasmoContentScript = {
//   matches: ["https://www.linkedin.com/in/*"],
//   all_frames: true
// }

// // Extraction logic
// function extractProfileData(): ProfileData {
//   const url = window.location.href
//   const getText = (sel: string) => document.querySelector(sel)?.textContent?.trim() || ""
//   const name = getText('h1')
//   const location = getText(
//     '.pv-top-card-section__location, .text-body-small.inline.t-black--light.break-words'
//   )
//   const expEls = document.querySelectorAll(
//     '.pvs-header__top-container--no-stack h2.pvs-header__title > span[aria-hidden="true"]'
//   )
//   const hasExp = Array.from(expEls).some(el => el.textContent?.trim() === 'Experience')
//   let currentPosition = "", currentCompany = "", period = ""
//   if (hasExp) {
//     currentPosition = getText('.hoverable-link-text.t-bold > span[aria-hidden="true"]')
//     const raw = getText(
//       '[data-view-name="profile-component-entity"] a[data-field="experience_company_logo"] .t-14.t-normal:not(.t-black--light) > span[aria-hidden="true"]'
//     )
//     currentCompany = raw.split('·')[0].trim()
//     period = getText(
//       '[data-view-name="profile-component-entity"] a[data-field="experience_company_logo"] .t-14.t-normal.t-black--light > span.pvs-entity__caption-wrapper[aria-hidden="true"]'
//     )
//   }
//   return { name, currentCompany, currentPosition, location, linkedinUrl: url, period }
// }

// function ProfileApp() {
//   const [profile, setProfile] = useState<ProfileData>(extractProfileData())
//   const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('sheetUrl') || "")
//   const [inputValue, setInputValue] = useState("")
//   const [status, setStatus] = useState("")

//   // Watch for profile changes in the DOM
//   useEffect(() => {
//     const update = () => setProfile(extractProfileData())
//     const mo = new MutationObserver(update)
//     mo.observe(document.body, { childList: true, subtree: true })
//     return () => mo.disconnect()
//   }, [])

//   const saveUrl = () => {
//     if (!inputValue.trim()) return setStatus("Enter a valid URL")
//     localStorage.setItem('sheetUrl', inputValue)
//     setSheetUrl(inputValue)
//     setInputValue("")
//     setStatus("URL saved!")
//   }

//   const sendToSheet = () => {
//     const url = sheetUrl || inputValue
//     const match = url.match(/\/d\/([\w-]+)/)
//     if (!match) return setStatus("Invalid Sheet URL")
//     const id = match[1]
//     setStatus("Sending...")
//     fetch(
//       'https://script.google.com/macros/s/AKfycbwYFM6IjiTnjeTvBOl-GxtvuuvZTBkMMSUAva2r2CS9hO1PjiwHbf1L6UbZpjvkrD-CxQ/exec',
//       { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sheetId: id, ...profile }) }
//     )
//       .then(() => setStatus("Data sent!"))
//       .catch(() => setStatus("Send failed"))
//   }

//   // Function to get the profile image
//   const getProfileImage = () => {
//     const imgEl = document.querySelector('.pv-top-card-profile-picture__image') || 
//                  document.querySelector('.profile-photo-edit__preview') ||
//                  document.querySelector('.presence-entity__image img')
//     return imgEl?.getAttribute('src') || null
//   }

//   const profileImage = getProfileImage()

//   return (
//     <div className="mx-auto my-5 p-4 rounded-lg bg-[#B84271] text-white shadow-lg">
//       <div className="flex flex-wrap">
//         {/* Left side - Profile pic and basic info */}
//         <div className="w-full md:w-1/3 p-4 flex flex-col">
//           <div className="flex flex-col items-center">
//             {profileImage ? (
//               <div className="w-36 h-36 rounded-full mb-4 overflow-hidden bg-white border-3 border-white">
//                 <img src={profileImage} alt={profile.name} className="w-full h-full object-cover" />
//               </div>
//             ) : (
//               <div className="w-36 h-36 rounded-full mb-4 bg-gray-300 flex items-center justify-center border-3 border-white">
//                 <span className="text-gray-600 text-4xl">👤</span>
//               </div>
//             )}
//             <div className="text-center">
//               <p className="font-bold text-3xl mb-1">{profile.name || '–'}</p>
//               <p className="text-xl text-white/90 mb-1">{profile.currentPosition || '–'}</p>
//               <p className="text-xl text-white/80">{profile.location || '–'}</p>
//             </div>
//           </div>
          
//           <div className="mt-auto flex flex-col">
//             <button
//               onClick={saveUrl}
//               className="mb-3 text-xl font-semibold text-center py-3 px-6 bg-white text-[#B84271] rounded-full shadow-md hover:bg-gray-100 transition-colors"
//               type="button">
//               Save Sheet
//             </button>
//             <button
//               onClick={sendToSheet}
//               className="text-xl font-semibold text-center py-3 px-6 bg-white text-[#B84271] rounded-full shadow-md hover:bg-gray-100 transition-colors"
//               type="button">
//               Enrich
//             </button>
//           </div>
//         </div>

//         {/* Right side - UpFront content */}
//         <div className="w-full md:w-2/3 p-4">
//           <div className="bg-white text-gray-800 p-5 rounded-lg h-full shadow-inner">
//             <h2 className="text-3xl font-bold text-[#B84271] mb-2">UpFront</h2>
//             <p className="text-lg mb-4 text-gray-500">Quickly send profile data to Google Sheets</p>
            
//             <div className="flex flex-col gap-4 mb-5">
//               {/* First row of fields */}
//               <div className="grid grid-cols-2 gap-x-6 gap-y-3">
//                 {([
//                   ['name', 'Name'],
//                   ['location', 'Location'],
//                   ['currentPosition', 'Position'],
//                   // ['linkedinUrl', 'Profile URL']
//                 ] as const).map(label => {
//                   const key = label[0] as keyof ProfileData
//                   return (
//                     <div key={label[0]} className="flex flex-col">
//                       <span className="text-base font-semibold text-gray-500">{label[1]}</span>
//                       <span className="text-lg truncate">{profile[key] || '–'}</span>
//                     </div>
//                   )
//                 })}
//               </div>
              
//               {/* Second row with Company and Period */}
//               <div className="grid grid-cols-2 gap-x-6">
//                 {([
//                   ['currentCompany', 'Company'],
//                   ['period', 'Period']
//                 ] as const).map(label => {
//                   const key = label[0] as keyof ProfileData
//                   return (
//                     <div key={label[0]} className="flex flex-col">
//                       <span className="text-base font-semibold text-gray-500">{label[1]}</span>
//                       <span className="text-lg truncate">{profile[key] || '–'}</span>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
            
//             <div className="border-t border-gray-200 pt-4">
//               <label className="block text-xl font-medium mb-2">Google Sheet URL</label>
//               <input
//                 value={inputValue}
//                 onChange={e => setInputValue(e.target.value)}
//                 placeholder={sheetUrl ? 'Sheet Already Exists' : 'Enter sheet URL'}
//                 className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md text-gray-700 focus:ring-1 focus:ring-[#B84271] focus:border-[#B84271] focus:outline-none"
//               />
//             </div>
            
//             {status && <div className="mt-3 text-center text-[#B84271] text-base font-medium">{status}</div>}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function ContentScript() {
//   useEffect(() => {
//     const mainEl = document.querySelector('main')
//     if (!mainEl) return
    
//     // Create a container for our extension
//     const container = document.createElement('div')
//     container.id = 'upfront-extension-root'
//     container.setAttribute('data-upfront-root', 'true')
    
//     // Add a style tag to ensure our styles don't leak and LinkedIn's styles are preserved
//     const styleTag = document.createElement('style')
//     styleTag.textContent = `
//       /* Ensure profile images on LinkedIn maintain their style */
//       img:not(#upfront-extension-root img),
//       .presence-entity__image:not(#upfront-extension-root *),
//       .profile-photo-edit__preview:not(#upfront-extension-root *),
//       .pv-top-card-profile-picture__image:not(#upfront-extension-root *) {
//         border-radius: 50% !important;
//       }
      
//       /* Scope our extension styles */
//       #upfront-extension-root {
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
//         line-height: normal;
//         box-sizing: border-box;
//       }
      
//       #upfront-extension-root * {
//         box-sizing: border-box;
//       }
      
//       /* Make sure our extension has some spacing */
//       #upfront-extension-root {
//         margin: 16px 0;
//         width: 100%;
//       }
//     `
//     document.head.appendChild(styleTag)
    
//     // Find the first main section or other appropriate place to insert
//     const profileSection = document.querySelector('.scaffold-layout__main') || mainEl
    
//     // Insert after first primary section if possible
//     const firstCardSection = profileSection.querySelector('.artdeco-card')
//     if (firstCardSection && firstCardSection.parentNode) {
//       firstCardSection.parentNode.insertBefore(container, firstCardSection.nextSibling)
//     } else {
//       // Fallback - append to main section
//       profileSection.appendChild(container)
//     }
    
//     const root = createRoot(container)
//     root.render(<ProfileApp />)
    
//     return () => {
//       styleTag.remove()
//       container.remove()
//     }
//   }, [])

//   return null
// }

import type { PlasmoContentScript } from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import './style.css'

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

function extractProfileData(): ProfileData {
  const url = window.location.href
  const getText = (sel: string) => document.querySelector(sel)?.textContent?.trim() || ""
  const name = getText('h1')
  const location = getText('.pv-top-card-section__location, .text-body-small.inline.t-black--light.break-words')

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
    setStatus("✅ Sheet URL saved!")
  }

  const sendToSheet = () => {
    const url = sheetUrl || inputValue
    const match = url.match(/\/d\/([\w-]+)/)
    if (!match) return setStatus("❌ Invalid Google Sheet URL")
    const id = match[1]
    setStatus("📤 Sending to Google Sheet...")
    fetch('https://script.google.com/macros/s/AKfycbwYFM6IjiTnjeTvBOl-GxtvuuvZTBkMMSUAva2r2CS9hO1PjiwHbf1L6UbZpjvkrD-CxQ/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId: id, ...profile })
    })
      .then(() => setStatus("✅ Data sent to Google Sheet!"))
      .catch(() => setStatus("❌ Failed to send to Google Sheet"))
  }

  const sendToHubSpot = async () => {
    setStatus("🔍 Checking HubSpot connection...")
    try {
      const check = await fetch("http://localhost:5001/api/status")
      const { connected } = await check.json()

      if (!connected) {
        setStatus("🔐 Not connected. Opening HubSpot login...")
        window.open("http://localhost:5001/", "_blank")
        return
      }

      // Fallback email in case HubSpot needs it
      const email = profile.name ? `${profile.name.toLowerCase().replace(/ /g, "")}@example.com` : "unknown@example.com"

      setStatus("📤 Sending to HubSpot...")
      const res = await fetch("http://localhost:5001/api/enrich-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          email,
          linkedin_url: profile.linkedinUrl,
          company_period: profile.period
        })
      })

      if (res.ok) {
        setStatus("✅ Sent to HubSpot!")
      } else {
        const err = await res.json()
        setStatus("❌ HubSpot error: " + err.error)
      }
    } catch (err) {
      setStatus("❌ Failed to reach HubSpot server.")
    }
  }

  const profileImage = document.querySelector(
    '.pv-top-card-profile-picture__image, .profile-photo-edit__preview, .presence-entity__image img'
  )?.getAttribute('src')

  return (
    <div className="mx-auto my-5 p-4 rounded-lg bg-[#B84271] text-white shadow-lg">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/3 p-4 flex flex-col items-center">
          <div className="w-36 h-36 rounded-full mb-4 bg-white border-3 border-white overflow-hidden">
            {profileImage
              ? <img src={profileImage} alt={profile.name} className="w-full h-full object-cover" />
              : <span className="text-gray-600 text-4xl">👤</span>}
          </div>
          <p className="font-bold text-3xl">{profile.name || '–'}</p>
          <p className="text-xl">{profile.currentPosition || '–'}</p>
          <p className="text-white/80">{profile.location || '–'}</p>

          <button onClick={saveUrl} className="mt-4 text-lg bg-white text-[#B84271] py-2 px-4 rounded-full shadow hover:bg-gray-100">
            Save Sheet
          </button>
          <button onClick={sendToSheet} className="mt-2 text-lg bg-white text-[#B84271] py-2 px-4 rounded-full shadow hover:bg-gray-100">
            Send to Sheet
          </button>
          <button onClick={sendToHubSpot} className="mt-2 text-lg bg-white text-[#B84271] py-2 px-4 rounded-full shadow hover:bg-gray-100">
            Send to HubSpot
          </button>
        </div>

        <div className="w-full md:w-2/3 p-4">
          <div className="bg-white text-gray-800 p-5 rounded-lg shadow-inner">
            <h2 className="text-2xl font-bold text-[#B84271] mb-2">LinkedIn Data</h2>
            <p className="text-gray-600 mb-4">Preview scraped data</p>

            <div className="grid grid-cols-2 gap-4">
              {([
                ["name", "Name"],
                ["currentPosition", "Position"],
                ["currentCompany", "Company"],
                ["location", "Location"],
                ["period", "Period"],
                ["linkedinUrl", "Profile URL"]
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="text-base text-gray-800 truncate">{profile[key] || '–'}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-lg font-medium mb-1">Google Sheet URL</label>
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={sheetUrl ? "Sheet already saved" : "Paste Google Sheet URL"}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {status && <p className="mt-3 text-sm font-medium text-[#B84271]">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContentScript() {
  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (!mainEl) return

    const container = document.createElement('div')
    container.id = 'upfront-extension-root'
    container.setAttribute('data-upfront-root', 'true')

    const root = createRoot(container)
    root.render(<ProfileApp />)

    const target = document.querySelector('.scaffold-layout__main') || mainEl
    const firstCard = target.querySelector('.artdeco-card')
    if (firstCard && firstCard.parentNode) {
      firstCard.parentNode.insertBefore(container, firstCard.nextSibling)
    } else {
      target.appendChild(container)
    }

    return () => container.remove()
  }, [])

  return null
}
