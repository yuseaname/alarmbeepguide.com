import { useState } from 'react'
import { SpeakerHigh, X } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Card } from './ui/card'
import { beepPatterns } from '@/lib/content'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export function BeepMatcherWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deviceFilter, setDeviceFilter] = useState<string>('all')

  const devices = Array.from(new Set(beepPatterns.map(p => p.device)))

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

            <div className="space-y-3">
              {filteredPatterns.length > 0 ? (
                filteredPatterns.map(pattern => (
                  <Card key={pattern.id} className="p-4 hover:border-primary/50 transition-colors">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{pattern.name}</h3>
                      <Badge variant="secondary">{pattern.device}</Badge>
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