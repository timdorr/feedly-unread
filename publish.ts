import { createReadStream } from 'fs'

import dotenv from 'dotenv'
import { zip } from 'zip-a-folder'
import cwu from 'chrome-webstore-upload'

dotenv.config({ path: ['.env.local', '.env'] })

await zip('dist', 'extension.zip')
const packageFile = createReadStream('./extension.zip')

const store = cwu({
  extensionId: 'galoemenhjpicpglbfechpddclanflph',
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN || ''
})

await store.uploadExisting(packageFile)
await store.publish()
