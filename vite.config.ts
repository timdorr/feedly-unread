import { defineConfig } from 'vite'
import webExtension, { readJsonFile } from 'vite-plugin-web-extension'

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json')
  const pkg = readJsonFile('package.json')
  return {
    name: 'Feedly Unread',
    description: 'Monitor your unread article count on Feedly',
    version: pkg.version,
    ...manifest
  }
}

export default defineConfig({
  plugins: [
    webExtension({
      disableAutoLaunch: true,
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json']
    })
  ]
})
