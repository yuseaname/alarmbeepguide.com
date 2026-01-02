import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import { blogPosts } from '../src/lib/blog'
import { generateSitemap, generateRobotsTxt } from '../src/lib/seo'

type OutputTarget = {
  dir: string
  label: string
}

const targets: OutputTarget[] = [
  { dir: path.join(process.cwd(), 'public'), label: 'root/public' },
  { dir: path.join(process.cwd(), 'hostinger-deploy', 'public'), label: 'hostinger-deploy/public' },
  { dir: path.join(process.cwd(), 'hostinger-prebuilt', 'public'), label: 'hostinger-prebuilt/public' }
]

async function writeTextFile(filePath: string, contents: string) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, contents, 'utf8')
}

async function main() {
  const sitemapXml = generateSitemap(blogPosts)
  const robotsTxt = generateRobotsTxt()

  await Promise.all(
    targets.flatMap(t => [
      writeTextFile(path.join(t.dir, 'sitemap.xml'), sitemapXml),
      writeTextFile(path.join(t.dir, 'robots.txt'), robotsTxt)
    ])
  )

  // eslint-disable-next-line no-console
  console.log(`Generated sitemap.xml + robots.txt for: ${targets.map(t => t.label).join(', ')}`)
}

await main()
