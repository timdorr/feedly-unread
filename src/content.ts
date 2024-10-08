import browser from 'webextension-polyfill'
//
;(async () => {
  if (localStorage['feedly.session']) {
    const session = JSON.parse(localStorage['feedly.session']) as {
      feedlyToken: string
    }
    await browser.storage.local.set({ feedly_token: session.feedlyToken })
  }
})()
