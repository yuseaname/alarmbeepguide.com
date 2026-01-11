import { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { CategoryCards } from './CategoryCards'
import { TopCommentsLeaderboard } from './TopCommentsLeaderboard'
import { SeasonalTipsModule } from './SeasonalTipsModule'
import { Shield, CheckCircle, Megaphone, Clock, CaretRight, SpeakerHigh, Warning } from '@phosphor-icons/react'
import { Card } from './ui/card'
import { Link } from './Link'
import { Badge } from './ui/badge'
import { getFeaturedBlogPosts, getAllBlogPosts } from '@/lib/blog'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { beepPatterns, type BeepPattern } from '@/lib/content'
import { categories } from '@/lib/seo'

type RiskTone = 'critical' | 'caution' | 'routine' | 'unknown'

type DiagnosticSnapshot = {
  riskTone: RiskTone
  riskLabel: string
  cause: string
  fixTime: string
  device: string
}

const riskToneClasses: Record<RiskTone, string> = {
  critical: 'border-destructive/30 bg-destructive/10 text-destructive',
  caution: 'border-accent/30 bg-accent/10 text-accent',
  routine: 'border-primary/30 bg-primary/10 text-primary',
  unknown: 'border-border bg-muted/50 text-muted-foreground'
}

const getDiagnosticSnapshot = (pattern?: BeepPattern): DiagnosticSnapshot => {
  if (!pattern) {
    return {
      riskTone: 'unknown',
      riskLabel: 'Awaiting input',
      cause: 'Select a pattern to see typical causes.',
      fixTime: 'Select a pattern to see the action window.',
      device: 'Select a pattern to identify device type.'
    }
  }

  const description = pattern.description.toLowerCase()
  let riskTone: RiskTone = 'routine'
  let riskLabel = 'Routine'
  let fixTime = 'Follow guide'

  if (description.includes('evacuate') || description.includes('fire') || description.includes('carbon monoxide')) {
    riskTone = 'critical'
    riskLabel = 'Critical'
    fixTime = 'Immediate action'
  } else if (description.includes('end of life')) {
    riskTone = 'caution'
    riskLabel = 'Service soon'
    fixTime = 'Replace unit'
  } else if (description.includes('wiring') || description.includes('obstruction')) {
    riskTone = 'caution'
    riskLabel = 'Check soon'
    fixTime = 'Inspect and test'
  } else if (description.includes('low battery')) {
    riskTone = 'routine'
    riskLabel = 'Routine'
    fixTime = 'Quick fix'
  }

  const causes: string[] = []
  if (description.includes('low battery')) causes.push('Low battery')
  if (description.includes('end of life')) causes.push('End of life sensor')
  if (description.includes('carbon monoxide')) causes.push('CO detected')
  if (description.includes('smoke') || description.includes('fire')) causes.push('Smoke or fire')
  if (description.includes('obstruction')) causes.push('Sensor obstruction')
  if (description.includes('wiring')) causes.push('Wiring issue')

  return {
    riskTone,
    riskLabel,
    cause: causes.length > 0 ? causes.join(' • ') : pattern.description,
    fixTime,
    device: pattern.device
  }
}

export function HomePage() {
  const featuredPosts = getFeaturedBlogPosts()
  const allPosts = getAllBlogPosts()
  const [searchQuery, setSearchQuery] = useState('')
  const [deviceFilter, setDeviceFilter] = useState<string>('all')
  const [activePatternId, setActivePatternId] = useState<string | null>(null)

  const devices = useMemo(() => Array.from(new Set(beepPatterns.map(p => p.device))), [])

  const filteredPatterns = useMemo(() => {
    return beepPatterns.filter(pattern => {
      const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pattern.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDevice = deviceFilter === 'all' || pattern.device === deviceFilter
      return matchesSearch && matchesDevice
    })
  }, [searchQuery, deviceFilter])

  useEffect(() => {
    if (activePatternId && !filteredPatterns.some(p => p.id === activePatternId)) {
      setActivePatternId(null)
    }
  }, [activePatternId, filteredPatterns])

  const activePattern = filteredPatterns.find(pattern => pattern.id === activePatternId)
  const diagnostics = getDiagnosticSnapshot(activePattern)
  const visiblePatterns = filteredPatterns.slice(0, 6)

  const openDecoder = () => {
    window.dispatchEvent(new CustomEvent('alarmbeepguide:open-beep-decoder'))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(14,116,144,0.18),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.9)_0%,_rgba(245,250,247,0.9)_65%,_rgba(232,244,240,0.95)_100%)]">
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-48 rounded-full border border-primary/10 bg-primary/5 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-12 h-64 w-64 rounded-full border border-accent/10 bg-accent/10 blur-3xl" aria-hidden="true" />

        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Diagnostic Command Center
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
                Decode Alarm Beeps &amp; Fix Safety Devices
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                Stop the chirps. Understand the alerts. Route your next step in seconds with plain-English
                guidance for smoke detectors, CO alarms, motion lights, and more.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="w-full text-base sm:w-auto"
                  onClick={openDecoder}
                >
                  <SpeakerHigh className="mr-2 h-5 w-5" weight="bold" />
                  Decode My Beep
                </Button>
                <Button size="lg" variant="outline" className="w-full text-base sm:w-auto" asChild>
                  <Link href="/search">Browse by Pattern</Link>
                </Button>
                <a
                  href="#categories"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background/80 px-5 text-sm font-semibold text-foreground transition hover:border-primary/40"
                >
                  Browse by Device
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-border/70 bg-background/70 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Patterns indexed</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{beepPatterns.length}</p>
                </Card>
                <Card className="border-border/70 bg-background/70 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Device pillars</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{categories.length}</p>
                </Card>
                <Card className="border-border/70 bg-background/70 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Guides published</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{allPosts.length}</p>
                </Card>
              </div>
            </div>

            <figure
              className="mb-6 overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-lg"
              data-slot-id="d54c62cf891c"
            >
              <img
                src="/images/generated/d54c62cf891c.png"
                alt="Photo of Decode Alarm Beeps & Fix Safety Devices"
                width={1600}
                height={900}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full"
                data-slot-id="d54c62cf891c"
              />
            </figure>
            <Card className="border-border/70 bg-card/80 p-6 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">System Status</p>
                  <p className="text-xs text-muted-foreground">Live diagnostic coverage</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  Live
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Pattern library</span>
                  <span className="font-semibold text-foreground">{beepPatterns.length} active</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Device coverage</span>
                  <span className="font-semibold text-foreground">{categories.length} pillars</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Resolution guides</span>
                  <span className="font-semibold text-foreground">{allPosts.length} published</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary" weight="fill" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Safety-first signals</p>
                    <p className="text-xs text-muted-foreground">
                      Clear escalation cues when alarms indicate danger.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div id="decoder" className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
            <Card className="relative overflow-hidden border-primary/20 bg-card/90 p-6 shadow-xl">
              <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full border border-primary/20 bg-primary/10 blur-2xl" aria-hidden="true" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Beep Decoder Core</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Scan a pattern, route the next step</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Visual mode keeps things lightweight. Open the full decoder to hear audio samples.
                  </p>
                  <figure
                    className="mt-4 overflow-hidden rounded-xl border border-primary/10 bg-background/60"
                    data-slot-id="f91f4f6b24d6"
                  >
                    <img
                      src="/images/generated/f91f4f6b24d6.png"
                      alt="Photo of Scan a pattern, route the next step"
                      width={1200}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full"
                      data-slot-id="f91f4f6b24d6"
                    />
                  </figure>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Waveform
                    </span>
                    <svg width="160" height="26" viewBox="0 0 160 26" className="text-primary/70">
                      <g fill="currentColor">
                        <rect x="2" y="12" width="6" height="12" rx="3" />
                        <rect x="14" y="6" width="6" height="18" rx="3" />
                        <rect x="26" y="2" width="6" height="22" rx="3" />
                        <rect x="38" y="10" width="6" height="14" rx="3" />
                        <rect x="50" y="4" width="6" height="20" rx="3" />
                        <rect x="62" y="8" width="6" height="16" rx="3" />
                        <rect x="74" y="12" width="6" height="12" rx="3" />
                        <rect x="86" y="5" width="6" height="19" rx="3" />
                        <rect x="98" y="3" width="6" height="21" rx="3" />
                        <rect x="110" y="9" width="6" height="15" rx="3" />
                        <rect x="122" y="6" width="6" height="18" rx="3" />
                        <rect x="134" y="12" width="6" height="12" rx="3" />
                        <rect x="146" y="8" width="6" height="16" rx="3" />
                      </g>
                    </svg>
                  </div>
                </div>
                <Badge variant="secondary" className="border border-primary/40 bg-primary/20 text-primary text-xs font-semibold uppercase tracking-[0.16em]">
                  Visual Mode
                </Badge>
              </div>

              {/* Accessibility labels improve screen-reader clarity without changing SEO content. */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search beep patterns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-primary/20 bg-background/90 focus-visible:ring-primary/40"
                    id="beep-search-homepage"
                    aria-label="Search beep patterns"
                  />
                </div>
                <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                  <SelectTrigger className="w-full border-primary/20 bg-background/90 sm:w-52" aria-label="Filter by device">
                    <SelectValue placeholder="Filter by device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    {devices.map(device => (
                      <SelectItem key={device} value={device}>{device}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 grid gap-3">
                {visiblePatterns.length > 0 ? (
                  visiblePatterns.map(pattern => {
                    const isActive = pattern.id === activePatternId
                    return (
                      <button
                        key={pattern.id}
                        type="button"
                        onClick={() => setActivePatternId(pattern.id)}
                        aria-pressed={isActive}
                        className={`w-full rounded-2xl border border-l-4 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isActive ? 'border-primary/70 border-l-primary bg-primary/10 shadow-md' : 'border-border/60 border-l-primary/40 bg-background/80 hover:border-primary/40 hover:shadow-sm'}`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground">{pattern.name}</h3>
                          <Badge variant="secondary" className="border border-primary/30 bg-primary/10 text-primary">
                            {pattern.device}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </button>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                    <SpeakerHigh className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No patterns match this search. Try a different device type or keyword.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {visiblePatterns.length} of {filteredPatterns.length} patterns
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button size="sm" onClick={openDecoder}>
                    Decode My Beep
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/search">Browse by Pattern</Link>
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid gap-4">
              <Card className="border-border/70 bg-background/80 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Warning className="h-4 w-4" weight="bold" />
                    Risk Level
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskToneClasses[diagnostics.riskTone]}`}>
                    {diagnostics.riskLabel}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Severity signals update when a pattern is selected.
                </p>
              </Card>

              <Card className="border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle className="h-4 w-4" weight="fill" />
                  Common Cause
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{diagnostics.cause}</p>
              </Card>

              <Card className="border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4" weight="bold" />
                  Fix Time
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{diagnostics.fixTime}</p>
              </Card>

              <Card className="border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <SpeakerHigh className="h-4 w-4" weight="bold" />
                  Common Devices
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{diagnostics.device}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section-surface">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="mb-12 text-center">
            <div className="header-vibe-band mx-auto max-w-3xl">
              <div className="header-vibe-inner">
                <div className="mb-4 flex justify-center">
                  <div className="kicker-pill">
                    Diagnostic flow
                  </div>
                </div>

                <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  Your 3-Step Alert Resolution Path
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  We turn beep patterns into safe, plain-English actions so you can move fast with confidence.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-hover relative p-7 text-center bg-card border border-border/70 shadow-md">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-extrabold shadow-md">
                  1
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Match the Pattern</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Use our beep decoder to identify your device's specific chirp, beep, or flash pattern.
              </p>
            </Card>

            <Card className="card-hover card-featured relative p-7 text-center shadow-xl md:-translate-y-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                  Most common
                </div>
              </div>

              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-extrabold shadow-md">
                  2
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Understand What It Means</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Get plain-English explanations—no technical jargon, just clear answers about what's happening.
              </p>
            </Card>

            <Card className="card-hover relative p-7 text-center bg-card border border-border/70 shadow-md md:translate-y-1">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-extrabold shadow-md">
                  3
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Fix It Safely</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Follow tested step-by-step solutions, with clear guidance on when to call a pro.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="categories" className="border-b border-border bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Route by Device Pillar
            </h2>
            <p className="text-muted-foreground">
              Find solutions organized by device type and problem area.
            </p>
          </div>
          <CategoryCards />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold text-foreground">Live Field Notes</h2>
            <p className="text-muted-foreground">Seasonal guidance and community fixes from real homeowners.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <SeasonalTipsModule />
            <TopCommentsLeaderboard />
          </div>
        </div>
      </section>

      <section className="section-surface">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
              <Megaphone className="h-8 w-8 text-primary" weight="duotone" />
            </div>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Why Homeowners Trust AlarmBeepGuide
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Clear answers, practical fixes, and safety-first guidance—without digging through manuals.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover card-featured p-6 shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">No Manuals Needed</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Skip the 80-page PDF. Get instant answers in plain English.
              </p>
            </Card>

            <Card className="card-hover p-6 bg-background/60 border shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">Tested Solutions</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every fix is verified and practical for real homeowners.
              </p>
            </Card>

            <Card className="card-hover p-6 bg-background/60 border shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">Safety-First</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Clear guidance on when DIY is safe and when to call a professional.
              </p>
            </Card>

            <Card className="card-hover p-6 bg-background/60 border shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">Always Updated</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We continuously update guides with the latest device information.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {featuredPosts.length > 0 && (
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
                <Megaphone className="h-3.5 w-3.5" weight="fill" />
                <span>RESOLUTION GUIDES</span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                Featured Troubleshooting Guides
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                In-depth, step-by-step solutions to the most common alarm and safety device problems.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <Card key={post.id} className="group relative flex flex-col overflow-hidden border-2 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                  <div className="absolute right-4 top-4 z-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary backdrop-blur-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <Badge variant="secondary" className="mb-4 border border-primary/20 bg-primary/5 text-xs font-medium text-primary">
                      Featured
                    </Badge>

                    <h3 className="mb-3 text-xl font-bold leading-tight text-foreground">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors group-hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" weight="bold" />
                        <span className="font-medium">{post.readTime} min read</span>
                      </div>
                      <span className="text-border">•</span>
                      <span>{formatDate(post.publishDate)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border bg-muted/30 p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full font-semibold transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                      asChild
                    >
                      <Link href={`/blog/${post.slug}`}>
                        Read Full Guide
                        <CaretRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" variant="outline" asChild className="group">
                <Link href="/blog">
                  View All {allPosts.length} Articles
                  <CaretRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl px-4 py-12 text-center md:py-16">
          <h2 className="mb-4 text-3xl font-bold">
            Stop Ignoring That Beep
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Safety alerts exist for a reason. Decode them in seconds, fix them with confidence.
          </p>
          <Button size="lg" variant="secondary" className="text-base px-8 py-6" onClick={openDecoder}>
            <SpeakerHigh className="mr-2 h-5 w-5" weight="bold" />
            Match Your Beep Pattern Now
          </Button>
        </div>
      </section>
    </div>
  )
}
