import browser from 'webextension-polyfill'

const __DEV__ = process.env.NODE_ENV != 'production'
const REFRESH_ALARM = 'refresh-counter'

const action = browser.action || browser.browserAction

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function updateBadgeCount() {
  if (__DEV__) console.log('updateBadgeCount')

  const { feedly_token } = await browser.storage.local.get('feedly_token')
  if (!feedly_token) return

  try {
    const res = await fetch('https://api.feedly.com/v3/markers/counts', {
      headers: {
        Authorization: `Bearer ${feedly_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch')
    }

    const counts = await res.json()
    if (!counts || !counts.unreadcounts) return
    const unread: { count: number } = counts.unreadcounts.find(
      (count: { id: string }) => count.id.endsWith('/category/global.all')
    )

    if (unread.count > 0) {
      action.setBadgeBackgroundColor({ color: '#F00' })
      action.setBadgeTextColor({ color: '#FFF' })
      action.setBadgeText({ text: unread.count.toString() })
    } else {
      action.setBadgeText({ text: '' })
    }
  } catch (error) {
    console.log(error)
    action.setBadgeBackgroundColor({ color: '#FF0' })
    action.setBadgeTextColor({ color: '#000' })
    action.setBadgeText({ text: '?' })
  }
}

browser.alarms.onAlarm.addListener(updateBadgeCount)

// Action button

action.setPopup({ popup: '' })

async function openFeedlyTab() {
  const tabs = await browser.tabs.query({ url: 'https://feedly.com/*' })
  if (tabs.length < 1) {
    browser.tabs.create({ url: 'https://feedly.com/' })
  } else {
    browser.tabs.update(tabs[0].id, { active: true })
    browser.tabs.reload(tabs[0].id)
  }
}

action.onClicked.addListener(async () => {
  await openFeedlyTab()

  await timeout(3000)
  await updateBadgeCount()
})

// Alarms

async function checkAlarmState() {
  if (__DEV__) browser.alarms.clearAll()

  const alarm = await browser.alarms.get(REFRESH_ALARM)

  if (!alarm) {
    console.log('creating alarm')
    await browser.alarms.create(
      REFRESH_ALARM,
      __DEV__
        ? { periodInMinutes: 0.5, when: Date.now() + 10 }
        : {
            periodInMinutes: 5
          }
    )
  } else {
    console.log('alarm exists', alarm)
  }
}

checkAlarmState()

// Install

browser.runtime.onInstalled.addListener(async () => {
  await openFeedlyTab()
  console.log('Feedly Unread extension installed')
})

// Content scripts

browser.storage.onChanged.addListener(async () => {
  console.log('feedly token set')
  await updateBadgeCount()
})
