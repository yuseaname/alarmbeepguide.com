/**
 * Robots.txt Route
 * Serves the single build-generated robots.txt
 */

import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function findRobotsFile() {
  const candidates = [
    join(process.cwd(), 'dist', 'robots.txt'),
    join(__dirname, '../../dist/robots.txt'),
    join(__dirname, '../../hostinger-prebuilt/dist/robots.txt'),
    join(__dirname, '../../hostinger-deploy/dist/robots.txt'),
    join(__dirname, '../../public/robots.txt')
  ]

  return candidates.find(p => existsSync(p))
}

export function serveRobots(req, res) {
  const filePath = findRobotsFile()
  if (!filePath) {
    return res.type('text/plain').send('User-agent: *\nAllow: /\n')
  }

  res.header('Content-Type', 'text/plain')
  res.header('Cache-Control', 'public, max-age=86400')
  return res.sendFile(filePath)
}
