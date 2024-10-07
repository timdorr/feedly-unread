import browser from 'webextension-polyfill'

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
})
