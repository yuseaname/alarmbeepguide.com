import { useState, useEffect } from 'react'
import { SpeakerHigh, X, Play, SpeakerLow, SpeakerSlash } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Card } from './ui/card'
import { beepPatterns } from '@/lib/content'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { audioGenerator } from '@/lib/audio'
import { toast } from 'sonner'
function useLocalStorageNumber(key: string, defaultValue: number) {
  const [value, setValueState] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultValue
    const stored = window.localStorage.getItem(key)
    if (stored === null) return defaultValue
    const parsed = Number(stored)
    return Number.isFinite(parsed) ? parsed : defaultValue
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, String(value))
    } catch {
      // Ignore storage errors (e.g., private mode or quota).
    }
  }, [key, value])

  const setValue = (next: number | ((prev: number) => number)) => {
    setValueState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      return Number.isFinite(resolved) ? resolved : prev
    })
  }

  return [value, setValue] as const
}

export function BeepMatcherWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deviceFilter, setDeviceFilter] = useState<string>('all')
  const [playingPattern, setPlayingPattern] = useState<string | null>(null)
  const [volume, setVolume] = useLocalStorageNumber('beep-volume', 50)

  const devices = Array.from(new Set(beepPatterns.map(p => p.device)))

  useEffect(() => {
    const open = () => setIsOpen(true)
    window.addEventListener('alarmbeepguide:open-beep-decoder', open)
    return () => window.removeEventListener('alarmbeepguide:open-beep-decoder', open)
  }, [])

  useEffect(() => {
    audioGenerator.setVolume((volume ?? 50) / 100)
  }, [volume])

  const handleVolumeChange = (value: number[]) => {
    setVolume(() => value[0])
  }

  const getVolumeIcon = () => {
    const volumeValue = volume ?? 50
    if (volumeValue === 0) return SpeakerSlash
    if (volumeValue < 50) return SpeakerLow
    return SpeakerHigh
  }

  const VolumeIcon = getVolumeIcon()

  const handlePlayAudio = async (patternType: string, patternName: string) => {
    try {
      setPlayingPattern(patternType)
      await audioGenerator.playPattern(patternType)
      toast.success(`Playing: ${patternName}`)
      setTimeout(() => setPlayingPattern(null), 3000)
    } catch (error) {
      toast.error('Unable to play audio sample')
      setPlayingPattern(null)
    }
  }

  const filteredPatterns = beepPatterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDevice = deviceFilter === 'all' || pattern.device === deviceFilter
    return matchesSearch && matchesDevice
  })

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform md:h-auto md:w-auto md:rounded-lg md:px-6"
        size="icon"
      >
        <SpeakerHigh className="h-6 w-6 md:mr-2" weight="bold" />
        <span className="hidden md:inline">Decode My Beep</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <SpeakerHigh className="h-6 w-6 text-primary" weight="bold" />
              Beep Pattern Decoder
            </DialogTitle>
            <DialogDescription>
              Match your alarm's beep pattern to find out what it means and how to fix it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search beep patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  id="beep-search"
                />
              </div>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-full sm:w-48">
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

            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <VolumeIcon className="h-5 w-5 text-muted-foreground shrink-0" weight="fill" />
              <Slider
                value={[volume ?? 50]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
                id="volume-control"
              />
              <span className="text-sm font-medium text-muted-foreground w-10 text-right">{volume ?? 50}%</span>
            </div>

            <div className="space-y-3">
              {filteredPatterns.length > 0 ? (
                filteredPatterns.map(pattern => (
                  <Card key={pattern.id} className="p-4 hover:border-primary/50 transition-colors">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{pattern.name}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlayAudio(pattern.pattern, pattern.name)}
                          disabled={playingPattern === pattern.pattern}
                          className="shrink-0"
                        >
                          <Play className="h-4 w-4 mr-1" weight="fill" />
                          {playingPattern === pattern.pattern ? 'Playing...' : 'Listen'}
                        </Button>
                        <Badge variant="secondary">{pattern.device}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </Card>
                ))
              ) : (
                <div className="py-12 text-center">
                  <SpeakerHigh className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No beep patterns match your search. Try different keywords or device type.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
