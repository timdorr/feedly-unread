import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Feedly Unread Extension',
  description: 'See how many unread articles you have on Feedly.',
  themeConfig: {
    nav: [{ text: 'Home', link: '/' }],
    sidebar: [],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/timdorr/feedly-unread' }
    ]
  }
})
