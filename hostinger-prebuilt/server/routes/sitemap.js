/**
 * Sitemap Route
 * Serves the single build-generated sitemap.xml
 */

import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function findSitemapFile() {
  const candidates = [
    join(process.cwd(), 'dist', 'sitemap.xml'),
    join(__dirname, '../../dist/sitemap.xml'),
    join(__dirname, '../../hostinger-prebuilt/dist/sitemap.xml'),
    join(__dirname, '../../hostinger-deploy/dist/sitemap.xml'),
    join(__dirname, '../../public/sitemap.xml')
  ]

  return candidates.find(p => existsSync(p))
}

export function serveSitemap(req, res) {
  const filePath = findSitemapFile()
  if (!filePath) {
    return res.status(404).type('text/plain').send('sitemap.xml not found')
  }

  res.header('Content-Type', 'application/xml')
  res.header('Cache-Control', 'public, max-age=86400')
  return res.sendFile(filePath)
}
