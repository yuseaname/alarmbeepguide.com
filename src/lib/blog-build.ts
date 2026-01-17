/**
 * Build-time blog post loader for Node.js scripts
 * Uses fs to read markdown files instead of Vite's ?raw imports
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  publishDate: string
  lastUpdated?: string
  readTime: number
  featured: boolean
  tags: string[]
  metaTitle: string
  metaDescription: string
  faqs?: { question: string; answer: string }[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function readMarkdownFile(relativePath: string): string {
  const fullPath = path.join(__dirname, '..', relativePath)
  return readFileSync(fullPath, 'utf-8')
}

// Read markdown content from files
const smokeDetectorLifespanContent = readMarkdownFile('content/blog/how-long-do-smoke-detectors-last.md')
const coDetectorReplacementContent = readMarkdownFile('content/blog/when-to-replace-a-carbon-monoxide-detector.md')
const smokeAlarmEolBeepContent = readMarkdownFile('content/blog/smoke-alarm-end-of-life-beeps.md')

export const blogPosts: BlogPost[] = [
  {
    id: 'smoke-detector-chirping-low-battery',
    slug: 'smoke-detector-chirping-low-battery',
    title: 'Why Is My Smoke Detector Chirping? The Low Battery Fix',
    excerpt: 'That single chirp every 30 seconds usually means low battery. Learn the safe fixes, the likely causes, and when to replace the unit.',
    content: `# Why Is My Smoke Detector Chirping? The Low Battery Fix

If your smoke detector is chirping once every 30 seconds, you are usually hearing a low battery warning. This is the most common alarm sound homeowners encounter, and the fix is typically straightforward. The chirp is meant to be a reminder, not a crisis alert.

## TWA – What This Guide Covers

- [What that chirp usually means](#what-that-chirp-usually-means)
- [How to tell a chirp from a full alarm](#how-to-tell-a-chirp-from-a-full-alarm)
- [Why chirping often happens at night](#why-chirping-often-happens-at-night)
- [Common detector types that chirp](#common-detector-types-that-chirp)
- [Chirp cadence variations](#chirp-cadence-variations)
- [How to find the chirping unit](#how-to-find-the-chirping-unit)
- [When it's usually safe to ignore](#when-its-usually-safe-to-ignore)
- [When to check further](#when-to-check-further)
- [The 5-minute fix](#the-5-minute-fix)
- [If chirping continues after battery change](#if-chirping-continues-after-battery-change)
- [Battery types and shelf life basics](#battery-types-and-shelf-life-basics)
- [Sealed battery alarms and replacements](#sealed-battery-alarms-and-replacements)
- [Hardwired vs battery-only alarms](#hardwired-vs-battery-only-alarms)
- [Hush button and temporary silencing](#hush-button-and-temporary-silencing)
- [Environmental factors that cause chirps](#environmental-factors-that-cause-chirps)
- [Interconnected system tips](#interconnected-system-tips)
- [Renters and shared homes](#renters-and-shared-homes)
- [Why the chirp returns after a reset](#why-the-chirp-returns-after-a-reset)
- [What a flashing light usually means](#what-a-flashing-light-usually-means)
- [Example troubleshooting flow](#example-troubleshooting-flow)
- [Storing spare batteries](#storing-spare-batteries)
- [Quick troubleshooting checklist](#quick-troubleshooting-checklist)
- [Replacement and end-of-life guidance](#replacement-and-end-of-life-guidance)
- [Related alarm guides](#related-alarm-guides)
- [FAQ](#faq)
- [Calm summary](#calm-summary)`,
    category: 'chirp-beep-codes',
    author: 'AlarmBeepGuide Editorial Team',
    publishDate: '2025-01-15',
    readTime: 12,
    featured: true,
    tags: ['smoke detector', 'chirping', 'low battery', 'troubleshooting', 'battery replacement', 'alarm maintenance'],
    metaTitle: 'Why Is My Smoke Detector Chirping? The Low Battery Fix | AlarmBeepGuide',
    metaDescription: 'Single chirp every 30 seconds? That\'s a low battery warning. Get the safe fix, understand the causes, and know when to replace.',
    faqs: [
      {
        question: 'Why does my smoke detector chirp once every 30 seconds?',
        answer: 'A single chirp every 30 seconds usually means the battery is low and needs to be replaced soon. The detector is still working, but the power is running out.'
      },
      {
        question: 'Can I ignore a chirping smoke detector?',
        answer: 'You should not ignore it for long. The detector is warning you that it may stop working entirely once the battery dies. Replace the battery as soon as you can.'
      },
      {
        question: 'Why does my smoke detector chirp only at night?',
        answer: 'Batteries deliver slightly less power in cooler temperatures. The detector senses the voltage drop and chirps. It is not actually worse at night; you just notice it more when it is quiet.'
      }
    ]
  },
  {
    id: 'how-long-do-smoke-detectors-last',
    slug: 'how-long-do-smoke-detectors-last',
    title: 'How Long Do Smoke Detectors Last? Replacement Guide',
    excerpt: 'Most smoke detectors last 10 years. Learn how to check your detector age, when to replace, and what the beeping patterns mean.',
    content: smokeDetectorLifespanContent,
    category: 'chirp-beep-codes',
    author: 'AlarmBeepGuide Editorial Team',
    publishDate: '2025-01-15',
    readTime: 10,
    featured: true,
    tags: ['smoke detector', 'lifespan', 'replacement', '10 year', 'maintenance', 'safety'],
    metaTitle: 'How Long Do Smoke Detectors Last? 10-Year Replacement Guide',
    metaDescription: 'Smoke detectors last about 10 years. Find your detector\'s age, decode replacement beeps, and know when it\'s time for a new unit.',
    faqs: [
      {
        question: 'How long do smoke detectors typically last?',
        answer: 'Most smoke detectors last about 10 years. After that, the sensor becomes less reliable and the unit should be replaced.'
      },
      {
        question: 'How do I know when my smoke detector needs to be replaced?',
        answer: 'Check the manufacture date on the back of the unit. If it is 10 years old or older, replace it. Many units also beep in a specific pattern when they reach end of life.'
      }
    ]
  },
  {
    id: 'when-to-replace-a-carbon-monoxide-detector',
    slug: 'when-to-replace-a-carbon-monoxide-detector',
    title: 'When to Replace a Carbon Monoxide Detector: Lifespan Guide',
    excerpt: 'CO detectors typically last 5-7 years. Learn how to check detector age, decode end-of-life beeps, and ensure your home stays protected.',
    content: coDetectorReplacementContent,
    category: 'chirp-beep-codes',
    author: 'AlarmBeepGuide Editorial Team',
    publishDate: '2025-01-15',
    readTime: 9,
    featured: true,
    tags: ['carbon monoxide', 'CO detector', 'replacement', 'lifespan', '7 year', 'safety'],
    metaTitle: 'When to Replace a Carbon Monoxide Detector: 5-7 Year Guide',
    metaDescription: 'CO detectors last 5-7 years. Find your detector\'s age, understand end-of-life beeps, and know exactly when to replace for safety.',
    faqs: [
      {
        question: 'How long do carbon monoxide detectors last?',
        answer: 'Most carbon monoxide detectors last between 5 and 7 years. Check the back of your unit for the manufacture date and replace it when it reaches that age.'
      },
      {
        question: 'What does it mean when my CO detector beeps 5 times?',
        answer: 'Five beeps often means the unit has reached end of life and needs to be replaced. Check your detector\'s manual for the specific beep pattern meanings.'
      }
    ]
  },
  {
    id: 'smoke-alarm-end-of-life-beeps',
    slug: 'smoke-alarm-end-of-life-beeps',
    title: 'Smoke Alarm End-of-Life Beeps: How to Tell It\'s Time to Replace',
    excerpt: 'Learn to recognize end-of-life beep patterns, check your alarm\'s age, and understand why 10-year replacement is critical for safety.',
    content: smokeAlarmEolBeepContent,
    category: 'chirp-beep-codes',
    author: 'AlarmBeepGuide Editorial Team',
    publishDate: '2025-01-15',
    readTime: 8,
    featured: false,
    tags: ['smoke alarm', 'end of life', 'replacement', 'beep patterns', '10 year', 'sensor degradation'],
    metaTitle: 'Smoke Alarm End-of-Life Beeps: Replacement Guide | AlarmBeepGuide',
    metaDescription: 'Decode end-of-life beep patterns, verify your alarm\'s age, and understand the 10-year replacement rule for maximum fire protection.',
    faqs: [
      {
        question: 'How do I know if my smoke alarm has reached end of life?',
        answer: 'Check the manufacture date on the back. If it is 10 years or older, replace it immediately. Many alarms also beep in a specific pattern (often 3 beeps) when they reach end of life.'
      },
      {
        question: 'Why do smoke alarms only last 10 years?',
        answer: 'The sensor inside the alarm degrades over time and becomes less effective at detecting smoke. After 10 years, the alarm may fail to detect a fire, so replacement is essential for safety.'
      }
    ]
  }
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getBlogPostsByCategory(categoryId: string): BlogPost[] {
  return blogPosts.filter(post => post.category === categoryId)
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured)
}
