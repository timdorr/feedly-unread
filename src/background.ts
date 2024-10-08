import browser from 'webextension-polyfill'

const __DEV__ = process.env.NODE_ENV != 'production'
const REFRESH_ALARM = 'refresh-counter'

async function updateBadgeCount() {
  const { feedly_token } = await browser.storage.local.get('feedly_token')
  if (!feedly_token) return

  const res = await fetch('https://api.feedly.com/v3/markers/counts', {
    headers: {
      Authorization: `Bearer ${feedly_token}`,
      'Content-Type': 'application/json'
    }
  })

  const counts = await res.json()
  if (!counts || !counts.unreadcounts) return
  const unread: { count: number } = counts.unreadcounts.find(
    (count: { id: string }) => count.id.endsWith('/category/global.all')
  )

  action.setBadgeBackgroundColor({ color: '#F00' })
  action.setBadgeTextColor({ color: '#FFF' })
  action.setBadgeText({ text: unread.count.toString() })
}

const action = browser.action || browser.browserAction

action.setPopup({ popup: '' })

action.onClicked.addListener(async () => {
  const tabs = await browser.tabs.query({ url: 'https://feedly.com/*' })
  if (tabs.length < 1) {
    browser.tabs.create({ url: 'https://feedly.com/' })
  } else {
    browser.tabs.update(tabs[0].id, { active: true })
    browser.tabs.reload(tabs[0].id)
  }

  await updateBadgeCount()
})

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

browser.alarms.onAlarm.addListener(updateBadgeCount)
